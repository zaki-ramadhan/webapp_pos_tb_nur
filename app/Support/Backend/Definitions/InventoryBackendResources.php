<?php

namespace App\Support\Backend\Definitions;

use App\Domain\Inventory\Models\ItemRequest;
use App\Domain\Inventory\Models\StockOpnameOrder;
use App\Domain\Inventory\Models\StockOpnameResult;
use App\Domain\Inventory\Models\StockTransfer;
use App\Support\Backend\BackendRelationSync;
use App\Support\Backend\BackendResourceBlueprint;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class InventoryBackendResources
{
    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function definitions(): array
    {
        return [
            'item-requests' => new BackendResourceBlueprint(
                key: 'item-requests',
                label: 'Item Requests',
                permissionKey: 'item-request',
                searchColumns: ['document_number', 'request_type', 'status', 'notes'],
                modelClass: ItemRequest::class,
                with: ['branch', 'lines.product', 'lines.unit', 'lines.department'],
                storeRules: self::itemRequestRules(),
                updateRules: fn (Model $record) => self::itemRequestRules($record),
                syncUsing: function (Model $record, array $payload): void {
                    self::syncLines(
                        $record,
                        $payload,
                        ['product_id', 'unit_id', 'department_id', 'item_name', 'item_code', 'quantity', 'line_date', 'notes', 'attributes', 'sort_order'],
                        fn (array $row): bool => filled($row['product_id'] ?? null) || filled($row['item_name'] ?? null),
                    );
                },
            ),
            'stock-transfers' => new BackendResourceBlueprint(
                key: 'stock-transfers',
                label: 'Stock Transfers',
                permissionKey: 'stock-transfer',
                searchColumns: ['document_number', 'reference_number', 'process_type', 'status', 'notes'],
                modelClass: StockTransfer::class,
                with: ['branch', 'warehouse', 'counterpartWarehouse', 'lines.product', 'lines.unit'],
                storeRules: self::stockTransferRules(),
                updateRules: fn (Model $record) => self::stockTransferRules($record),
                syncUsing: function (Model $record, array $payload): void {
                    self::syncLines(
                        $record,
                        $payload,
                        ['product_id', 'unit_id', 'item_name', 'item_code', 'quantity', 'notes', 'attributes', 'sort_order'],
                        fn (array $row): bool => filled($row['product_id'] ?? null) || filled($row['item_name'] ?? null),
                    );
                },
            ),
            'stock-opname-orders' => new BackendResourceBlueprint(
                key: 'stock-opname-orders',
                label: 'Stock Opname Orders',
                permissionKey: 'stock-opname-order',
                searchColumns: ['document_number', 'status', 'notes'],
                modelClass: StockOpnameOrder::class,
                with: [
                    'branch',
                    'department',
                    'warehouse',
                    'productCategory',
                    'brand',
                    'supplier',
                    'responsibleUser',
                    'workers',
                    'lines.product',
                    'lines.unit',
                ],
                storeRules: self::stockOpnameOrderRules(),
                updateRules: fn (Model $record) => self::stockOpnameOrderRules($record),
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('worker_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'workers', $payload['worker_ids']);
                    }

                    self::syncLines(
                        $record,
                        $payload,
                        ['product_id', 'unit_id', 'item_name', 'item_code', 'system_quantity', 'counted_quantity', 'notes', 'attributes', 'sort_order'],
                        fn (array $row): bool => filled($row['product_id'] ?? null) || filled($row['item_name'] ?? null),
                    );
                },
            ),
            'stock-opname-results' => new BackendResourceBlueprint(
                key: 'stock-opname-results',
                label: 'Stock Opname Results',
                permissionKey: 'stock-opname-result',
                searchColumns: ['document_number', 'reference_number', 'notes'],
                modelClass: StockOpnameResult::class,
                with: ['branch', 'warehouse', 'opnameOrder', 'lines.product', 'lines.unit'],
                storeRules: self::stockOpnameResultRules(),
                updateRules: fn (Model $record) => self::stockOpnameResultRules($record),
                syncUsing: function (Model $record, array $payload): void {
                    self::syncLines(
                        $record,
                        $payload,
                        ['product_id', 'unit_id', 'item_name', 'item_code', 'counted_quantity', 'notes', 'attributes', 'sort_order'],
                        fn (array $row): bool => filled($row['product_id'] ?? null) || filled($row['item_name'] ?? null),
                    );
                },
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function itemRequestRules(?Model $record = null): array
    {
        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'document_number' => self::documentNumberRule('inventory_documents', $record),
            'request_type' => ['required', 'string', 'max:80'],
            'numbering_type' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:80'],
            'document_date' => ['required', 'date'],
            'effective_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'is_closed' => ['sometimes', 'boolean'],
            'metadata' => ['sometimes', 'array'],
            'lines' => ['sometimes', 'array'],
            ...self::lineRules('lines', true, false, true),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function stockTransferRules(?Model $record = null): array
    {
        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id', 'different:counterpart_warehouse_id'],
            'counterpart_warehouse_id' => ['required', 'integer', 'exists:warehouses,id', 'different:warehouse_id'],
            'document_number' => self::documentNumberRule('inventory_documents', $record),
            'reference_number' => ['nullable', 'string', 'max:120'],
            'process_type' => ['required', 'string', 'max:80'],
            'numbering_type' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:80'],
            'document_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'metadata' => ['sometimes', 'array'],
            'lines' => ['sometimes', 'array', 'min:1'],
            ...self::lineRules('lines', true, false, false),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function stockOpnameOrderRules(?Model $record = null): array
    {
        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'product_category_id' => ['nullable', 'integer', 'exists:product_categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'responsible_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'worker_ids' => ['sometimes', 'array'],
            'worker_ids.*' => ['integer', 'exists:users,id'],
            'document_number' => self::documentNumberRule('inventory_documents', $record),
            'numbering_type' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:80'],
            'document_date' => ['required', 'date'],
            'effective_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'metadata' => ['sometimes', 'array'],
            'lines' => ['sometimes', 'array'],
            ...self::lineRules('lines', false, true, false),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function stockOpnameResultRules(?Model $record = null): array
    {
        $orderType = StockOpnameOrder::backendDocumentType();

        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
            'related_document_id' => [
                'required',
                'integer',
                Rule::exists('inventory_documents', 'id')->where(
                    fn ($query) => $query->where('document_type', $orderType),
                ),
            ],
            'document_number' => self::documentNumberRule('inventory_documents', $record),
            'numbering_type' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:80'],
            'document_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'metadata' => ['sometimes', 'array'],
            'lines' => ['sometimes', 'array', 'min:1'],
            ...self::lineRules('lines', false, true, false),
        ];
    }

    /**
     * @return array<int, mixed>
     */
    private static function documentNumberRule(string $table, ?Model $record = null): array
    {
        $rule = Rule::unique($table, 'document_number');

        if ($record !== null) {
            $rule = $rule->ignore($record);
        }

        return ['required', 'string', 'max:120', $rule];
    }

    /**
     * @return array<string, mixed>
     */
    private static function lineRules(
        string $prefix,
        bool $allowQuantity,
        bool $allowCountedQuantity,
        bool $allowLineDate,
    ): array {
        return [
            "{$prefix}.*.id" => ['sometimes', 'integer', 'exists:inventory_document_lines,id'],
            "{$prefix}.*.product_id" => ['nullable', 'integer', 'exists:products,id'],
            "{$prefix}.*.unit_id" => ['nullable', 'integer', 'exists:units,id'],
            "{$prefix}.*.department_id" => ['nullable', 'integer', 'exists:departments,id'],
            "{$prefix}.*.item_name" => ['nullable', 'string', 'max:160'],
            "{$prefix}.*.item_code" => ['nullable', 'string', 'max:80'],
            "{$prefix}.*.quantity" => $allowQuantity ? ["required_with:{$prefix}", 'numeric', 'gt:0'] : ['prohibited'],
            "{$prefix}.*.system_quantity" => ['nullable', 'numeric', 'min:0'],
            "{$prefix}.*.counted_quantity" => $allowCountedQuantity ? ["required_with:{$prefix}", 'numeric', 'min:0'] : ['prohibited'],
            "{$prefix}.*.line_date" => $allowLineDate ? ['nullable', 'date'] : ['prohibited'],
            "{$prefix}.*.notes" => ['nullable', 'string'],
            "{$prefix}.*.attributes" => ['sometimes', 'array'],
            "{$prefix}.*.sort_order" => ['sometimes', 'integer', 'min:0'],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  list<string>  $fillableColumns
     */
    private static function syncLines(
        Model $record,
        array $payload,
        array $fillableColumns,
        callable $filter,
    ): void {
        if (! array_key_exists('lines', $payload)) {
            return;
        }

        BackendRelationSync::syncHasMany(
            $record,
            'lines',
            $payload['lines'],
            $fillableColumns,
            $filter,
        );
    }
}
