import AccountsView from '@/features/workspace/modules/accounts/AccountsView';
import ActivityLogView from '@/features/workspace/modules/activity-log/ActivityLogView';
import BankInquiryView from '@/features/workspace/modules/bank-inquiry/BankInquiryView';
import BankTransferView from '@/features/workspace/modules/bank-transfer/BankTransferView';
import CashPaymentView from '@/features/workspace/modules/cash-payment/CashPaymentView';
import CashReceiptView from '@/features/workspace/modules/cash-receipt/CashReceiptView';
import CurrencyView from '@/features/workspace/modules/currency/CurrencyView';
import DepartmentView from '@/features/workspace/modules/department/DepartmentView';
import EmployeeView from '@/features/workspace/modules/employee/EmployeeView';
import ExpenseEntryView from '@/features/workspace/modules/expense-entry/ExpenseEntryView';
import GeneralJournalView from '@/features/workspace/modules/general-journal/GeneralJournalView';
import GroupAccessView from '@/features/workspace/modules/group-access/GroupAccessView';
import InventoryAdjustmentView from '@/features/workspace/modules/inventory-adjustment/InventoryAdjustmentView';
import InventoryInquiryView from '@/features/workspace/modules/inventory-inquiry/InventoryInquiryView';
import ItemCategoryView from '@/features/workspace/modules/item-category/ItemCategoryView';
import ItemsServicesView from '@/features/workspace/modules/items-services/ItemsServicesView';
import PayrollEntryView from '@/features/workspace/modules/payroll-entry/PayrollEntryView';
import PreferencesView from '@/features/workspace/preferences/PreferencesView';
import PurchaseInvoiceView from '@/features/workspace/modules/sales-document/PurchaseInvoiceView';
import PurchasePaymentView from '@/features/workspace/modules/purchase-payment/PurchasePaymentView';
import PurchaseReturnView from '@/features/workspace/modules/sales-document/PurchaseReturnView';
import SalaryAllowanceView from '@/features/workspace/modules/salary-allowance/SalaryAllowanceView';
import SalesCheckinView from '@/features/workspace/modules/sales-checkin/SalesCheckinView';
import SalesDepositView from '@/features/workspace/modules/sales-deposit/SalesDepositView';
import SalesInvoiceView from '@/features/workspace/modules/sales-document/SalesInvoiceView';
import SalesReceiptView from '@/features/workspace/modules/sales-receipt/SalesReceiptView';
import SalesReturnView from '@/features/workspace/modules/sales-document/SalesReturnView';
import SimpleMasterView from '@/features/workspace/modules/SimpleMasterView';
import TableListView from '@/features/workspace/modules/TableListView';
import UsersManagementView from '@/features/workspace/modules/users-management/UsersManagementView';
import WarehouseView from '@/features/workspace/modules/warehouse/WarehouseView';
import BusinessPartnerView from '@/features/workspace/modules/business-partner/BusinessPartnerView';
import JournalActivityLogView from '@/features/workspace/modules/journal-activity-log/JournalActivityLogView';
import SmartlinkEbankingView from '@/features/workspace/modules/smartlink-ebanking/SmartlinkEbankingView';
import PurchaseDepositView from '@/features/workspace/modules/purchase-deposit/PurchaseDepositView';

export const STATIC_PAGE_RENDERERS = {
    preferences: (page) => <PreferencesView page={page} />,
    'activity-log': (page) => <ActivityLogView page={page} />,
    'minimum-stock': (page) => <InventoryInquiryView config={page.minimumStock} pageId="minimum-stock" />,
    'item-location': (page) => <InventoryInquiryView config={page.itemLocation} pageId="item-location" />,
    'salary-allowance': (page) => <SalaryAllowanceView page={page} />,
};

export const CONTENT_PAGE_COMPONENTS = {
    department: DepartmentView,
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
    'currency-master': CurrencyView,
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
};

export const BANK_INQUIRY_PAGE_IDS = new Set([
    'bank-statement',
    'bank-history',
    'bank-reconciliation',
]);

export { BankInquiryView };
