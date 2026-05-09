import AccountsView from '@/features/workspace/modules/AccountsView';
import ActivityLogView from '@/features/workspace/modules/ActivityLogView';
import AssetCategoryView from '@/features/workspace/modules/AssetCategoryView';
import AssetChangeView from '@/features/workspace/modules/AssetChangeView';
import AssetDisposalView from '@/features/workspace/modules/AssetDisposalView';
import AssetLocationView from '@/features/workspace/modules/AssetLocationView';
import AssetMoveView from '@/features/workspace/modules/AssetMoveView';
import AssetTaxCategoryView from '@/features/workspace/modules/AssetTaxCategoryView';
import BankInquiryView from '@/features/workspace/modules/BankInquiryView';
import BankTransferView from '@/features/workspace/modules/BankTransferView';
import BranchView from '@/features/workspace/modules/BranchView';
import BudgetMonitorView from '@/features/workspace/modules/BudgetMonitorView';
import BudgetTransferView from '@/features/workspace/modules/BudgetTransferView';
import BudgetView from '@/features/workspace/modules/BudgetView';
import CashPaymentView from '@/features/workspace/modules/CashPaymentView';
import CashReceiptView from '@/features/workspace/modules/CashReceiptView';
import ContactView from '@/features/workspace/modules/ContactView';
import CurrencyView from '@/features/workspace/modules/CurrencyView';
import DepartmentView from '@/features/workspace/modules/DepartmentView';
import EmployeeView from '@/features/workspace/modules/EmployeeView';
import ExpenseEntryView from '@/features/workspace/modules/ExpenseEntryView';
import FixedAssetsView from '@/features/workspace/modules/FixedAssetsView';
import GeneralJournalView from '@/features/workspace/modules/GeneralJournalView';
import GoodsReceiptView from '@/features/workspace/modules/GoodsReceiptView';
import GroupAccessView from '@/features/workspace/modules/GroupAccessView';
import InventoryAdjustmentView from '@/features/workspace/modules/InventoryAdjustmentView';
import InventoryInquiryView from '@/features/workspace/modules/InventoryInquiryView';
import ItemCategoryView from '@/features/workspace/modules/ItemCategoryView';
import ItemRequestView from '@/features/workspace/modules/ItemRequestView';
import ItemsServicesView from '@/features/workspace/modules/ItemsServicesView';
import MaterialAdditionView from '@/features/workspace/modules/MaterialAdditionView';
import NumberingView from '@/features/workspace/modules/NumberingView';
import OrderFulfillmentView from '@/features/workspace/modules/OrderFulfillmentView';
import PaymentOrderView from '@/features/workspace/modules/PaymentOrderView';
import PaymentTermsView from '@/features/workspace/modules/PaymentTermsView';
import PayrollEntryView from '@/features/workspace/modules/PayrollEntryView';
import PeriodEndView from '@/features/workspace/modules/PeriodEndView';
import PreferencesView from '@/features/workspace/preferences/PreferencesView';
import PrintDesignView from '@/features/workspace/modules/PrintDesignView';
import PurchaseDepositView from '@/features/workspace/modules/PurchaseDepositView';
import PurchaseInvoiceView from '@/features/workspace/modules/PurchaseInvoiceView';
import PurchaseOrderView from '@/features/workspace/modules/PurchaseOrderView';
import PurchasePaymentView from '@/features/workspace/modules/PurchasePaymentView';
import PurchaseReturnView from '@/features/workspace/modules/PurchaseReturnView';
import ReportListView from '@/features/workspace/modules/ReportListView';
import SalaryAllowanceView from '@/features/workspace/modules/SalaryAllowanceView';
import SalesCommissionView from '@/features/workspace/modules/SalesCommissionView';
import SalesDeliveryView from '@/features/workspace/modules/SalesDeliveryView';
import SalesDepositView from '@/features/workspace/modules/SalesDepositView';
import SalesInvoiceView from '@/features/workspace/modules/SalesInvoiceView';
import SalesOrderView from '@/features/workspace/modules/SalesOrderView';
import SalesQuoteView from '@/features/workspace/modules/SalesQuoteView';
import SalesReceiptView from '@/features/workspace/modules/SalesReceiptView';
import SalesReturnView from '@/features/workspace/modules/SalesReturnView';
import SalesTargetView from '@/features/workspace/modules/SalesTargetView';
import SavedTransactionsView from '@/features/workspace/modules/SavedTransactionsView';
import ShippingView from '@/features/workspace/modules/ShippingView';
import SimpleMasterView from '@/features/workspace/modules/SimpleMasterView';
import StockOpnameOrderView from '@/features/workspace/modules/StockOpnameOrderView';
import StockOpnameResultView from '@/features/workspace/modules/StockOpnameResultView';
import StockTransferView from '@/features/workspace/modules/StockTransferView';
import SupplierPriceView from '@/features/workspace/modules/SupplierPriceView';
import SupplierTransferView from '@/features/workspace/modules/SupplierTransferView';
import TableListView from '@/features/workspace/modules/TableListView';
import TaxView from '@/features/workspace/modules/TaxView';
import TransactionApprovalView from '@/features/workspace/modules/TransactionApprovalView';
import UsersManagementView from '@/features/workspace/modules/UsersManagementView';
import WarehouseView from '@/features/workspace/modules/WarehouseView';
import WorkOrderView from '@/features/workspace/modules/WorkOrderView';

