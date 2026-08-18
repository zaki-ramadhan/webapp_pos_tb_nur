<?php

namespace App\Support\Backend;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

class BackendResourceIndexQuery
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(BackendResourceBlueprint $blueprint, array $filters): LengthAwarePaginator|array
    {
        $customResult = $blueprint->runIndex($filters);

        if ($customResult !== null) {
            return $customResult;
        }

        $modelClass = $blueprint->modelClass();
        $search = trim((string) ($filters['search'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? request()->input('page', 1)));
        $perPage = max(1, min((int) ($filters['per_page'] ?? 15), 1000));
        $query = $modelClass::query()->with($blueprint->with);

        $user = auth()->user();
        if ($user && ! $user->hasAnyRoleCodes(['super_admin'])) {
            $modelInstance = new $modelClass();
            $tableName = $modelInstance->getTable();
            if (Schema::hasColumn($tableName, 'branch_id')) {
                if ($user->branches()->exists()) {
                    $allowedBranchIds = $user->branches->pluck('id')->toArray();
                    $query->whereIn("{$tableName}.branch_id", $allowedBranchIds);
                }
            }
        }

        if ($search !== '') {
            $this->applySearch($query, $search, $blueprint->searchColumns);
        }

        if ($blueprint->key === 'sales-deposits' && filter_var($filters['only_available'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $query->where('outstanding_amount', '>', 0)
                  ->whereNotIn('status', ['Void', 'Cancelled']);
        }

        $modelInstance = new $modelClass();
        $tableName = $modelInstance->getTable();
        foreach ($filters as $key => $value) {
            if (in_array($key, ['search', 'per_page', 'page', 'only_available', 'sort_by', 'sort_direction', 'sort_dir', '_refresh', '_'], true)) {
                continue;
            }
            if ($key === 'exclude_type' && Schema::hasColumn($tableName, 'account_type')) {
                if (is_array($value)) {
                    $query->whereNotIn("{$tableName}.account_type", $value);
                } else {
                    $query->where("{$tableName}.account_type", '!=', $value);
                }
                continue;
            }
            if ($key === 'exclude_id' && Schema::hasColumn($tableName, 'id')) {
                if (empty($value) && $value !== 0 && $value !== '0') {
                    continue;
                }
                if ($tableName === 'accounts' && !is_array($value)) {
                    $targetId = (int) $value;
                    if ($targetId <= 0) {
                        continue;
                    }
                    if (filter_var($filters['exclude_children'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
                        $childIds = \Illuminate\Support\Facades\DB::table('accounts')->where('parent_id', $targetId)->pluck('id')->all();
                        $excludedIds = array_merge([$targetId], $childIds);
                        $query->whereNotIn("{$tableName}.id", $excludedIds);
                    } else {
                        $query->where("{$tableName}.id", '!=', $targetId);
                    }
                } elseif (is_array($value)) {
                    $validIds = array_filter(array_map('intval', $value), fn ($id) => $id > 0);
                    if (!empty($validIds)) {
                        $query->whereNotIn("{$tableName}.id", $validIds);
                    }
                } else {
                    $targetId = (int) $value;
                    if ($targetId > 0) {
                        $query->where("{$tableName}.id", '!=', $targetId);
                    }
                }
                continue;
            }
            if (Schema::hasColumn($tableName, $key)) {
                if (is_array($value)) {
                    $query->whereIn("{$tableName}.{$key}", $value);
                } else {
                    $query->where("{$tableName}.{$key}", $value);
                }
            }
        }

        $sortBy = (string) ($filters['sort_by'] ?? '');
        $sortDir = strtolower((string) ($filters['sort_direction'] ?? $filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        if ($sortBy !== '' && Schema::hasColumn($tableName, $sortBy)) {
            $query->orderBy("{$tableName}.{$sortBy}", $sortDir);
        } elseif (Schema::hasColumn($tableName, 'entry_date')) {
            $query->orderByDesc("{$tableName}.entry_date")
                  ->orderByDesc("{$tableName}.id");
        } elseif (Schema::hasColumn($tableName, 'document_date')) {
            $query->orderByDesc("{$tableName}.document_date")
                  ->orderByDesc("{$tableName}.id");
        } elseif ($tableName === 'accounts') {
            $query->orderBy("{$tableName}.code", 'asc');
        } elseif (Schema::hasColumn($tableName, 'name')) {
            $query->orderBy("{$tableName}.name", 'asc')
                  ->orderBy("{$tableName}.id", 'asc');
        } else {
            $query->orderByDesc("{$tableName}.id");
        }

        $paginator = $query
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        if ($blueprint->key === 'products') {
            $items = $paginator->items();
            $productIds = collect($items)->pluck('id')->all();
            if (count($productIds) > 0) {
                $totals = app(\App\Support\Backend\Queries\InventoryInquiryQueryService::class)
                    ->buildStockTotalsByProduct($productIds);

                foreach ($items as $product) {
                    $stockData = $totals[$product->id] ?? ['stock_on_hand' => 0.0, 'stock_available' => 0.0];
                    $product->setAttribute('stock_on_hand', $stockData['stock_on_hand']);
                    $product->setAttribute('stock_available', $stockData['stock_available']);
                }
            }
        }

        if (in_array($blueprint->key, ['payroll-entries', 'expense-entries'], true)) {
            $items = $paginator->items();
            $docIds = collect($items)->pluck('id')->all();
            if (count($docIds) > 0) {
                $payments = \Illuminate\Support\Facades\DB::table('operation_documents')
                    ->where('document_type', 'cash_payment')
                    ->whereIn('related_document_id', $docIds)
                    ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                    ->groupBy('related_document_id')
                    ->select('related_document_id', \Illuminate\Support\Facades\DB::raw('SUM(total_amount) as total_paid'))
                    ->pluck('total_paid', 'related_document_id')
                    ->all();

                foreach ($items as $doc) {
                    $paid = (float) ($payments[$doc->id] ?? 0.0);
                    $docTotal = (float) $doc->total_amount;
                    $outstanding = max(0.00, round($docTotal - $paid, 2));

                    if ($paid <= 0.00) {
                        $computedStatus = 'Sedang diproses';
                    } elseif ($outstanding <= 0.01) {
                        $computedStatus = 'Terbayar';
                    } else {
                        $computedStatus = 'Sebagian dibayar';
                    }

                    if ($doc->status !== $computedStatus || (float) $doc->paid_amount !== $paid) {
                        \Illuminate\Support\Facades\DB::table('operation_documents')
                            ->where('id', $doc->id)
                            ->update([
                                'paid_amount' => $paid,
                                'outstanding_amount' => $outstanding,
                                'status' => $computedStatus,
                            ]);
                    }

                    $doc->setAttribute('paid_amount', $paid);
                    $doc->setAttribute('outstanding_amount', $outstanding);
                    $doc->setAttribute('status', $computedStatus);
                }
            }
        }

        return $paginator;
    }

    /**
     * @param  array<int, string>  $searchColumns
     */
    protected function applySearch(Builder $query, string $keyword, array $searchColumns): void
    {
        $tableName = $query->getModel()->getTable();
        if ($searchColumns === []) {
            $searchColumns = array_values(array_filter(
                ['code', 'name', 'document_number', 'notes', 'description', 'email', 'phone', 'barcode'],
                fn ($col) => Schema::hasColumn($tableName, $col)
            ));
        }

        if ($searchColumns === []) {
            return;
        }

        if (method_exists($query->getModel(), 'scopeSearch')) {
            $query->search($keyword, $searchColumns);

            return;
        }

        $query->where(function (Builder $builder) use ($keyword, $searchColumns, $tableName): void {
            foreach ($searchColumns as $index => $column) {
                $fullCol = "{$tableName}.{$column}";
                if ($index === 0) {
                    $builder->where($fullCol, 'like', "%{$keyword}%");
                    continue;
                }

                $builder->orWhere($fullCol, 'like', "%{$keyword}%");
            }
        });
    }
}
