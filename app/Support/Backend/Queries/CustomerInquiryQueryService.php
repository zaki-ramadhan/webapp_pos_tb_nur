<?php

namespace App\Support\Backend\Queries;

use App\Domain\Partner\Models\Customer;
use App\Domain\Support\Models\OperationDocument;
use App\Support\Backend\Queries\Concerns\HasQueryHelpers;
use Carbon\Carbon;

class CustomerInquiryQueryService
{
    use HasQueryHelpers;

    /**
     * @param  array<string, mixed>  $filters
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginateReceivables(array $filters)
    {
        $customerId = $filters['customer_id'] ?? null;

        if (empty($customerId)) {
            return $this->paginateRows(collect(), $filters);
        }

        $customer = Customer::find((int) $customerId);
        if (! $customer) {
            return $this->paginateRows(collect(), $filters);
        }

        $startDate = $this->resolveDateFilter($filters['start_date'] ?? null);
        $endDate = $this->resolveDateFilter($filters['end_date'] ?? null);

        $allTransactions = collect();

        // 1. Process Opening Balance Rows from customer extended_details
        $details = $customer->extended_details;
        if (is_array($details) && isset($details['openingBalanceRows']) && is_array($details['openingBalanceRows'])) {
            foreach ($details['openingBalanceRows'] as $idx => $row) {
                $rawDate = $row['date'] ?? null;
                $dateObj = $this->resolveDateFilter($rawDate) ?: Carbon::now();

                $rawAmt = $row['amount'] ?? 0;
                if (is_string($rawAmt)) {
                    $rawAmt = (float) preg_replace('/[^\d.]/', '', str_replace(',', '.', $rawAmt));
                }
                $amount = (float) $rawAmt;

                $docNum = trim((string) ($row['number'] ?? ''));
                if ($docNum === '') {
                    $docNum = sprintf('SI.%s.%s.%05d', $dateObj->format('Y'), $dateObj->format('m'), $idx + 1);
                }

                $notes = trim((string) ($row['notes'] ?? ''));
                $desc = $notes !== '' ? $notes : "Saldo Awal pelanggan {$customer->name}";

                $allTransactions->push([
                    'id' => 'ob-' . $idx,
                    'document_id' => null,
                    'document_type' => 'sales_invoice',
                    'date_obj' => $dateObj,
                    'source_number' => $docNum,
                    'transaction_type' => 'Faktur Penjualan',
                    'description' => $desc,
                    'net_amount' => $amount,
                    'sort_order' => 1,
                ]);
            }
        }

        // 2. Process Operation Documents for customer
        $documents = OperationDocument::with('relatedDocument')
            ->where('customer_id', $customer->id)
            ->whereIn('document_type', [
                'sales_invoice',
                'sales_receipt',
                'sales_deposit',
                'sales_return',
                'general_journal',
                'cash_receipt',
                'cash_payment',
            ])
            ->where(function ($query) {
                $query->whereNull('status')
                    ->orWhereNotIn('status', ['Void', 'Cancelled']);
            })
            ->orderBy('entry_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        foreach ($documents as $doc) {
            $docDate = $doc->entry_date ? Carbon::parse($doc->entry_date)->startOfDay() : Carbon::now();
            $netAmount = $this->calculateDocMutation($doc);
            $txTypeLabel = $this->getTxTypeLabel($doc->document_type);
            $description = $doc->notes ?: $this->getDefaultDescription($doc, $customer->name);

            $allTransactions->push([
                'id' => $doc->id,
                'document_id' => $doc->id,
                'document_type' => $doc->document_type,
                'date_obj' => $docDate,
                'source_number' => $doc->document_number,
                'transaction_type' => $txTypeLabel,
                'description' => $description,
                'net_amount' => $netAmount,
                'sort_order' => 2,
            ]);
        }

        // 3. Sort all transactions chronologically
        $sortedTransactions = $allTransactions->sortBy([
            ['date_obj', 'asc'],
            ['sort_order', 'asc'],
            ['id', 'asc'],
        ])->values();

        // 4. Split by start_date / end_date & calculate running balance
        $runningBalance = 0.0;
        $inRangeTransactions = collect();

        foreach ($sortedTransactions as $tx) {
            /** @var Carbon $txDate */
            $txDate = $tx['date_obj'];

