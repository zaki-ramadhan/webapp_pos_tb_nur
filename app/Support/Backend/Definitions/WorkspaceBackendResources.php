<?php

namespace App\Support\Backend\Definitions;

use App\Domain\Sales\Models\SalesCheckin;
use App\Domain\Support\Models\ActivityLog;
use App\Domain\Support\Models\PreferenceSetting;
use App\Domain\Support\Models\ReportCatalog;
use App\Support\Backend\BackendResourceBlueprint;
use App\Support\Backend\Queries\BankInquiryQueryService;
use App\Support\Backend\Queries\InventoryInquiryQueryService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class WorkspaceBackendResources
{
    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function definitions(): array
    {
        return [
            'preferences' => new BackendResourceBlueprint(
                key: 'preferences',
                label: 'Preference Settings',
                permissionKey: 'preferences',
                searchColumns: ['group_key', 'setting_key', 'scope_type', 'scope_key', 'label', 'notes'],
                modelClass: PreferenceSetting::class,
                storeRules: [
                    'group_key' => ['required', 'string', 'max:80'],
                    'setting_key' => ['required', 'string', 'max:120'],
                    'scope_type' => ['nullable', 'string', 'max:80'],
                    'scope_key' => ['nullable', 'string', 'max:120'],
                    'label' => ['nullable', 'string', 'max:255'],
                    'data_type' => ['nullable', 'string', 'max:40'],
                    'value' => ['sometimes'],
                    'is_active' => ['sometimes', 'boolean'],
                    'notes' => ['nullable', 'string'],
                ],
                updateRules: [
                    'group_key' => ['required', 'string', 'max:80'],
                    'setting_key' => ['required', 'string', 'max:120'],
                    'scope_type' => ['nullable', 'string', 'max:80'],
                    'scope_key' => ['nullable', 'string', 'max:120'],
                    'label' => ['nullable', 'string', 'max:255'],
                    'data_type' => ['nullable', 'string', 'max:40'],
                    'value' => ['sometimes'],
                    'is_active' => ['sometimes', 'boolean'],
                    'notes' => ['nullable', 'string'],
                ],
            ),
            'sales-checkins' => new BackendResourceBlueprint(
                key: 'sales-checkins',
                label: 'Sales Checkins',
                permissionKey: 'sales-checkin',
                searchColumns: ['checkin_number', 'transaction_name', 'notes'],
                modelClass: SalesCheckin::class,
                with: ['branch', 'department', 'customer', 'salesUser', 'relatedDocument'],
                storeRules: [
                    'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
                    'department_id' => ['nullable', 'integer', 'exists:departments,id'],
                    'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
                    'sales_user_id' => ['nullable', 'integer', 'exists:users,id'],
                    'related_document_id' => ['nullable', 'integer', 'exists:operation_documents,id'],
                    'checkin_number' => ['required', 'string', 'max:120', 'unique:sales_checkins,checkin_number'],
                    'transaction_name' => ['nullable', 'string', 'max:120'],
                    'checked_in_at' => ['required', 'date'],
                    'notes' => ['nullable', 'string'],
                    'metadata' => ['sometimes', 'array'],
                ],
                updateRules: fn (Model $record) => [
                    'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
                    'department_id' => ['nullable', 'integer', 'exists:departments,id'],
                    'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
                    'sales_user_id' => ['nullable', 'integer', 'exists:users,id'],
                    'related_document_id' => ['nullable', 'integer', 'exists:operation_documents,id'],
                    'checkin_number' => ['required', 'string', 'max:120', Rule::unique('sales_checkins', 'checkin_number')->ignore($record)],
                    'transaction_name' => ['nullable', 'string', 'max:120'],
                    'checked_in_at' => ['required', 'date'],
                    'notes' => ['nullable', 'string'],
                    'metadata' => ['sometimes', 'array'],
                ],
            ),
            'report-lists' => new BackendResourceBlueprint(
                key: 'report-lists',
                label: 'Report Catalogs',
                permissionKey: 'report-list',
                searchColumns: ['category_key', 'section_key', 'report_key', 'title', 'section_label', 'description'],
                modelClass: ReportCatalog::class,
                storeRules: [
                    'category_key' => ['required', 'string', 'max:80'],
                    'section_key' => ['nullable', 'string', 'max:80'],
                    'report_key' => ['required', 'string', 'max:120', 'unique:report_catalogs,report_key'],
                    'title' => ['required', 'string', 'max:255'],
                    'section_label' => ['nullable', 'string', 'max:255'],
                    'icon' => ['nullable', 'string', 'max:60'],
                    'description' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'sort_order' => ['sometimes', 'integer', 'min:0'],
                    'metadata' => ['sometimes', 'array'],
                ],
                updateRules: fn (Model $record) => [
                    'category_key' => ['required', 'string', 'max:80'],
                    'section_key' => ['nullable', 'string', 'max:80'],
                    'report_key' => ['required', 'string', 'max:120', Rule::unique('report_catalogs', 'report_key')->ignore($record)],
                    'title' => ['required', 'string', 'max:255'],
                    'section_label' => ['nullable', 'string', 'max:255'],
                    'icon' => ['nullable', 'string', 'max:60'],
                    'description' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'sort_order' => ['sometimes', 'integer', 'min:0'],
                    'metadata' => ['sometimes', 'array'],
                ],
            ),
            'activity-logs' => self::logResource('activity-logs', 'Activity Logs', 'activity-log'),
            'journal-activity-logs' => self::logResource('journal-activity-logs', 'Journal Activity Logs', 'journal-activity-log', 'journal'),
            'bank-statements' => self::bankResource(
                'bank-statements',
                'Bank Statements',
                'bank-statement',
                fn (array $filters) => app(BankInquiryQueryService::class)->paginateStatement($filters),
            ),
            'bank-histories' => self::bankResource(
                'bank-histories',
                'Bank Histories',
                'bank-history',
                fn (array $filters) => app(BankInquiryQueryService::class)->paginateHistory($filters),
            ),
            'bank-reconciliations' => self::bankResource(
                'bank-reconciliations',
                'Bank Reconciliations',
                'bank-reconciliation',
                fn (array $filters) => app(BankInquiryQueryService::class)->paginateReconciliation($filters),
            ),
            'item-locations' => self::inventoryInquiryResource(
                'item-locations',
                'Item Locations',
                'item-location',
                fn (array $filters) => app(InventoryInquiryQueryService::class)->paginateItemLocations($filters),
            ),
            'minimum-stocks' => self::inventoryInquiryResource(
                'minimum-stocks',
                'Minimum Stocks',
                'minimum-stock',
                fn (array $filters) => app(InventoryInquiryQueryService::class)->paginateMinimumStocks($filters),
            ),
        ];
    }

    private static function logResource(
        string $key,
        string $label,
        string $permissionKey,
        ?string $group = null,
    ): BackendResourceBlueprint {
        return new BackendResourceBlueprint(
            key: $key,
            label: $label,
            permissionKey: $permissionKey,
            modelClass: ActivityLog::class,
            with: ['actorUser'],
            indexRules: [
                'action' => ['nullable', 'string', 'max:20'],
                'resource_key' => ['nullable', 'string', 'max:120'],
                'actor_user_id' => ['nullable', 'integer', 'exists:users,id'],
                'date_from' => ['nullable', 'date'],
                'date_to' => ['nullable', 'date'],
            ],
            indexUsing: function (array $filters) use ($group) {
                $query = ActivityLog::query()
                    ->with('actorUser')
                    ->when($group !== null, fn ($builder) => $builder->where('log_group', $group))
                    ->when(filled($filters['search'] ?? null), fn ($builder) => $builder->search((string) $filters['search']))
                    ->when(filled($filters['action'] ?? null), fn ($builder) => $builder->where('action', (string) $filters['action']))
                    ->when(filled($filters['resource_key'] ?? null), fn ($builder) => $builder->where('resource_key', (string) $filters['resource_key']))
                    ->when(filled($filters['actor_user_id'] ?? null), fn ($builder) => $builder->where('actor_user_id', (int) $filters['actor_user_id']))
                    ->when(filled($filters['date_from'] ?? null), fn ($builder) => $builder->whereDate('occurred_at', '>=', (string) $filters['date_from']))
                    ->when(filled($filters['date_to'] ?? null), fn ($builder) => $builder->whereDate('occurred_at', '<=', (string) $filters['date_to']))
                    ->orderByDesc('occurred_at')
                    ->orderByDesc('id');

                $perPage = max(1, min((int) ($filters['per_page'] ?? 15), 100));

                return $query->paginate($perPage)->withQueryString();
            },
            readOnly: true,
        );
    }

    private static function bankResource(
        string $key,
        string $label,
        string $permissionKey,
        \Closure $indexUsing,
    ): BackendResourceBlueprint {
        return new BackendResourceBlueprint(
            key: $key,
            label: $label,
            permissionKey: $permissionKey,
            modelClass: ActivityLog::class,
            indexRules: [
                'account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                'start_date' => ['nullable', 'date'],
                'end_date' => ['nullable', 'date'],
            ],
            indexUsing: $indexUsing,
            showUsing: self::unsupportedShow(),
            readOnly: true,
        );
    }

    private static function inventoryInquiryResource(
        string $key,
        string $label,
        string $permissionKey,
        \Closure $indexUsing,
    ): BackendResourceBlueprint {
        return new BackendResourceBlueprint(
            key: $key,
            label: $label,
            permissionKey: $permissionKey,
            modelClass: ReportCatalog::class,
            indexRules: [
                'product_id' => ['nullable', 'integer', 'exists:products,id'],
                'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
                'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
                'as_of_date' => ['nullable', 'date'],
            ],
            indexUsing: $indexUsing,
            showUsing: self::unsupportedShow(),
            readOnly: true,
        );
    }

    private static function unsupportedShow(): \Closure
    {
        return static function (int $record): never {
            throw new NotFoundHttpException('This backend resource does not support detail lookup.');
        };
    }
}
