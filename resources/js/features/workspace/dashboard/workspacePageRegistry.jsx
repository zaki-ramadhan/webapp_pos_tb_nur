import AccountsView from '@/features/workspace/modules/accounts/AccountsView';
import ActivityLogView from '@/features/workspace/modules/activity-log/ActivityLogView';
import AssetCategoryView from '@/features/workspace/modules/asset-category/AssetCategoryView';
import AssetChangeView from '@/features/workspace/modules/asset-change/AssetChangeView';
import AssetDisposalView from '@/features/workspace/modules/asset-disposal/AssetDisposalView';
import AssetLocationView from '@/features/workspace/modules/asset-location/AssetLocationView';
import AssetMoveView from '@/features/workspace/modules/asset-move/AssetMoveView';
import AssetTaxCategoryView from '@/features/workspace/modules/asset-tax-category/AssetTaxCategoryView';
import BankInquiryView from '@/features/workspace/modules/bank-inquiry/BankInquiryView';
import BankTransferView from '@/features/workspace/modules/bank-transfer/BankTransferView';
import BranchView from '@/features/workspace/modules/branch/BranchView';
import BudgetMonitorView from '@/features/workspace/modules/budget-monitor/BudgetMonitorView';
import BudgetTransferView from '@/features/workspace/modules/budget-transfer/BudgetTransferView';
import BudgetView from '@/features/workspace/modules/budget/BudgetView';
import CashPaymentView from '@/features/workspace/modules/cash-payment/CashPaymentView';
import CashReceiptView from '@/features/workspace/modules/cash-receipt/CashReceiptView';
import ContactView from '@/features/workspace/modules/contacts/ContactView';
import CurrencyView from '@/features/workspace/modules/currency/CurrencyView';
import DepartmentView from '@/features/workspace/modules/department/DepartmentView';
import EmployeeView from '@/features/workspace/modules/employee/EmployeeView';
import ExpenseEntryView from '@/features/workspace/modules/expense-entry/ExpenseEntryView';
import FixedAssetsView from '@/features/workspace/modules/fixed-assets/FixedAssetsView';
import GeneralJournalView from '@/features/workspace/modules/general-journal/GeneralJournalView';
import GoodsReceiptView from '@/features/workspace/modules/sales-document/GoodsReceiptView';
import GroupAccessView from '@/features/workspace/modules/group-access/GroupAccessView';
import InventoryAdjustmentView from '@/features/workspace/modules/inventory-adjustment/InventoryAdjustmentView';
import InventoryInquiryView from '@/features/workspace/modules/inventory-inquiry/InventoryInquiryView';
import ItemCategoryView from '@/features/workspace/modules/item-category/ItemCategoryView';
import ItemRequestView from '@/features/workspace/modules/item-request/ItemRequestView';
import ItemsServicesView from '@/features/workspace/modules/items-services/ItemsServicesView';
import MaterialAdditionView from '@/features/workspace/modules/material-addition/MaterialAdditionView';
import NumberingView from '@/features/workspace/modules/numbering/NumberingView';
import OrderFulfillmentView from '@/features/workspace/modules/inventory-fulfillment/OrderFulfillmentView';
import PaymentOrderView from '@/features/workspace/modules/payment-order/PaymentOrderView';
import PaymentTermsView from '@/features/workspace/modules/payment-terms/PaymentTermsView';
import PayrollEntryView from '@/features/workspace/modules/payroll-entry/PayrollEntryView';
import PeriodEndView from '@/features/workspace/modules/period-end/PeriodEndView';
import PreferencesView from '@/features/workspace/preferences/PreferencesView';
import PrintDesignView from '@/features/workspace/modules/print-design/PrintDesignView';
import PurchaseDepositView from '@/features/workspace/modules/purchase-deposit/PurchaseDepositView';
import PurchaseInvoiceView from '@/features/workspace/modules/sales-document/PurchaseInvoiceView';
import PurchaseOrderView from '@/features/workspace/modules/sales-document/PurchaseOrderView';
import PurchasePaymentView from '@/features/workspace/modules/purchase-payment/PurchasePaymentView';
import PurchaseReturnView from '@/features/workspace/modules/sales-document/PurchaseReturnView';
import ReportListView from '@/features/workspace/modules/report-list/ReportListView';
import SalaryAllowanceView from '@/features/workspace/modules/salary-allowance/SalaryAllowanceView';
import SalesCommissionView from '@/features/workspace/modules/sales-commission/SalesCommissionView';
import SalesCheckinView from '@/features/workspace/modules/sales-checkin/SalesCheckinView';
import SalesDeliveryView from '@/features/workspace/modules/sales-document/SalesDeliveryView';
import SalesDepositView from '@/features/workspace/modules/sales-deposit/SalesDepositView';
import SalesInvoiceView from '@/features/workspace/modules/sales-document/SalesInvoiceView';
import SalesOrderView from '@/features/workspace/modules/sales-document/SalesOrderView';
import SalesQuoteView from '@/features/workspace/modules/sales-document/SalesQuoteView';
import SalesReceiptView from '@/features/workspace/modules/sales-receipt/SalesReceiptView';
import SalesReturnView from '@/features/workspace/modules/sales-document/SalesReturnView';
import SalesTargetView from '@/features/workspace/modules/sales-target/SalesTargetView';
import SavedTransactionsView from '@/features/workspace/modules/saved-transactions/SavedTransactionsView';
import ShippingView from '@/features/workspace/modules/shipping/ShippingView';
import SimpleMasterView from '@/features/workspace/modules/SimpleMasterView';
import StockOpnameOrderView from '@/features/workspace/modules/stock-opname-order/StockOpnameOrderView';
import StockOpnameResultView from '@/features/workspace/modules/stock-opname-result/StockOpnameResultView';
import StockTransferView from '@/features/workspace/modules/stock-transfer/StockTransferView';
import SupplierPriceView from '@/features/workspace/modules/supplier-price/SupplierPriceView';
import SupplierTransferView from '@/features/workspace/modules/supplier-transfer/SupplierTransferView';
import TableListView from '@/features/workspace/modules/TableListView';
import TaxView from '@/features/workspace/modules/tax/TaxView';
import TransactionApprovalView from '@/features/workspace/modules/transaction-approval/TransactionApprovalView';
import UsersManagementView from '@/features/workspace/modules/users-management/UsersManagementView';
import WarehouseView from '@/features/workspace/modules/warehouse/WarehouseView';
import WorkOrderView from '@/features/workspace/modules/work-order/WorkOrderView';

export const STATIC_PAGE_RENDERERS = {
    preferences: (page) => <PreferencesView page={page} />,
    'activity-log': (page) => <ActivityLogView page={page} />,
    'sales-checkin': (page) => <SalesCheckinView page={page} />,
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
