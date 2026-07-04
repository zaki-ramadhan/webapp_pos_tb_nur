<?php

namespace App\Support\Backend;

use App\Domain\Support\Models\ActivityLog;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class BackendActivityLogger
{
    /**
     * @return array<string, mixed>
     */
    public function snapshot(Model $record): array
    {
        return Arr::except(
            $record->attributesToArray(),
            ['created_at', 'updated_at', 'deleted_at'],
        );
    }

    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     */
    public function logMutation(
        BackendResourceBlueprint $blueprint,
        string $action,
        Model $record,
        ?array $before = null,
        ?array $after = null,
    ): void {
        if (! Schema::hasTable('activity_logs')) {
            return;
        }

        if ($record instanceof ActivityLog || in_array($blueprint->key, ['activity-logs', 'journal-activity-logs'], true)) {
            return;
        }

        $user = Auth::user();
        $metadata = [
            'resource_model' => $record::class,
        ];
        $transactionDate = $this->resolveTransactionDate($record, $after, $before);

        if ($transactionDate !== null) {
            $metadata['transaction_date'] = $transactionDate;
        }

        ActivityLog::query()->create([
            'log_group' => $this->resolveLogGroup($blueprint, $record),
            'resource_key' => $blueprint->key,
            'resource_label' => $blueprint->label,
            'permission_key' => $blueprint->permissionKey(),
            'action' => $action,
            'subject_type' => $record::class,
            'subject_id' => $record->getKey(),
            'subject_label' => $this->resolveSubjectLabel($record),
            'document_number' => $this->resolveDocumentNumber($record),
            'description' => $this->resolveDescription($action, $blueprint, $record),
            'actor_user_id' => $user?->getKey(),
            'actor_name' => $user?->name,
            'actor_email' => $user?->email,
            'ip_address' => request()->ip(),
            'occurred_at' => now(),
            'before_payload' => $before,
            'after_payload' => $after,
            'metadata' => $metadata,
        ]);
    }

    protected function resolveLogGroup(BackendResourceBlueprint $blueprint, Model $record): string
    {
        $journalKeys = [
            'general-journal',
            'cash-payment',
            'cash-receipt',
            'bank-transfer',
            'payment-order',
            'expense-entry',
            'payroll-entry',
            'sales-receipt',
            'purchase-payment',
            'budget',
            'budget-monitor',
            'budget-transfer',
        ];

        if (in_array($blueprint->permissionKey(), $journalKeys, true)) {
            return 'journal';
        }

        if (filled($record->getAttribute('primary_account_id')) || filled($record->getAttribute('secondary_account_id'))) {
            return 'journal';
        }

        return 'workspace';
    }

    protected function resolveDocumentNumber(Model $record): ?string
    {
        foreach (['document_number', 'checkin_number', 'employee_code', 'code', 'rule_name', 'report_key', 'setting_key', 'name'] as $field) {
            $value = $record->getAttribute($field);

            if (filled($value)) {
                return (string) $value;
            }
        }

        return null;
    }

    protected function resolveSubjectLabel(Model $record): ?string
    {
        foreach (['full_name', 'name', 'rule_name', 'title', 'label', 'document_number', 'checkin_number', 'employee_code', 'code', 'report_key', 'setting_key'] as $field) {
            $value = $record->getAttribute($field);

            if (filled($value)) {
                return (string) $value;
            }
        }

        return null;
    }

    protected function resolveDescription(string $action, BackendResourceBlueprint $blueprint, Model $record): string
    {
        $actionMap = [
            'create' => 'Buat',
            'update' => 'Ubah',
            'delete' => 'Hapus',
            'void' => 'Batalkan',
            'post' => 'Posting',
            'unpost' => 'Batal Posting',
            'approve' => 'Setujui',
            'reject' => 'Tolak',
        ];
        $actionStr = $actionMap[strtolower($action)] ?? ucfirst($action);

        $resourceMap = [
            'brands' => 'Merek',
            'units' => 'Satuan',
            'products' => 'Barang & Jasa',
            'expense-entries' => 'Pencatatan Beban',
            'payroll-entries' => 'Pencatatan Gaji',
            'accounts' => 'Akun Perkiraan',
            'bank-inquiries' => 'Rekonsiliasi Bank',
            'bank-transfers' => 'Transfer Bank',
            'business-partners' => 'Mitra Bisnis',
            'cash-payments' => 'Pembayaran Kas & Bank',
            'cash-receipts' => 'Penerimaan Kas & Bank',
            'currencies' => 'Mata Uang',
            'departments' => 'Departemen',
            'group-accesses' => 'Hak Akses',
            'inventory-adjustments' => 'Penyesuaian Persediaan',
            'item-categories' => 'Kategori Barang & Jasa',
            'item-requests' => 'Permintaan Barang',
            'salary-allowances' => 'Tunjangan & Gaji',
            'sales-checkins' => 'Kunjungan Sales',
            'sales-commissions' => 'Komisi Penjualan',
            'sales-deposits' => 'Uang Muka Penjualan',
            'sales-documents' => 'Dokumen Penjualan',
            'sales-receipts' => 'Penerimaan Penjualan',
            'supplier-prices' => 'Harga Pemasok',
            'transaction-approvals' => 'Persetujuan Transaksi',
            'users-managements' => 'Manajemen Pengguna',
            'warehouses' => 'Gudang',
            'users' => 'Pengguna',
            'employees' => 'Karyawan',
            'budgets' => 'Anggaran',
            'general-journals' => 'Jurnal Umum',
        ];

        $subject = $this->resolveSubjectLabel($record);
        if ($subject === null) {
            $normLabel = strtolower(trim($blueprint->label));
            $subject = $resourceMap[$blueprint->key] ?? ($resourceMap[$normLabel] ?? $blueprint->label);
        }

        return sprintf('%s %s', $actionStr, $subject);
    }

    /**
     * @param  array<string, mixed>|null  $after
     * @param  array<string, mixed>|null  $before
     */
    protected function resolveTransactionDate(Model $record, ?array $after = null, ?array $before = null): ?string
    {
        foreach ($this->transactionDateCandidateFields() as $field) {
            $resolved = $this->normalizeDateValue($record->getAttribute($field));

            if ($resolved !== null) {
                return $resolved;
            }
        }

        foreach ([$after, $before] as $payload) {
            if (! is_array($payload)) {
                continue;
            }

            foreach ($this->transactionDateCandidateFields() as $field) {
                $resolved = $this->normalizeDateValue($payload[$field] ?? null);

                if ($resolved !== null) {
                    return $resolved;
                }
            }
        }

        return null;
    }

    /**
     * @return list<string>
     */
    protected function transactionDateCandidateFields(): array
    {
        return [
            'document_date',
            'entry_date',
            'checked_in_at',
            'joined_at',
            'purchase_date',
            'usage_date',
            'expense_date',
            'opening_balance_date',
            'effective_date',
            'shipping_date',
            'check_date',
            'due_date',
            'line_date',
            'date',
        ];
    }

    protected function normalizeDateValue(mixed $value): ?string
    {
        if ($value instanceof CarbonInterface) {
            return $value->toDateString();
        }

        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        if (! filled($value)) {
            return null;
        }

        if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1) {
            return $value;
        }

        if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/', $value) === 1) {
            return substr($value, 0, 10);
        }

        try {
            return Carbon::parse((string) $value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
}
