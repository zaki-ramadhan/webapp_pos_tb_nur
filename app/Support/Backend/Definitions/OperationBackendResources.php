<?php

namespace App\Support\Backend\Definitions;

use App\Domain\Asset\Models\AssetChange;
use App\Domain\Asset\Models\AssetDisposal;
use App\Domain\Asset\Models\AssetMove;
use App\Domain\Finance\Models\BankTransfer;
use App\Domain\Finance\Models\Budget;
use App\Domain\Finance\Models\BudgetTransfer;
use App\Domain\Finance\Models\CashPayment;
use App\Domain\Finance\Models\CashReceipt;
use App\Domain\Finance\Models\ExpenseEntry;
use App\Domain\Finance\Models\GeneralJournal;
use App\Domain\Finance\Models\PaymentOrder;
use App\Domain\Finance\Models\PeriodEnd;
use App\Domain\Finance\Models\PayrollEntry;
use App\Domain\Inventory\Models\InventoryAdjustment;
use App\Domain\Inventory\Models\MaterialAddition;
use App\Domain\Inventory\Models\WorkCompletion;
use App\Domain\Inventory\Models\WorkOrder;
use App\Domain\Purchasing\Models\GoodsReceipt;
use App\Domain\Purchasing\Models\PurchaseDeposit;
use App\Domain\Purchasing\Models\PurchaseInvoice;
use App\Domain\Purchasing\Models\PurchaseOrder;
use App\Domain\Purchasing\Models\PurchasePayment;
use App\Domain\Purchasing\Models\PurchaseReturn;
use App\Domain\Sales\Models\PriceAdjustment;
use App\Domain\Sales\Models\SalesCommission;
use App\Domain\Sales\Models\DeliveryOrder;
use App\Domain\Sales\Models\SalesDelivery;
use App\Domain\Sales\Models\SalesDeposit;
use App\Domain\Sales\Models\SalesInvoice;
use App\Domain\Sales\Models\SalesOrder;
use App\Domain\Sales\Models\SalesQuote;
use App\Domain\Sales\Models\SalesReceipt;
use App\Domain\Sales\Models\SalesReturn;
use App\Domain\Sales\Models\SalesTarget;
use App\Support\Backend\BackendRelationSync;
use App\Support\Backend\BackendResourceBlueprint;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class OperationBackendResources
{
    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function definitions(): array
    {
        return [
            ...self::makeSalesResources(),
            ...self::makePurchasingResources(),
            ...self::makeInventoryResources(),
            ...self::makeFinanceResources(),
            ...self::makeAssetOperationResources(),
        ];
    }

    /**
     * @return array<string, BackendResourceBlueprint>
     */
    private static function makeSalesResources(): array
    {
        return [
            'sales-quotes' => self::documentResource('sales-quotes', 'Sales Quotes', 'sales-quote', SalesQuote::class, self::salesRules()),
            'sales-orders' => self::documentResource('sales-orders', 'Sales Orders', 'sales-order', SalesOrder::class, self::salesRules()),
            'sales-deliveries' => self::documentResource('sales-deliveries', 'Sales Deliveries', 'sales-delivery', SalesDelivery::class, self::salesRules()),
            'delivery-orders' => self::documentResource('delivery-orders', 'Delivery Orders', 'delivery-order', DeliveryOrder::class, self::salesRules()),
            'sales-deposits' => self::documentResource('sales-deposits', 'Sales Deposits', 'sales-deposit', SalesDeposit::class, self::salesRules(requireLines: false)),
            'sales-invoices' => self::documentResource('sales-invoices', 'Sales Invoices', 'sales-invoice', SalesInvoice::class, self::salesRules()),
            'sales-receipts' => self::documentResource('sales-receipts', 'Sales Receipts', 'sales-receipt', SalesReceipt::class, self::salesPaymentRules()),
            'sales-returns' => self::documentResource('sales-returns', 'Sales Returns', 'sales-return', SalesReturn::class, self::salesRules()),
            'price-adjustments' => self::documentResource('price-adjustments', 'Price Adjustments', 'price-adjustment', PriceAdjustment::class, self::inventoryLikeRules()),
            'sales-commissions' => self::documentResource('sales-commissions', 'Sales Commissions', 'sales-commission', SalesCommission::class, self::accountingRules()),
            'sales-targets' => self::documentResource('sales-targets', 'Sales Targets', 'sales-target', SalesTarget::class, self::accountingRules()),
        ];
    }

    /**
     * @return array<string, BackendResourceBlueprint>
     */
    private static function makePurchasingResources(): array
    {
        return [
            'purchase-orders' => self::documentResource('purchase-orders', 'Purchase Orders', 'purchase-order', PurchaseOrder::class, self::purchaseRules()),
            'goods-receipts' => self::documentResource('goods-receipts', 'Goods Receipts', 'goods-receipt', GoodsReceipt::class, self::purchaseRules()),
            'purchase-deposits' => self::documentResource('purchase-deposits', 'Purchase Deposits', 'purchase-deposit', PurchaseDeposit::class, self::purchaseRules(requireLines: false)),
            'purchase-invoices' => self::documentResource('purchase-invoices', 'Purchase Invoices', 'purchase-invoice', PurchaseInvoice::class, self::purchaseRules()),
            'purchase-payments' => self::documentResource('purchase-payments', 'Purchase Payments', 'purchase-payment', PurchasePayment::class, self::purchasePaymentRules()),
            'purchase-returns' => self::documentResource('purchase-returns', 'Purchase Returns', 'purchase-return', PurchaseReturn::class, self::purchaseRules()),
        ];
    }

    /**
     * @return array<string, BackendResourceBlueprint>
     */
    private static function makeInventoryResources(): array
    {
        return [
            'inventory-adjustments' => self::documentResource('inventory-adjustments', 'Inventory Adjustments', 'inventory-adjustment', InventoryAdjustment::class, self::inventoryLikeRules()),
            'work-orders' => self::documentResource('work-orders', 'Work Orders', 'work-order', WorkOrder::class, self::inventoryLikeRules()),
            'material-additions' => self::documentResource('material-additions', 'Material Additions', 'material-addition', MaterialAddition::class, self::inventoryLikeRules()),
            'work-completions' => self::documentResource('work-completions', 'Work Completions', 'work-completion', WorkCompletion::class, self::inventoryLikeRules()),
        ];
    }

    /**
     * @return array<string, BackendResourceBlueprint>
     */
    private static function makeFinanceResources(): array
    {
        return [
            'budgets' => self::documentResource('budgets', 'Budgets', 'budget', Budget::class, self::accountingRules()),
            'budget-monitors' => self::documentResource('budget-monitors', 'Budget Monitors', 'budget-monitor', Budget::class, self::accountingRules()),
            'budget-transfers' => self::documentResource('budget-transfers', 'Budget Transfers', 'budget-transfer', BudgetTransfer::class, self::accountingRules()),
            'expense-entries' => self::documentResource('expense-entries', 'Expense Entries', 'expense-entry', ExpenseEntry::class, self::accountingRules()),
            'payroll-entries' => self::documentResource('payroll-entries', 'Payroll Entries', 'payroll-entry', PayrollEntry::class, self::accountingRules()),
            'general-journals' => self::documentResource('general-journals', 'General Journals', 'general-journal', GeneralJournal::class, self::journalRules()),
            'period-ends' => self::documentResource('period-ends', 'Period Ends', 'period-end', PeriodEnd::class, self::journalRules()),
            'cash-payments' => self::documentResource('cash-payments', 'Cash Payments', 'cash-payment', CashPayment::class, self::moneyMovementRules()),
            'cash-receipts' => self::documentResource('cash-receipts', 'Cash Receipts', 'cash-receipt', CashReceipt::class, self::moneyMovementRules()),
            'bank-transfers' => self::documentResource('bank-transfers', 'Bank Transfers', 'bank-transfer', BankTransfer::class, self::bankTransferRules()),
            'payment-orders' => self::documentResource('payment-orders', 'Payment Orders', 'payment-order', PaymentOrder::class, self::moneyMovementRules()),
        ];
    }

    /**
     * @return array<string, BackendResourceBlueprint>
     */
    private static function makeAssetOperationResources(): array
    {
        return [
            'asset-changes' => self::documentResource('asset-changes', 'Asset Changes', 'asset-change', AssetChange::class, self::assetOperationRules()),
            'asset-disposals' => self::documentResource('asset-disposals', 'Asset Disposals', 'asset-disposal', AssetDisposal::class, self::assetOperationRules()),
            'asset-moves' => self::documentResource('asset-moves', 'Asset Moves', 'asset-move', AssetMove::class, self::assetOperationRules(requireCounterpartWarehouse: false)),
        ];
    }

    /**
     * @param  class-string<Model>  $modelClass
     * @param  array<string, mixed>  $rules
     */
    private static function documentResource(
        string $key,
        string $label,
        string $permissionKey,
        string $modelClass,
        array $rules,
    ): BackendResourceBlueprint {
        return new BackendResourceBlueprint(
            key: $key,
            label: $label,
            permissionKey: $permissionKey,
            searchColumns: ['document_number', 'external_number', 'reference_number', 'status', 'notes'],
            modelClass: $modelClass,
            with: [
                'branch',
                'department',
                'warehouse',
                'counterpartWarehouse',
                'customer',
                'supplier',
                'currency',
                'paymentTerm',
                'primaryAccount',
                'secondaryAccount',
                'tax',
                'relatedDocument',
                'responsibleUser',
                'users',
                'lines.product',
                'lines.fixedAsset',
                'lines.account',
                'lines.unit',
                'lines.warehouse',
                'lines.department',
                'lines.customer',
                'lines.supplier',
            ],
            storeRules: $rules,
            updateRules: fn (Model $record) => self::replaceDocumentNumberRule($rules, $record),
            syncUsing: function (Model $record, array $payload): void {
                if (array_key_exists('user_ids', $payload)) {
                    BackendRelationSync::syncBelongsToMany($record, 'users', $payload['user_ids']);
                }

                if (array_key_exists('lines', $payload)) {
                    BackendRelationSync::syncHasMany(
                        $record,
                        'lines',
                        $payload['lines'],
                        [
                            'line_type',
                            'product_id',
                            'fixed_asset_id',
                            'account_id',
                            'unit_id',
                            'warehouse_id',
                            'department_id',
                            'customer_id',
                            'supplier_id',
                            'description',
                            'reference_code',
                            'quantity',
                            'unit_price',
                            'discount_amount',
                            'tax_amount',
                            'debit_amount',
                            'credit_amount',
                            'total_amount',
                            'line_date',
                            'due_date',
                            'attributes',
                            'sort_order',
                        ],
                        fn (array $row): bool => filled($row['product_id'] ?? null)
                            || filled($row['fixed_asset_id'] ?? null)
                            || filled($row['account_id'] ?? null)
                            || filled($row['description'] ?? null),
                    );
                }
            },
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function salesRules(bool $requireLines = true): array
    {
        return array_merge(
            self::baseDocumentRules(requireLines: $requireLines),
            [
                'customer_id' => ['required', 'integer', 'exists:customers,id'],
                'supplier_id' => ['prohibited'],
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function purchaseRules(bool $requireLines = true): array
    {
        return array_merge(
            self::baseDocumentRules(requireLines: $requireLines),
            [
                'customer_id' => ['prohibited'],
                'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function salesPaymentRules(): array
    {
        return array_merge(
            self::baseDocumentRules(requireLines: true),
            [
                'customer_id' => ['required', 'integer', 'exists:customers,id'],
                'supplier_id' => ['prohibited'],
                'primary_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                'payment_method' => ['nullable', 'string', 'max:80'],
                'paid_amount' => ['nullable', 'numeric', 'min:0'],
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function purchasePaymentRules(): array
    {
        return array_merge(
            self::baseDocumentRules(requireLines: true),
            [
                'customer_id' => ['prohibited'],
                'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
                'primary_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                'payment_method' => ['nullable', 'string', 'max:80'],
                'paid_amount' => ['nullable', 'numeric', 'min:0'],
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function inventoryLikeRules(): array
    {
        return array_merge(
            self::baseDocumentRules(requireLines: true),
            [
                'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
                'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
                'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function accountingRules(): array
    {
        return array_merge(
            self::baseDocumentRules(requireLines: true),
            [
                'primary_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                'secondary_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function journalRules(): array
    {
        return array_merge(
            self::baseDocumentRules(requireLines: true),
            [
                'primary_account_id' => ['prohibited'],
                'secondary_account_id' => ['prohibited'],
                'lines.*.debit_amount' => ['nullable', 'numeric', 'min:0'],
                'lines.*.credit_amount' => ['nullable', 'numeric', 'min:0'],
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function moneyMovementRules(): array
    {
        return array_merge(
            self::baseDocumentRules(requireLines: true),
            [
                'primary_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                'secondary_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                'payment_method' => ['nullable', 'string', 'max:80'],
                'paid_amount' => ['nullable', 'numeric', 'min:0'],
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function bankTransferRules(): array
    {
        return array_merge(
            self::moneyMovementRules(),
            [
                'primary_account_id' => ['required', 'integer', 'exists:accounts,id', 'different:secondary_account_id'],
                'secondary_account_id' => ['required', 'integer', 'exists:accounts,id', 'different:primary_account_id'],
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function assetOperationRules(bool $requireCounterpartWarehouse = false): array
    {
        $rules = self::baseDocumentRules(requireLines: true);
        $rules['lines.*.fixed_asset_id'] = ['nullable', 'integer', 'exists:fixed_assets,id'];

        if ($requireCounterpartWarehouse) {
            $rules['counterpart_warehouse_id'] = ['nullable', 'integer', 'exists:warehouses,id'];
        }

        return $rules;
    }

    /**
     * @return array<string, mixed>
     */
    private static function baseDocumentRules(bool $requireLines): array
    {
        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
            'counterpart_warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
            'payment_term_id' => ['nullable', 'integer', 'exists:payment_terms,id'],
            'primary_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'secondary_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'tax_id' => ['nullable', 'integer', 'exists:taxes,id'],
            'related_document_id' => ['nullable', 'integer', 'exists:operation_documents,id'],
            'responsible_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'user_ids' => ['sometimes', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'document_number' => ['required', 'string', 'max:120', Rule::unique('operation_documents', 'document_number')],
            'external_number' => ['nullable', 'string', 'max:120'],
            'reference_number' => ['nullable', 'string', 'max:120'],
            'numbering_type' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:80'],
            'process_type' => ['nullable', 'string', 'max:80'],
            'payment_method' => ['nullable', 'string', 'max:80'],
            'entry_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date'],
            'shipping_date' => ['nullable', 'date'],
            'check_date' => ['nullable', 'date'],
            'effective_date' => ['nullable', 'date'],
            'is_closed' => ['sometimes', 'boolean'],
            'subtotal' => ['nullable', 'numeric', 'min:0'],
            'discount_total' => ['nullable', 'numeric', 'min:0'],
            'tax_total' => ['nullable', 'numeric', 'min:0'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'outstanding_amount' => ['nullable', 'numeric', 'min:0'],
            'flags' => ['sometimes', 'array'],
            'metadata' => ['sometimes', 'array'],
            'notes' => ['nullable', 'string'],
            'lines' => $requireLines ? ['sometimes', 'array', 'min:1'] : ['sometimes', 'array'],
            'lines.*.id' => ['sometimes', 'integer', 'exists:operation_document_lines,id'],
            'lines.*.line_type' => ['nullable', 'string', 'max:60'],
            'lines.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'lines.*.fixed_asset_id' => ['nullable', 'integer', 'exists:fixed_assets,id'],
            'lines.*.account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'lines.*.unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'lines.*.warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
            'lines.*.department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'lines.*.customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'lines.*.supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'lines.*.description' => ['nullable', 'string', 'max:200'],
            'lines.*.reference_code' => ['nullable', 'string', 'max:120'],
            'lines.*.quantity' => ['nullable', 'numeric'],
            'lines.*.unit_price' => ['nullable', 'numeric'],
            'lines.*.discount_amount' => ['nullable', 'numeric'],
            'lines.*.tax_amount' => ['nullable', 'numeric'],
            'lines.*.debit_amount' => ['nullable', 'numeric'],
            'lines.*.credit_amount' => ['nullable', 'numeric'],
            'lines.*.total_amount' => ['nullable', 'numeric'],
            'lines.*.line_date' => ['nullable', 'date'],
            'lines.*.due_date' => ['nullable', 'date'],
            'lines.*.attributes' => ['sometimes', 'array'],
            'lines.*.sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    /**
     * @param  array<string, mixed>  $rules
     * @return array<string, mixed>
     */
    private static function replaceDocumentNumberRule(array $rules, Model $record): array
    {
        $rules['document_number'] = [
            'required',
            'string',
            'max:120',
            Rule::unique('operation_documents', 'document_number')->ignore($record),
        ];

        return $rules;
    }
}
