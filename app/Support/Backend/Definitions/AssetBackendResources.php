<?php

namespace App\Support\Backend\Definitions;

use App\Domain\Asset\Models\AssetCategory;
use App\Domain\Asset\Models\AssetTaxCategory;
use App\Domain\Asset\Models\FixedAsset;
use App\Support\Backend\BackendRelationSync;
use App\Support\Backend\BackendResourceBlueprint;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class AssetBackendResources
{
    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function definitions(): array
    {
        return [
            'asset-categories' => new BackendResourceBlueprint(
                key: 'asset-categories',
                label: 'Asset Categories',
                permissionKey: 'asset-category',
                searchColumns: ['code', 'name', 'depreciation_method', 'notes'],
                modelClass: AssetCategory::class,
                with: ['assetAccount', 'accumulatedDepreciationAccount', 'depreciationExpenseAccount'],
                storeRules: self::assetCategoryRules(),
                updateRules: fn (Model $record) => self::assetCategoryRules($record),
            ),
            'asset-tax-categories' => new BackendResourceBlueprint(
                key: 'asset-tax-categories',
                label: 'Asset Tax Categories',
                permissionKey: 'asset-tax-category',
                searchColumns: ['code', 'name', 'depreciation_method', 'notes'],
                modelClass: AssetTaxCategory::class,
                storeRules: self::assetTaxCategoryRules(),
                updateRules: fn (Model $record) => self::assetTaxCategoryRules($record),
            ),
            'fixed-assets' => new BackendResourceBlueprint(
                key: 'fixed-assets',
                label: 'Fixed Assets',
                permissionKey: 'fixed-assets',
                searchColumns: ['code', 'name', 'initial_location_name', 'notes'],
                modelClass: FixedAsset::class,
                with: [
                    'category',
                    'taxCategory',
                    'branch',
                    'department',
                    'assetAccount',
                    'accumulatedDepreciationAccount',
                    'depreciationExpenseAccount',
                    'expenses.account',
                    'locations',
                ],
                storeRules: self::fixedAssetRules(),
                updateRules: fn (Model $record) => self::fixedAssetRules($record),
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('expense_rows', $payload)) {
                        BackendRelationSync::syncHasMany(
                            $record,
                            'expenses',
                            $payload['expense_rows'],
                            ['account_id', 'code', 'description', 'expense_date', 'amount', 'notes', 'sort_order'],
                            fn (array $row): bool => filled($row['description'] ?? null) || filled($row['code'] ?? null),
                        );
                    }

                    if (array_key_exists('location_rows', $payload)) {
                        BackendRelationSync::syncHasMany(
                            $record,
                            'locations',
                            $payload['location_rows'],
                            ['location_name', 'location_address', 'quantity', 'is_current', 'sort_order'],
                            fn (array $row): bool => filled($row['location_name'] ?? null),
                        );
                    }
                },
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function assetCategoryRules(?Model $record = null): array
    {
        return [
            'code' => self::nullableUniqueRule('asset_categories', 'code', $record),
            'name' => ['required', 'string', 'max:160'],
            'depreciation_method' => ['nullable', 'string', 'max:120'],
            'asset_life_months' => ['nullable', 'integer', 'min:0'],
            'depreciation_rate' => ['nullable', 'numeric', 'min:0'],
            'asset_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'accumulated_depreciation_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'depreciation_expense_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function assetTaxCategoryRules(?Model $record = null): array
    {
        return [
            'code' => self::nullableUniqueRule('asset_tax_categories', 'code', $record),
            'name' => ['required', 'string', 'max:160'],
            'depreciation_method' => ['nullable', 'string', 'max:120'],
            'asset_life_months' => ['nullable', 'integer', 'min:0'],
            'depreciation_rate' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function fixedAssetRules(?Model $record = null): array
    {
        return [
            'asset_category_id' => ['nullable', 'integer', 'exists:asset_categories,id'],
            'asset_tax_category_id' => ['nullable', 'integer', 'exists:asset_tax_categories,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'asset_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'accumulated_depreciation_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'depreciation_expense_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'code' => self::requiredUniqueRule('fixed_assets', 'code', $record),
            'name' => ['required', 'string', 'max:200'],
            'purchase_date' => ['nullable', 'date'],
            'usage_date' => ['nullable', 'date'],
            'is_intangible' => ['sometimes', 'boolean'],
            'depreciation_method' => ['nullable', 'string', 'max:120'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'asset_life_years' => ['nullable', 'integer', 'min:0'],
            'asset_life_months' => ['nullable', 'integer', 'min:0'],
            'depreciation_ratio' => ['nullable', 'numeric', 'min:0'],
            'residual_value' => ['nullable', 'numeric', 'min:0'],
            'acquisition_cost' => ['nullable', 'numeric', 'min:0'],
            'book_value' => ['nullable', 'numeric', 'min:0'],
            'tax_enabled' => ['sometimes', 'boolean'],
            'last_depreciation_at' => ['nullable', 'date'],
            'initial_location_name' => ['nullable', 'string', 'max:160'],
            'initial_location_address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'expense_rows' => ['sometimes', 'array'],
            'expense_rows.*.id' => ['sometimes', 'integer', 'exists:fixed_asset_expenses,id'],
            'expense_rows.*.account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'expense_rows.*.code' => ['nullable', 'string', 'max:80'],
            'expense_rows.*.description' => ['nullable', 'string', 'max:200'],
            'expense_rows.*.expense_date' => ['nullable', 'date'],
            'expense_rows.*.amount' => ['nullable', 'numeric', 'min:0'],
            'expense_rows.*.notes' => ['nullable', 'string'],
            'expense_rows.*.sort_order' => ['sometimes', 'integer', 'min:0'],
            'location_rows' => ['sometimes', 'array'],
            'location_rows.*.id' => ['sometimes', 'integer', 'exists:fixed_asset_locations,id'],
            'location_rows.*.location_name' => ['required_with:location_rows', 'string', 'max:160'],
            'location_rows.*.location_address' => ['nullable', 'string'],
            'location_rows.*.quantity' => ['nullable', 'integer', 'min:1'],
            'location_rows.*.is_current' => ['sometimes', 'boolean'],
            'location_rows.*.sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<int, mixed>
     */
    private static function nullableUniqueRule(string $table, string $column, ?Model $record = null): array
    {
        $rule = Rule::unique($table, $column);

        if ($record !== null) {
            $rule = $rule->ignore($record);
        }

        return ['nullable', 'string', 'max:80', $rule];
    }

    /**
     * @return array<int, mixed>
     */
    private static function requiredUniqueRule(string $table, string $column, ?Model $record = null): array
    {
        $rule = Rule::unique($table, $column);

        if ($record !== null) {
            $rule = $rule->ignore($record);
        }

        return ['required', 'string', 'max:80', $rule];
    }
}
