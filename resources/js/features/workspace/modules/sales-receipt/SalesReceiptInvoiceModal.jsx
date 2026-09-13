import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import {
    SalesReceiptDiscountInfoTab,
    SalesReceiptInvoiceTab,
} from '@/features/workspace/modules/shared/document-modal/SalesReceiptInvoiceTabs';

function buildModalState(modal, preferences = {}) {
    const source = modal ?? {};
    const prefDiscount = preferences['accounts-sales-purchase-discount'];
    const defaultDiscountAccount = (Array.isArray(prefDiscount) && prefDiscount.length > 0)
        ? prefDiscount
        : (typeof prefDiscount === 'string' && prefDiscount.trim() ? [prefDiscount.trim()] : ['[410103] Potongan / Diskon Penjualan']);

    const resolvedDiscountAccount = (Array.isArray(source.discountAccount) && source.discountAccount.length > 0)
        ? source.discountAccount
        : defaultDiscountAccount;

    return {
        invoiceNumber: source.invoiceNumber ?? '',
        invoiceDate: source.invoiceDate ?? '',
        outstanding: source.outstanding ?? '',
        payment: source.payment ?? '',
        discountAccount: [...(resolvedDiscountAccount ?? [])],
        discountAmount: source.discountAmount ?? '',
        discountNotes: source.discountNotes ?? '',
        department: [...(source.department ?? [])],
        discountRows: [...(source.discountRows ?? [])],
    };
}

export default function SalesReceiptInvoiceModal({ open, onClose, modal, onSave, onDelete }) {
    const inertiaProps = usePage()?.props ?? {};
    const preferences = inertiaProps.dashboard?.preferences ?? inertiaProps.workspace?.preferences ?? {};
    const tabs = [
        { id: 'invoice', label: 'Faktur' },
        { id: 'discount', label: 'Informasi Diskon' },
    ];
    const [activeTabId, setActiveTabId] = useState('invoice');
    const [values, setValues] = useState(() => buildModalState(modal, preferences));

    useEffect(() => {
        if (!open) {
            setActiveTabId('invoice');
        }

        setValues(buildModalState(modal, preferences));
    }, [modal, open, preferences]);

    if (!modal) {
        return null;
    }

    const handleSave = () => {
        onSave?.(values);
    };

    const handleDelete = () => {
        onDelete?.();
    };

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title="Faktur"
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup rincian faktur"
            panelClassName="max-w-[570px] overflow-hidden rounded-[4px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[378px] py-3"
            footer={
                <DocumentModalFooter
                    onSubmit={handleSave}
                    onDelete={handleDelete}
                    submitLabel="Lanjut"
                    deleteLabel="Hapus"
                />
            }
        >
            {activeTabId === 'discount' ? (
                <SalesReceiptDiscountInfoTab values={values} setValues={setValues} />
            ) : (
                <SalesReceiptInvoiceTab values={values} setValues={setValues} />
            )}
        </DocumentModalLayout>
    );
}
