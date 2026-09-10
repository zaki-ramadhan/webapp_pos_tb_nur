<?php

namespace App\Http\Controllers\Api;

use App\Domain\Finance\Models\Account;
use App\Domain\Finance\Models\BankStatementMutation;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BankStatementController extends Controller
{
    public function importFile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'max:10240'],
            'account_number' => ['nullable', 'string', 'max:100'],
            'account_id' => ['nullable'],
            'bank_name' => ['nullable', 'string', 'max:150'],
            'parsed_rows' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            $fileName = $request->file('file')?->getClientOriginalName() ?? 'file';
            return response()->json([
                'success' => false,
                'message' => "Gagal impor file mutasi {$fileName} . " . $validator->errors()->first(),
            ], 422);
        }

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $ext = strtolower($file->getClientOriginalExtension());

        if (! in_array($ext, ['csv', 'xlsx', 'xls', 'txt'], true)) {
            return response()->json([
                'success' => false,
                'message' => "Gagal impor file mutasi {$fileName} . Format file tidak didukung. Gunakan .CSV, .XLSX, atau .XLS.",
            ], 422);
        }

        $expectedAccountNumber = trim((string) ($request->input('account_number') ?? ''));
        $accountId = $request->input('account_id') ? (int) $request->input('account_id') : null;
        $bankName = trim((string) ($request->input('bank_name') ?? ''));

        // If account_number not provided explicitly, try resolve from account_id
        if ($expectedAccountNumber === '' && $accountId) {
            $account = Account::find($accountId);
            if ($account && ! empty($account->cash_bank_reference)) {
                $expectedAccountNumber = trim((string) $account->cash_bank_reference);
            }
        }

        $cleanExpected = preg_replace('/[^0-9a-zA-Z]/', '', $expectedAccountNumber);

        // Read file contents to inspect header / metadata
        $fileRealPath = $file->getRealPath();
        $rawContent = @file_get_contents($fileRealPath) ?: '';

        // 1. Check if the file explicitly declares a bank account number in header lines
        $detectedAccountNumber = null;
        if (preg_match('/(?:nomor\s*rekening|no\.?\s*rek(?:ening)?|account\s*(?:no\.?|number)|rekening)\s*[:=;,]?\s*([0-9\-\.]{4,})/i', $rawContent, $matches)) {
            $detectedAccountNumber = preg_replace('/[^0-9a-zA-Z]/', '', $matches[1]);
        }

        if ($detectedAccountNumber !== null && $cleanExpected !== '' && $detectedAccountNumber !== $cleanExpected) {
            return response()->json([
                'success' => false,
                'message' => "Gagal impor file mutasi {$fileName} . Nomor rekening tidak sama dengan internet banking",
            ], 422);
        }

        // 2. If an expected account number is specified, verify that the file contains it
        if ($cleanExpected !== '') {
            $cleanRaw = preg_replace('/[^0-9a-zA-Z]/', '', $rawContent);
            if (! str_contains($cleanRaw, $cleanExpected)) {
                return response()->json([
                    'success' => false,
                    'message' => "Gagal impor file mutasi {$fileName} . Nomor rekening tidak sama dengan internet banking",
                ], 422);
            }
        }

        // 3. Resolve transaction rows (either from parsed_rows sent by SheetJS or parsed from CSV)
        $rows = [];
        $parsedRowsInput = $request->input('parsed_rows');
        if (! empty($parsedRowsInput)) {
            $decoded = json_decode($parsedRowsInput, true);
            if (is_array($decoded)) {
                $rows = $decoded;
            }
        }

        // Fallback to basic CSV parsing if rows not sent from frontend
        if (empty($rows) && in_array($ext, ['csv', 'txt'], true)) {
            $rows = $this->parseCsvRows($fileRealPath);
        }

        if (empty($rows)) {
            return response()->json([
                'success' => false,
                'message' => "Gagal impor file mutasi {$fileName} . Format file mutasi tidak sesuai dengan internet banking",
            ], 422);
        }

        // 4. Save mutations atomically
        DB::transaction(function () use ($rows, $accountId, $expectedAccountNumber, $bankName, $fileName): void {
            $currentBalance = 0;
            $lastMutation = BankStatementMutation::query()
                ->where('bank_account_number', $expectedAccountNumber)
                ->orderByDesc('transaction_date')
                ->orderByDesc('id')
                ->first();

            if ($lastMutation) {
                $currentBalance = (float) $lastMutation->balance;
            }

            foreach ($rows as $row) {
                $amt = abs((float) ($row['amount'] ?? 0));
                $rawType = strtoupper(trim((string) ($row['type'] ?? 'CR')));
                $type = in_array($rawType, ['DB', 'DEBIT', 'DEBET', 'D', 'KELUAR'], true) ? 'DB' : 'CR';

                if ($type === 'CR') {
                    $currentBalance += $amt;
                } else {
                    $currentBalance -= $amt;
                }

                $rowBalance = isset($row['balance']) && is_numeric($row['balance'])
                    ? (float) $row['balance']
                    : $currentBalance;

                $transDate = ! empty($row['date']) ? date('Y-m-d', strtotime((string) $row['date'])) : now()->toDateString();
                $desc = trim((string) ($row['description'] ?? 'Mutasi Bank'));

                BankStatementMutation::create([
                    'account_id' => $accountId ?: null,
                    'bank_account_number' => $expectedAccountNumber,
                    'bank_name' => $bankName,
                    'import_file_name' => $fileName,
                    'transaction_date' => $transDate,
                    'description' => $desc,
                    'amount' => $amt,
                    'type' => $type,
                    'balance' => $rowBalance,
                    'status' => 'Unreconciled',
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'File mutasi berhasil diimpor.',
            'count' => count($rows),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function parseCsvRows(string $filePath): array
    {
        $handle = @fopen($filePath, 'r');
        if (! $handle) return [];

        $rows = [];
        $headerFound = false;
        $dateIdx = 0;
        $descIdx = 1;
        $amtIdx = 2;
        $typeIdx = 3;

        while (($data = fgetcsv($handle, 2048, ',')) !== false) {
            if (! $headerFound) {
                foreach ($data as $idx => $cell) {
                    $c = strtolower(trim((string) $cell));
                    if (str_contains($c, 'tanggal') || str_contains($c, 'date')) $dateIdx = $idx;
                    if (str_contains($c, 'keterangan') || str_contains($c, 'desc')) $descIdx = $idx;
                    if (str_contains($c, 'mutasi') || str_contains($c, 'amount') || str_contains($c, 'nominal')) $amtIdx = $idx;
                    if (str_contains($c, 'tipe') || str_contains($c, 'type')) $typeIdx = $idx;
                }
                $headerFound = true;
                continue;
            }

            if (empty($data[$dateIdx]) && empty($data[$descIdx])) continue;

            $rows[] = [
                'date' => $data[$dateIdx] ?? '',
                'description' => $data[$descIdx] ?? '',
                'amount' => (float) preg_replace('/[^0-9.]/', '', str_replace(',', '.', (string) ($data[$amtIdx] ?? 0))),
                'type' => strtoupper(trim((string) ($data[$typeIdx] ?? 'CR'))),
            ];
        }

        fclose($handle);
        return $rows;
    }
}
