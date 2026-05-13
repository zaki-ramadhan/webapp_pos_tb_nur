<?php

namespace App\Support\Backend;

use App\Domain\Support\Models\ActivityLog;
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
            'metadata' => [
                'resource_model' => $record::class,
            ],
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
        foreach (['document_number', 'checkin_number', 'code', 'report_key', 'setting_key', 'name'] as $field) {
            $value = $record->getAttribute($field);

            if (filled($value)) {
                return (string) $value;
            }
        }

        return null;
    }

    protected function resolveSubjectLabel(Model $record): ?string
    {
        foreach (['name', 'title', 'label', 'document_number', 'checkin_number', 'code', 'report_key', 'setting_key'] as $field) {
            $value = $record->getAttribute($field);

            if (filled($value)) {
                return (string) $value;
            }
        }

        return null;
    }

    protected function resolveDescription(string $action, BackendResourceBlueprint $blueprint, Model $record): string
    {
        $subject = $this->resolveSubjectLabel($record) ?? $blueprint->label;

        return sprintf('%s %s', ucfirst($action), $subject);
    }
}
