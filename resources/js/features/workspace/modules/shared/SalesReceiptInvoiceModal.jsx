import { useEffect, useState } from 'react';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import {
    SalesReceiptDiscountInfoTab,
    SalesReceiptInvoiceTab,
} from '@/features/workspace/modules/shared/document-modal/SalesReceiptInvoiceTabs';

function buildModalState(modal) {
    const source = modal ?? {};

    return {
        invoiceNumber: source.invoiceNumber ?? '',
        invoiceDate: source.invoiceDate ?? '',
        outstanding: source.outstanding ?? '',
        payment: source.payment ?? '',
        discountAccount: [...(source.discountAccount ?? [])],
        discountAmount: source.discountAmount ?? '',
        discountNotes: source.discountNotes ?? '',
        department: [...(source.department ?? [])],
        discountRows: [...(source.discountRows ?? [])],
    };
}

export default function SalesReceiptInvoiceModal({ open, onClose, modal }) {
    const tabs = [
        { id: 'invoice', label: 'Faktur' },
        { id: 'discount', label: 'Informasi Diskon' },
    ];
    const [activeTabId, setActiveTabId] = useState('invoice');
    const [values, setValues] = useState(() => buildModalState(modal));

    useEffect(() => {
        if (!open) {
            setActiveTabId('invoice');
        }

        setValues(buildModalState(modal));
    }, [modal, open]);

    if (!modal) {
        return null;
    }

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title="Faktur"
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup rincian faktur"
            panelClassName="max-w-[570px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
            bodyClassName="min-h-[378px] py-3"
            footer={<DocumentModalFooter />}
        >
            {activeTabId === 'discount' ? (
                <SalesReceiptDiscountInfoTab values={values} setValues={setValues} />
            ) : (
                <SalesReceiptInvoiceTab values={values} setValues={setValues} />
            )}
        </DocumentModalLayout>
    );
}
