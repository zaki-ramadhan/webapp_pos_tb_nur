import { lazy } from 'react';

const AccountsView = lazy(() => import('@/features/workspace/modules/accounts/AccountsView'));
const ActivityLogView = lazy(() => import('@/features/workspace/modules/activity-log/ActivityLogView'));
const BankInquiryView = lazy(() => import('@/features/workspace/modules/bank-inquiry/BankInquiryView'));
const BankTransferView = lazy(() => import('@/features/workspace/modules/bank-transfer/BankTransferView'));
const CashPaymentView = lazy(() => import('@/features/workspace/modules/cash-payment/CashPaymentView'));
const CashReceiptView = lazy(() => import('@/features/workspace/modules/cash-receipt/CashReceiptView'));
const EmployeeView = lazy(() => import('@/features/workspace/modules/employee/EmployeeView'));
const ExpenseEntryView = lazy(() => import('@/features/workspace/modules/expense-entry/ExpenseEntryView'));
const GeneralJournalView = lazy(() => import('@/features/workspace/modules/general-journal/GeneralJournalView'));
const GroupAccessView = lazy(() => import('@/features/workspace/modules/group-access/GroupAccessView'));
const InventoryAdjustmentView = lazy(() => import('@/features/workspace/modules/inventory-adjustment/InventoryAdjustmentView'));
const InventoryInquiryView = lazy(() => import('@/features/workspace/modules/inventory-inquiry/InventoryInquiryView'));
const ItemCategoryView = lazy(() => import('@/features/workspace/modules/item-category/ItemCategoryView'));
const ItemsServicesView = lazy(() => import('@/features/workspace/modules/items-services/ItemsServicesView'));
const PayrollEntryView = lazy(() => import('@/features/workspace/modules/payroll-entry/PayrollEntryView'));
const PreferencesView = lazy(() => import('@/features/workspace/preferences/PreferencesView'));
const PurchaseInvoiceView = lazy(() => import('@/features/workspace/modules/sales-document/PurchaseInvoiceView'));
const PurchasePaymentView = lazy(() => import('@/features/workspace/modules/purchase-payment/PurchasePaymentView'));
const PurchaseReturnView = lazy(() => import('@/features/workspace/modules/sales-document/PurchaseReturnView'));
const SalaryAllowanceView = lazy(() => import('@/features/workspace/modules/salary-allowance/SalaryAllowanceView'));
const SalesDepositView = lazy(() => import('@/features/workspace/modules/sales-deposit/SalesDepositView'));
const SalesInvoiceView = lazy(() => import('@/features/workspace/modules/sales-document/SalesInvoiceView'));
const SalesReceiptView = lazy(() => import('@/features/workspace/modules/sales-receipt/SalesReceiptView'));
const SalesReturnView = lazy(() => import('@/features/workspace/modules/sales-document/SalesReturnView'));
const SimpleMasterView = lazy(() => import('@/features/workspace/modules/SimpleMasterView'));
const UsersManagementView = lazy(() => import('@/features/workspace/modules/users-management/UsersManagementView'));
const WarehouseView = lazy(() => import('@/features/workspace/modules/warehouse/WarehouseView'));
const BusinessPartnerView = lazy(() => import('@/features/workspace/modules/business-partner/BusinessPartnerView'));
const JournalActivityLogView = lazy(() => import('@/features/workspace/modules/journal-activity-log/JournalActivityLogView'));
const SmartlinkEbankingView = lazy(() => import('@/features/workspace/modules/smartlink-ebanking/SmartlinkEbankingView'));
const PurchaseDepositView = lazy(() => import('@/features/workspace/modules/purchase-deposit/PurchaseDepositView'));

export const STATIC_PAGE_RENDERERS = {
    preferences: (page) => <PreferencesView page={page} />,
    'activity-log': (page) => <ActivityLogView page={page} />,
    'minimum-stock': (page) => <InventoryInquiryView config={page.minimumStock} pageId="minimum-stock" />,
    'item-location': (page) => <InventoryInquiryView config={page.itemLocation} pageId="item-location" />,
};

export const CONTENT_PAGE_COMPONENTS = {
    employees: EmployeeView,
    'payroll-entry': PayrollEntryView,
    users: UsersManagementView,
    'journal-activity-log': JournalActivityLogView,
    'smartlink-bank': SmartlinkEbankingView,
};

export const LEVEL2_CONTENT_PAGE_COMPONENTS = {
};

export const LEVEL2_DETAIL_PAGE_COMPONENTS = {
    'sales-invoice': SalesInvoiceView,
    'sales-quote': SalesInvoiceView,
    'sales-order': SalesInvoiceView,
    'sales-delivery': SalesInvoiceView,
    'sales-deposit': SalesDepositView,
    'sales-receipt': SalesReceiptView,
    'sales-return': SalesReturnView,
    'purchase-invoice': PurchaseInvoiceView,
    'goods-receipt': PurchaseInvoiceView,
    'purchase-deposit': PurchaseDepositView,
    'purchase-payment': PurchasePaymentView,
    'purchase-return': PurchaseReturnView,
    'stock-transfer': BankTransferView,
    'warehouse-master': WarehouseView,
    'items-services': ItemsServicesView,
    'item-unit': SimpleMasterView,
    'item-category': ItemCategoryView,
    'inventory-adjustment': InventoryAdjustmentView,
    accounts: AccountsView,
    'group-access': GroupAccessView,
    'bank-transfer': BankTransferView,
    'cash-payment': CashPaymentView,
    'cash-receipt': CashReceiptView,
    'expense-entry': ExpenseEntryView,
    'general-journal': GeneralJournalView,
    customers: (props) => <BusinessPartnerView {...props} partnerType="customer" />,
    suppliers: (props) => <BusinessPartnerView {...props} partnerType="supplier" />,
    'salary-allowance': SalaryAllowanceView,
};

export const BANK_INQUIRY_PAGE_IDS = new Set([
    'bank-statement',
    'bank-history',
    'bank-reconciliation',
]);

export { BankInquiryView, BusinessPartnerView };
