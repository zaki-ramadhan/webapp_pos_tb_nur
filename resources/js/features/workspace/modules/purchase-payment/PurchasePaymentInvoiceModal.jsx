import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

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

function buildModalState(modal, invoice, preferences = {}) {
    const invoiceState = invoice ?? {};
    const invoiceTab = modal?.invoice ?? {};
    const discountState = modal?.discountInfo ?? {};
    const prefDiscount = preferences['accounts-sales-purchase-discount'];
    const defaultDiscountAccount = (Array.isArray(prefDiscount) && prefDiscount.length > 0)
        ? prefDiscount
        : (typeof prefDiscount === 'string' && prefDiscount.trim() ? [prefDiscount.trim()] : ['[410103] Potongan / Diskon Penjualan']);

    const currentDiscountAccount = normalizeLookupValue(discountState.discountAccount ?? invoiceState.discountAccount);
    const resolvedDiscountAccount = currentDiscountAccount.length > 0 ? currentDiscountAccount : defaultDiscountAccount;

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
        discountAccount: resolvedDiscountAccount,
        discountAmount: discountState.discountAmount ?? invoiceState.discountValue ?? '',
        discountNotes: discountState.discountNotes ?? invoiceState.discountNotes ?? '',
        department: normalizeLookupValue(discountState.department ?? invoiceState.department),
        discountRows: [...(discountState.rows ?? [])],
    };
}

export default function PurchasePaymentInvoiceModal({ open, onClose, modal, invoice }) {
    const inertiaProps = usePage()?.props ?? {};
    const preferences = inertiaProps.dashboard?.preferences ?? inertiaProps.workspace?.preferences ?? {};
    const tabs = modal?.tabs ?? [
        { id: 'invoice', label: 'Faktur' },
        { id: 'discount-info', label: 'Informasi Diskon' },
    ];
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'invoice');
    const [values, setValues] = useState(() => buildModalState(modal, invoice, preferences));

    useEffect(() => {
        setActiveTabId(tabs[0]?.id ?? 'invoice');
        setValues(buildModalState(modal, invoice, preferences));
    }, [invoice, modal, open, tabs, preferences]);

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
            panelClassName="max-w-[572px] overflow-hidden rounded-[4px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[430px] py-3"
            footer={<DocumentModalFooter onSubmit={onClose} />}
        >
            {activeTabId === 'discount-info' ? (
                <PurchasePaymentDiscountInfoTab values={values} setValues={setValues} />
            ) : (
                <PurchasePaymentInvoiceTab values={values} setValues={setValues} />
            )}
        </DocumentModalLayout>
    );
}