export const STATIC_PAGE_RENDERERS = {
    preferences: (page) => <PreferencesView page={page} />,
    'activity-log': (page) => <ActivityLogView page={page} />,
    'sales-checkin': (page) => <TableListView table={page.table} />,
    'report-list': (page) => <ReportListView page={page} />,
    'budget-monitor': (page) => <BudgetMonitorView page={page} />,
    contacts: (page) => <ContactView page={page} />,
    'favorite-transactions': (page) => <SavedTransactionsView page={page} />,
    'recurring-transactions': (page) => <SavedTransactionsView page={page} />,
    'order-fulfillment': (page) => <OrderFulfillmentView page={page} />,
    'minimum-stock': (page) => <InventoryInquiryView config={page.minimumStock} />,
    'item-location': (page) => <InventoryInquiryView config={page.itemLocation} />,
    'asset-location': (page) => <AssetLocationView page={page} />,
    'supplier-transfer': (page) => <SupplierTransferView page={page} />,
    'salary-allowance': (page) => <SalaryAllowanceView page={page} />,
    users: (page, mode) => <UsersManagementView page={page} mode={mode} />,
};

export const CONTENT_PAGE_COMPONENTS = {
    branch: BranchView,
    department: DepartmentView,
    'shipping-master': ShippingView,
    'period-end': PeriodEndView,
    employees: EmployeeView,
    'supplier-price': SupplierPriceView,
    numbering: NumberingView,
    budget: BudgetView,
    'budget-transfer': BudgetTransferView,
    'payment-order': PaymentOrderView,
    'payroll-entry': PayrollEntryView,
    'print-design': PrintDesignView,
    'transaction-approval': TransactionApprovalView,
};

export const LEVEL2_CONTENT_PAGE_COMPONENTS = {
    'fob-master': SimpleMasterView,
};

export const LEVEL2_DETAIL_PAGE_COMPONENTS = {
    'sales-quote': SalesQuoteView,
    'sales-order': SalesOrderView,
    'sales-delivery': SalesDeliveryView,
    'sales-invoice': SalesInvoiceView,
    'sales-deposit': SalesDepositView,
    'sales-receipt': SalesReceiptView,
    'sales-return': SalesReturnView,
    'purchase-order': PurchaseOrderView,
    'purchase-deposit': PurchaseDepositView,
    'purchase-invoice': PurchaseInvoiceView,
    'purchase-payment': PurchasePaymentView,
    'purchase-return': PurchaseReturnView,
    'goods-receipt': GoodsReceiptView,
    'item-request': ItemRequestView,
    'currency-master': CurrencyView,
    'warehouse-master': WarehouseView,
    'items-services': ItemsServicesView,
    'item-unit': SimpleMasterView,
    'item-category': ItemCategoryView,
    'payment-terms': PaymentTermsView,
    'customer-category': SimpleMasterView,
    'supplier-category': SimpleMasterView,
    'sales-category': SimpleMasterView,
    'price-adjustment': InventoryAdjustmentView,
    'inventory-adjustment': InventoryAdjustmentView,
    'stock-transfer': StockTransferView,
    'work-order': WorkOrderView,
    'material-addition': MaterialAdditionView,
    'stock-opname-order': StockOpnameOrderView,
    'stock-opname-result': StockOpnameResultView,
    'sales-commission': SalesCommissionView,
    'sales-target': SalesTargetView,
    'company-tax': TaxView,
    accounts: AccountsView,
    'group-access': GroupAccessView,
    'bank-transfer': BankTransferView,
    'cash-payment': CashPaymentView,
    'cash-receipt': CashReceiptView,
    'expense-entry': ExpenseEntryView,
    'fixed-assets': FixedAssetsView,
    'asset-change': AssetChangeView,
    'asset-category': AssetCategoryView,
    'asset-tax-category': AssetTaxCategoryView,
    'asset-disposal': AssetDisposalView,
    'asset-move': AssetMoveView,
    'general-journal': GeneralJournalView,
};

export const BANK_INQUIRY_PAGE_IDS = new Set([
    'bank-statement',
    'bank-history',
    'account-history',
    'bank-reconciliation',
]);

export { BankInquiryView };