            if ($startDate && $txDate->lt($startDate)) {
                $runningBalance += (float) $tx['net_amount'];
                continue;
            }

            if ($endDate && $txDate->gt($endDate->endOfDay())) {
                continue;
            }

            $inRangeTransactions->push($tx);
        }

        // 5. Output Rows
        $outputRows = collect();

        // Row 1: Saldo per [StartDate] (Blank date and source_number to match Accurate template)
        $startLabel = $startDate ? $startDate->format('d/m/Y') : Carbon::now()->startOfMonth()->format('d/m/Y');
        $outputRows->push([
            'id' => 'opening-balance',
            'document_id' => null,
            'document_type' => null,
            'date' => '',
            'date_label' => '',
            'source_number' => '',
            'transaction_type' => sprintf('Saldo per %s', $startLabel),
            'description' => sprintf('Saldo per %s', $startLabel),
            'amount' => 0,
            'mutation' => 0,
            'balance' => $runningBalance,
            'is_opening_balance' => true,
        ]);

        // Subsequent Rows
        foreach ($inRangeTransactions as $tx) {
            $netAmount = (float) $tx['net_amount'];
            $runningBalance += $netAmount;
            $formattedDate = $tx['date_obj']->format('d/m/Y');

            $outputRows->push([
                'id' => $tx['id'],
                'document_id' => $tx['document_id'],
                'document_type' => $tx['document_type'],
                'date' => $formattedDate,
                'date_label' => $formattedDate,
                'source_number' => $tx['source_number'],
                'transaction_type' => $tx['transaction_type'],
                'description' => $tx['description'],
                'amount' => $netAmount,
                'mutation' => $netAmount,
                'balance' => $runningBalance,
                'is_opening_balance' => false,
            ]);
        }

        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        if ($search !== '') {
            $outputRows = $outputRows->filter(function (array $row) use ($search): bool {
                if ($row['is_opening_balance']) {
                    return true;
                }
                return str_contains(mb_strtolower((string) $row['source_number']), $search) ||
                    str_contains(mb_strtolower((string) $row['transaction_type']), $search) ||
                    str_contains(mb_strtolower((string) $row['description']), $search);
            });
        }

        return $this->paginateRows($outputRows->values(), $filters);
    }

    protected function calculateDocMutation(OperationDocument $doc): float
    {
        $total = (float) $doc->total_amount;

        return match ($doc->document_type) {
            'sales_invoice' => $total,
            'sales_receipt', 'sales_return', 'sales_deposit' => -$total,
            'cash_receipt' => -$total,
            'cash_payment' => $total,
            default => $total,
        };
    }

    protected function getTxTypeLabel(string $docType): string
    {
        return match ($docType) {
            'sales_invoice' => 'Faktur Penjualan',
            'sales_receipt' => 'Penerimaan Penjualan',
            'sales_deposit' => 'Uang Muka Penjualan',
            'sales_return' => 'Retur Penjualan',
            'general_journal' => 'Jurnal Umum',
            'cash_receipt' => 'Penerimaan Kas',
            'cash_payment' => 'Pembayaran Kas',
            default => ucwords(str_replace('_', ' ', $docType)),
        };
    }

    protected function getDefaultDescription(OperationDocument $doc, string $customerName): string
    {
        $refDocNumber = $doc->relatedDocument?->document_number ?? $doc->reference_number ?? $doc->document_number;

        return match ($doc->document_type) {
            'sales_invoice' => "Faktur Penjualan Ke {$customerName}",
            'sales_receipt' => "Pembayaran No. Faktur {$refDocNumber}",
            'sales_deposit' => "Uang Muka Penjualan Ke {$customerName}",
            'sales_return' => "Retur Penjualan Ke {$customerName}",
            default => "Transaksi {$doc->document_number}",
        };
    }
}
