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
            'product-opening-stocks' => self::inventoryInquiryResource(
                'product-opening-stocks',
                'Product Opening Stocks',
                'item-location',
                fn (array $filters) => app(InventoryInquiryQueryService::class)->paginateProductOpeningStocks($filters),
            ),
            'minimum-stocks' => self::inventoryInquiryResource(
                'minimum-stocks',
                'Minimum Stocks',
                'minimum-stock',
                fn (array $filters) => app(InventoryInquiryQueryService::class)->paginateMinimumStocks($filters),
            ),
            'product-mutations' => self::inventoryInquiryResource(
                'product-mutations',
                'Product Mutations',
                'minimum-stock',
                fn (array $filters) => app(InventoryInquiryQueryService::class)->paginateProductMutations($filters),
            ),
            'customer-receivables' => self::customerInquiryResource(
                'customer-receivables',
                'Customer Receivables',
                'customer',
                fn (array $filters) => app(\App\Support\Backend\Queries\CustomerInquiryQueryService::class)->paginateReceivables($filters),
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
                    ->when(filled($filters['date_to'] ?? null), fn ($builder) => $builder->whereDate('occurred_at', '<=', (string) $filters['date_to']));

                $sortBy = (string) ($filters['sort_by'] ?? '');
                $sortDir = strtolower((string) ($filters['sort_direction'] ?? $filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

                if ($sortBy === 'userName' || $sortBy === 'actor_name' || $sortBy === 'user') {
                    $query->leftJoin('users', 'activity_logs.actor_user_id', '=', 'users.id')
                          ->orderBy('users.name', $sortDir)
                          ->select('activity_logs.*');
                } elseif ($sortBy === 'email' || $sortBy === 'actor_email') {
                    $query->leftJoin('users', 'activity_logs.actor_user_id', '=', 'users.id')
                          ->orderBy('users.email', $sortDir)
                          ->select('activity_logs.*');
                } elseif ($sortBy === 'referenceName' || $sortBy === 'description' || $sortBy === 'subject_label') {
                    $query->orderBy('activity_logs.description', $sortDir);
                } elseif ($sortBy === 'actionLabel' || $sortBy === 'action') {
                    $query->orderBy('activity_logs.action', $sortDir);
                } elseif ($sortBy === 'transactionTypeLabel' || $sortBy === 'transactionTypeValue' || $sortBy === 'resource' || $sortBy === 'resource_key') {
                    $query->orderBy('activity_logs.resource_key', $sortDir);
                } elseif ($sortBy === 'loggedAt' || $sortBy === 'date' || $sortBy === 'dateValue' || $sortBy === 'occurred_at') {
                    $query->orderBy('activity_logs.occurred_at', $sortDir);
                } else {
                    $query->orderByDesc('activity_logs.occurred_at')
                          ->orderByDesc('activity_logs.id');
                }

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
                'start_date' => ['nullable', 'string'],
                'end_date' => ['nullable', 'string'],
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
                'as_of_date' => ['nullable', 'string'],
                'date_from' => ['nullable', 'string'],
                'date_to' => ['nullable', 'string'],
                'require_target' => ['nullable'],
            ],
            indexUsing: $indexUsing,
            showUsing: self::unsupportedShow(),
            readOnly: true,
        );
    }

    private static function customerInquiryResource(
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
                'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
                'start_date' => ['nullable', 'string'],
                'end_date' => ['nullable', 'string'],
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
