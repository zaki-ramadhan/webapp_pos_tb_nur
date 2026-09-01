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
            'sales-invoice' => Pages\SalesInvoicePage::get($navigationPages, 'sales-invoice'),
            'purchase-invoice' => Pages\PurchaseInvoicePage::get($navigationPages, 'purchase-invoice'),
            'goods-receipt' => Pages\PurchaseInvoicePage::get($navigationPages, 'goods-receipt'),
            'purchase-deposit' => Pages\PurchaseDepositPage::get($navigationPages),
            'sales-quote' => Pages\SalesInvoicePage::get($navigationPages, 'sales-quote'),
            'sales-order' => Pages\SalesInvoicePage::get($navigationPages, 'sales-order'),
            'sales-delivery' => Pages\SalesInvoicePage::get($navigationPages, 'sales-delivery'),
            'stock-transfer' => Pages\BankTransferPage::get($navigationPages),
            'purchase-payment' => Pages\PurchasePaymentPage::get($navigationPages),
            'purchase-return' => Pages\PurchaseReturnPage::get($navigationPages),
            'warehouse-master' => Pages\WarehouseMasterPage::get($navigationPages),
            'items-services' => Pages\ItemsServicesPage::get($navigationPages),
            'item-unit' => Pages\ItemUnitPage::get($navigationPages),
            'item-category' => Pages\ItemCategoryPage::get($navigationPages),
            'item-location' => Pages\ItemLocationPage::get($navigationPages),
            'minimum-stock' => Pages\MinimumStockPage::get($navigationPages),
            'inventory-adjustment' => Pages\InventoryAdjustmentPage::get($navigationPages),
            'sales-checkin' => Pages\SalesCheckinPage::get($navigationPages),
            'general-journal' => Pages\GeneralJournalPage::get($navigationPages),
            'cash-payment' => Pages\CashPaymentPage::get($navigationPages),
            'cash-receipt' => Pages\CashReceiptPage::get($navigationPages),
            'bank-transfer' => Pages\BankTransferPage::get($navigationPages),
            'smartlink-bank' => Pages\SmartlinkEbankingPage::get($navigationPages),
            'journal-activity-log' => Pages\JournalActivityLogPage::get($navigationPages),
            'payroll-entry' => Pages\PayrollEntryPage::get(),
            'salary-allowance' => Pages\SalaryAllowancePage::get(),
        ];
    }
}
