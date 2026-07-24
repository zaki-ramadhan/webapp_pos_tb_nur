<?php

use App\Http\Controllers\Api\BackendResourceController;
use Illuminate\Support\Facades\Route;

Route::prefix('backend')->middleware(['web', 'auth', 'throttle:api'])->group(function (): void {
    Route::post('/attachments/upload', [\App\Http\Controllers\Api\AttachmentUploadController::class, 'upload']);
    Route::post('/currencies/sync', [BackendResourceController::class, 'syncCurrencies']);
    Route::get('/banks', function (): \Illuminate\Http\JsonResponse {
        $cacheKey = 'indonesian_banks_list';

      // 1. Kembalikan cache jika sudah ada (0 ms)

        $cached = \Illuminate\Support\Facades\Cache::get($cacheKey);
        if (is_array($cached) && !empty($cached)) {
            return response()->json($cached);
        }

        $defaultBanks = [
            ['name' => 'Bank Central Asia (BCA)', 'code' => '014'],
            ['name' => 'Bank Mandiri', 'code' => '008'],
            ['name' => 'Bank Rakyat Indonesia (BRI)', 'code' => '002'],
            ['name' => 'Bank Negara Indonesia (BNI)', 'code' => '009'],
            ['name' => 'Bank Syariah Indonesia (BSI)', 'code' => '451'],
            ['name' => 'Bank Tabungan Negara (BTN)', 'code' => '200'],
            ['name' => 'Bank CIMB Niaga', 'code' => '022'],
            ['name' => 'Bank Danamon', 'code' => '011'],
            ['name' => 'Bank Permata', 'code' => '013'],
            ['name' => 'Bank Maybank Indonesia', 'code' => '016'],
            ['name' => 'Bank Mega', 'code' => '426'],
            ['name' => 'Bank OCBC NISP', 'code' => '028'],
            ['name' => 'Bank Panin', 'code' => '019'],
            ['name' => 'Bank BTPN', 'code' => '213'],
            ['name' => 'Bank Jago', 'code' => '542'],
            ['name' => 'Bank Neo Commerce', 'code' => '490'],
            ['name' => 'Bank Seabank Indonesia', 'code' => '535'],
        ];

      // 2. Coba fetch eksternal secara efisien (timeout ultra-pendek 1.5 detik & non-blocking)

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(1.5)
                ->get('https://raw.githubusercontent.com/riod94/list-bank-indonesia/master/bank.json');

            if ($response->successful() && is_array($response->json())) {
                $remoteBanks = array_map(static function (array $item): array {
                    return [
                        'name' => $item['name'] ?? '',
                        'code' => $item['code'] ?? '',
                    ];
                }, $response->json());

                if (!empty($remoteBanks)) {
                    \Illuminate\Support\Facades\Cache::put($cacheKey, $remoteBanks, now()->addDays(7));
                    return response()->json($remoteBanks);
                }
            }
        } catch (\Throwable $e) {
          // Abaikan kesalahan koneksi luar agar tidak pernah memblokir UI pengguna

        }

        \Illuminate\Support\Facades\Cache::put($cacheKey, $defaultBanks, now()->addDays(1));
        return response()->json($defaultBanks);
    });
    Route::get('/live-updates', [BackendResourceController::class, 'liveUpdates']);
    Route::get('/resources', [BackendResourceController::class, 'resources']);
    Route::get('/employees/{employee}/last-payroll-line', function ($employeeId) {
        $line = \App\Domain\Support\Models\OperationDocumentLine::query()
            ->whereHas('document', function ($query) {
                $query->where('document_type', 'payroll_entry');
            })
            ->where('attributes->employee_id', $employeeId)
            ->latest('id')
            ->first();

        return response()->json([
            'data' => $line ? [
                'gross_income' => (float)$line->unit_price,
                'tax_amount' => (float)$line->tax_amount,
                'total_amount' => (float)$line->total_amount,
                'attributes' => $line->attributes,
            ] : null
        ]);
    });
    Route::post('/bank-reconciliations/reconcile', [BackendResourceController::class, 'reconcileDocuments']);
    Route::post('/{resource}/import', [BackendResourceController::class, 'import']);
    Route::get('/{resource}', [BackendResourceController::class, 'index']);
    Route::post('/{resource}', [BackendResourceController::class, 'store']);
    Route::get('/{resource}/{record}', [BackendResourceController::class, 'show'])->whereNumber('record');
    Route::match(['put', 'patch'], '/{resource}/{record}', [BackendResourceController::class, 'update'])->whereNumber('record');
    Route::delete('/{resource}/{record}', [BackendResourceController::class, 'destroy'])->whereNumber('record');
});
