<?php

namespace App\Support\Presentation\Blueprints;

class PageBlueprintRegistry
{
    public static function all(array $navigationPages, array $transactionTypeOptions = []): array
    {
        return [
            'users' => Pages\UsersPage::get(),
            'group-access' => Pages\GroupAccessPage::get(),
            'department' => Pages\DepartmentPage::get(),
            'currency-master' => Pages\CurrencyMasterPage::get(),
            'employees' => Pages\EmployeesPage::get(),
            'transaction-approval' => Pages\TransactionApprovalPage::get($transactionTypeOptions),
            'activity-log' => Pages\ActivityLogPage::get(),
            'preferences' => Pages\PreferencesPage::get(),
            'expense-entry' => Pages\ExpenseEntryPage::get($navigationPages),
            'accounts' => Pages\AccountsPage::get($navigationPages),
            'customers' => Pages\CustomersPage::get($navigationPages),
            'suppliers' => Pages\SuppliersPage::get($navigationPages),
            'sales-deposit' => Pages\SalesDepositPage::get($navigationPages),
            'sales-receipt' => Pages\SalesReceiptPage::get($navigationPages),
            'sales-invoice' => Pages\SalesInvoicePage::get($navigationPages),
            'purchase-invoice' => Pages\PurchaseInvoicePage::get($navigationPages),
            'purchase-payment' => Pages\PurchasePaymentPage::get($navigationPages),
            'purchase-return' => Pages\PurchaseReturnPage::get($navigationPages),
            'supplier-price' => Pages\SupplierPricePage::get($navigationPages),
            'item-request' => Pages\ItemRequestPage::get($navigationPages),
            'warehouse-master' => Pages\WarehouseMasterPage::get($navigationPages),
            'items-services' => Pages\ItemsServicesPage::get($navigationPages),
            'item-unit' => Pages\ItemUnitPage::get($navigationPages),
            'item-brand' => Pages\ItemBrandPage::get($navigationPages),
            'item-category' => Pages\ItemCategoryPage::get($navigationPages),
            'item-location' => Pages\ItemLocationPage::get($navigationPages),
            'minimum-stock' => Pages\MinimumStockPage::get($navigationPages),
            'inventory-adjustment' => Pages\InventoryAdjustmentPage::get($navigationPages),
            'price-adjustment' => Pages\PriceAdjustmentPage::get($navigationPages),
            'sales-commission' => Pages\SalesCommissionPage::get($navigationPages),
            'sales-checkin' => Pages\SalesCheckinPage::get($navigationPages),
            'general-journal' => Pages\GeneralJournalPage::get($navigationPages),
            'cash-payment' => Pages\CashPaymentPage::get($navigationPages),
            'cash-receipt' => Pages\CashReceiptPage::get($navigationPages),
            'bank-transfer' => Pages\BankTransferPage::get($navigationPages),
            'journal-activity-log' => Pages\JournalActivityLogPage::get($navigationPages),
            'payroll-entry' => Pages\PayrollEntryPage::get(),
            'salary-allowance' => Pages\SalaryAllowancePage::get(),
        ];
    }
}
