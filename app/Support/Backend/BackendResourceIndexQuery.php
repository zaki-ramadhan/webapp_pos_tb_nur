<?php

namespace App\Support\Backend;

use App\Models\User;
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
        $modelInstance = new $modelClass();
        $tableName = $modelInstance->getTable();
        $search = trim((string) ($filters['search'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? request()->input('page', 1)));
        $perPage = max(1, min((int) ($filters['per_page'] ?? 25), 1000));

        if (! Schema::hasTable($tableName)) {
            return new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage, $page);
        }

        $query = $modelClass::query()->with($blueprint->with);

        $user = auth()->user();
        if ($user && ! $user->isPrivileged() && ! $user->hasAnyRoleCodes(['super_admin', 'owner', 'admin'])) {
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

        if ($blueprint->key === 'users') {
            $developerEmails = User::DEVELOPER_EMAILS;
            $isSuperAdminActor = $user && ($user->isSystemAdmin() || in_array(strtolower((string) $user->email), $developerEmails, true));

            if (! $isSuperAdminActor) {
                $query->whereNotIn('users.email', $developerEmails);
            }
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
            $blacklistedColumns = [
                'password',
                'remember_token',
                'two_factor_secret',
                'two_factor_recovery_codes',
                'secret',
                'api_token',
                'token',
            ];

            if (in_array(strtolower($key), $blacklistedColumns, true)) {
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

        $this->applySorting($query, $tableName, $filters);

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

    /**
     * @param array<string, mixed> $filters
     */
    private function applySorting(Builder $query, string $tableName, array $filters): void
    {
        $sortBy = trim((string) ($filters['sort_by'] ?? ''));
        $sortDir = strtolower((string) ($filters['sort_direction'] ?? $filters['sort_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

        if ($sortBy === '') {
            $this->applyDefaultSort($query, $tableName);
            return;
        }

        // Aliases kamus kolom frontend ke backend
        $columnMap = [
            'documentNumber' => 'document_number',
            'number' => 'document_number',
            'entryDate' => 'entry_date',
            'date' => 'entry_date',
            'transDate' => 'entry_date',
            'documentDate' => 'document_date',
            'totalAmount' => 'total_amount',
            'total' => 'total_amount',
            'amount' => 'total_amount',
            'paidAmount' => 'paid_amount',
            'paid' => 'paid_amount',
            'outstandingAmount' => 'outstanding_amount',
            'outstanding' => 'outstanding_amount',
            'statusLabel' => 'status',
            'paymentStatus' => 'status',
            'dueDate' => 'due_date',
            'notes' => 'notes',
            'itemCode' => 'code',
            'itemName' => 'name',
            'sellingPrice' => 'default_selling_price',
            'purchasePrice' => 'default_purchase_price',
            'price' => 'default_selling_price',
            'stock' => 'stock',
            'accountCode' => 'code',
            'accountName' => 'name',
            'accountType' => 'account_type',
            'customerCode' => 'code',
            'customerName' => 'name',
            'supplierCode' => 'code',
            'supplierName' => 'name',
            'employeeCode' => 'code',
            'employeeName' => 'name',
            'loggedAt' => 'occurred_at',
            'actionLabel' => 'action',
            'transactionTypeLabel' => 'resource_key',
            'referenceName' => 'description',
        ];

        $snakeKey = $columnMap[$sortBy] ?? \Illuminate\Support\Str::snake($sortBy);

        // Relasi relasional khusus untuk sorting tabel operation_documents
        if ($tableName === 'operation_documents') {
            if (in_array($sortBy, ['customer', 'customerName', 'customer_name'], true)) {
                $query->leftJoin('customers', 'operation_documents.customer_id', '=', 'customers.id')
                      ->orderBy('customers.name', $sortDir)
                      ->select("{$tableName}.*");
                return;
            }
            if (in_array($sortBy, ['supplier', 'supplierName', 'supplier_name'], true)) {
                $query->leftJoin('suppliers', 'operation_documents.supplier_id', '=', 'suppliers.id')
                      ->orderBy('suppliers.name', $sortDir)
                      ->select("{$tableName}.*");
                return;
            }
            if (in_array($sortBy, ['user', 'userName', 'responsible_user', 'responsibleUser'], true)) {
                $query->leftJoin('users', 'operation_documents.responsible_user_id', '=', 'users.id')
                      ->orderBy('users.name', $sortDir)
                      ->select("{$tableName}.*");
                return;
            }
            if (in_array($sortBy, ['branch', 'branchName'], true)) {
                $query->leftJoin('branches', 'operation_documents.branch_id', '=', 'branches.id')
                      ->orderBy('branches.name', $sortDir)
                      ->select("{$tableName}.*");
                return;
            }
        }

        // Relasi relasional untuk tabel products
        if ($tableName === 'products') {
            if (in_array($sortBy, ['category', 'categoryName', 'category_name'], true)) {
                $categoryCol = Schema::hasColumn('products', 'category_id') ? 'category_id' : 'product_category_id';
                $query->leftJoin('product_categories', "products.{$categoryCol}", '=', 'product_categories.id')
                      ->orderBy('product_categories.name', $sortDir)
                      ->select("{$tableName}.*");
                return;
            }
            if (in_array($sortBy, ['sellingPrice', 'selling_price', 'salePrice', 'sale_price', 'price'], true)) {
                $priceCol = Schema::hasColumn('products', 'default_sale_price') ? 'default_sale_price' : 'default_selling_price';
                $query->orderBy("{$tableName}.{$priceCol}", $sortDir);
                return;
            }
            if (in_array($sortBy, ['unit', 'unitName', 'unit_name'], true)) {
                $query->leftJoin('units', 'products.base_unit_id', '=', 'units.id')
                      ->orderBy('units.name', $sortDir)
                      ->select("{$tableName}.*");
                return;
            }
            if (in_array($sortBy, ['brand', 'brandName', 'brand_name'], true)) {
                $query->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
                      ->orderBy('brands.name', $sortDir)
                      ->select("{$tableName}.*");
                return;
            }
        }

        // Relasi relasional untuk tabel employees
        if ($tableName === 'employees' && in_array($sortBy, ['department', 'departmentName', 'department_name'], true)) {
            $query->leftJoin('departments', 'employees.department_id', '=', 'departments.id')
                  ->orderBy('departments.name', $sortDir)
                  ->select("{$tableName}.*");
            return;
        }

        // Kolom langsung pada tabel
        if (Schema::hasColumn($tableName, $snakeKey)) {
            $query->orderBy("{$tableName}.{$snakeKey}", $sortDir);
            return;
        }

        if (Schema::hasColumn($tableName, $sortBy)) {
            $query->orderBy("{$tableName}.{$sortBy}", $sortDir);
            return;
        }

        if (Schema::hasColumn($tableName, "{$snakeKey}_date")) {
            $query->orderBy("{$tableName}.{$snakeKey}_date", $sortDir);
            return;
        }

        if (Schema::hasColumn($tableName, "{$snakeKey}_amount")) {
            $query->orderBy("{$tableName}.{$snakeKey}_amount", $sortDir);
            return;
        }

        if (Schema::hasColumn($tableName, "{$snakeKey}_id")) {
            $query->orderBy("{$tableName}.{$snakeKey}_id", $sortDir);
            return;
        }

        $this->applyDefaultSort($query, $tableName);
    }

    private function applyDefaultSort(Builder $query, string $tableName): void
    {
        if (Schema::hasColumn($tableName, 'entry_date')) {
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
    }
}
