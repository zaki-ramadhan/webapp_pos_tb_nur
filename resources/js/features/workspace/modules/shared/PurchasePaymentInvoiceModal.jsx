import { useEffect, useState } from 'react';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import {
    PurchasePaymentDiscountInfoTab,
    PurchasePaymentInvoiceTab,
} from '@/features/workspace/modules/shared/document-modal/PurchasePaymentInvoiceTabs';

function normalizeLookupValue(value) {
    if (Array.isArray(value)) {
        return value;
    }

    return value ? [value] : [];
}

function buildModalState(modal, invoice) {
    const invoiceState = invoice ?? {};
    const invoiceTab = modal?.invoice ?? {};
    const discountState = modal?.discountInfo ?? {};

    return {
        formNumber: invoiceState.formNumber ?? invoiceTab.formNumber ?? '',
        billNumber: invoiceState.number ?? invoiceTab.billNumber ?? '',
        outstanding: invoiceTab.outstanding ?? invoiceState.outstanding ?? '',
        pay: invoiceTab.pay ?? invoiceState.pay ?? '',
        payment: invoiceTab.payment ?? invoiceState.payment ?? '',
        pphChecked: invoiceTab.pphChecked ?? invoiceState.pphChecked ?? false,
        pphLabel: invoiceTab.pphLabel ?? invoiceState.pphLabel ?? '',
        pphAmount: invoiceTab.pphAmount ?? invoiceState.pphAmount ?? '',
        withholdingProof: invoiceTab.withholdingProof ?? invoiceState.withholdingProof ?? '',
        notice: invoiceTab.notice ?? '',
        discountAccount: normalizeLookupValue(discountState.discountAccount ?? invoiceState.discountAccount),
        discountAmount: discountState.discountAmount ?? invoiceState.discountValue ?? '',
        discountNotes: discountState.discountNotes ?? invoiceState.discountNotes ?? '',
        department: normalizeLookupValue(discountState.department ?? invoiceState.department),
        discountRows: [...(discountState.rows ?? [])],
    };
}

export default function PurchasePaymentInvoiceModal({ open, onClose, modal, invoice }) {
    const tabs = modal?.tabs ?? [
        { id: 'invoice', label: 'Faktur' },
        { id: 'discount-info', label: 'Informasi Diskon' },
    ];
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'invoice');
    const [values, setValues] = useState(() => buildModalState(modal, invoice));

    useEffect(() => {
        setActiveTabId(tabs[0]?.id ?? 'invoice');
        setValues(buildModalState(modal, invoice));
    }, [invoice, modal, open, tabs]);

    if (!modal || !invoice) {
        return null;
    }

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title={modal.title ?? 'Faktur'}
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup rincian faktur"
            panelClassName="max-w-[572px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
            bodyClassName="min-h-[430px] py-3"
            footer={<DocumentModalFooter />}
        >
            {activeTabId === 'discount-info' ? (
                <PurchasePaymentDiscountInfoTab values={values} setValues={setValues} />
            ) : (
                <PurchasePaymentInvoiceTab values={values} setValues={setValues} />
            )}
        </DocumentModalLayout>
    );
}
