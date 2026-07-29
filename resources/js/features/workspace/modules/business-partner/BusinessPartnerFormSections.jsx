import { ContactsTab, GeneralTab, ShippingTab } from './BusinessPartnerProfileSections';
import { BalanceTab, SalesTab, TaxTab } from './BusinessPartnerTransactionSections';
import CustomerOthersTab from './components/tabs/CustomerOthersTab';
import SupplierPurchaseTab from './components/tabs/SupplierPurchaseTab';
import SupplierOthersTab from './components/tabs/SupplierOthersTab';
import CustomerReceivablesTab from './components/tabs/CustomerReceivablesTab';

export function renderPartnerTab({ config, values, isDetail, activeTabId, onChange }) {
    if (activeTabId === 'receivables_history' || activeTabId === 'piutang') {
        return <CustomerReceivablesTab recordId={values.__backendRecordId || values.id} />;
    }

    if (activeTabId === 'contacts') {
        return <ContactsTab config={config} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'shipping') {
        return <ShippingTab config={config} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'sales') {
        return <SalesTab config={config} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'purchase') {
        return <SupplierPurchaseTab config={config} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'tax') {
        return <TaxTab config={config} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'receivable' || activeTabId === 'payable') {
        return <BalanceTab config={config} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'others') {
        return config.partnerType === 'supplier' ? (
            <SupplierOthersTab config={config} values={values} onChange={onChange} />
        ) : (
            <CustomerOthersTab config={config} values={values} onChange={onChange} />
        );
    }

    return <GeneralTab config={config} values={values} isDetail={isDetail} onChange={onChange} />;
}
