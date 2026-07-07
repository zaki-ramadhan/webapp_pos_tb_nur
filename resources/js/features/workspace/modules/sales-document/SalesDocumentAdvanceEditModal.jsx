import { useState, useEffect, useCallback } from 'react';

import DocumentModalLayout, { DocumentModalFooter } from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import { DocumentModalCurrencyField } from '@/features/workspace/modules/shared/document-modal/DocumentModalFields';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { parseNumericInput, formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';

const MODAL_TABS = [
    { id: 'advance', label: 'Uang Muka' },
];

const FIELD_H = 'h-[38px]';
const FIELD_ROUNDED = 'rounded-[4px]';
const FIELD_BORDER = 'border-ui-border';

function buildInitialForm(item) {
    if (item) {
        return {
            id: item.id,
            __lineId: item.__lineId ?? null,
            __depositId: item.__depositId ?? null,
            number: item.number ?? '',
            amount: item.amount ?? '0',
            notes: item.notes ?? '',
        };
    }
    return {
        id: null,
        __lineId: null,
        __depositId: null,
        number: '',
        amount: '0',
        notes: '',
    };
}

export default function SalesDocumentAdvanceEditModal({
    open,
    onClose,
    item = null,
    maxAllowed = null,
    onSubmit,
    onDelete,
}) {
    const isEdit = Boolean(item && !item.isNew);
    const [form, setForm] = useState(() => buildInitialForm(item));

    useEffect(() => {
        if (open) {
            setForm(buildInitialForm(item));
        }
    }, [open, item]);

    const handleChange = useCallback((patch) => {
        setForm((prev) => ({ ...prev, ...patch }));
    }, []);

    function handleOpenSource() {
        if (!form.__depositId || !form.number) return;
        window.dispatchEvent(
            new CustomEvent('workspace:open-page', {
                detail: {
                    pageId: 'sales-deposit',
                    recordId: String(form.__depositId),
                    label: form.number,
                    tabLabel: form.number,
                },
            })
        );
        onClose();
    }

    function handleSubmit() {
        const amountValue = parseNumericInput(form.amount);
        if (amountValue <= 0) {
            showSystemErrorModal({
                title: 'Gagal Menyimpan',
                description: 'Nilai Uang Muka harus lebih besar dari 0.',
            });
            return;
        }

        if (maxAllowed != null && amountValue > maxAllowed) {
            showSystemErrorModal({
                title: 'Gagal Menyimpan',
                description: `Nilai Uang Muka tidak boleh melebihi Total Faktur Penjualan (Maksimal yang diperbolehkan: Rp ${formatCurrencyValue(maxAllowed)}).`,
            });
            return;
        }

        const nextAdvance = {
            ...(item ?? {}),
            id: item?.id ?? `advance-item-${Date.now()}-${Math.random()}`,
            __lineId: item?.__lineId ?? null,
            __depositId: form.__depositId,
            number: form.number,
            amount: formatCurrencyValue(amountValue),
            notes: form.notes,
        };

        // Remove temporary flag if present
        delete nextAdvance.isNew;

        onSubmit?.(nextAdvance);
        onClose();
    }

    function handleDelete() {
        onDelete?.(item);
        onClose();
    }

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title="Uang Muka"
            tabs={MODAL_TABS}
            activeTabId="advance"
            onTabChange={() => {}}
            closeAriaLabel="Tutup modal uang muka"
            panelClassName="max-w-[480px] overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[160px] py-4"
            footer={
                <DocumentModalFooter
                    deleteLabel={isEdit ? 'Hapus' : 'Batal'}
                    submitLabel="Lanjut"
                    onDelete={isEdit ? handleDelete : onClose}
                    onSubmit={handleSubmit}
                />
            }
        >
            <div className="grid gap-y-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-x-4 sm:items-center px-6">
                {/* No Faktur # */}
                <TransactionFieldLabel label="No Faktur #" />
                <button
                    type="button"
                    onClick={handleOpenSource}
                    title="Klik untuk membuka transaksi asal"
                    className="flex items-center px-3 py-2 border rounded-[4px] w-full text-left transition duration-150 ease-in-out text-xs sm:text-sm font-normal h-[38px] bg-emerald-50 border-emerald-600 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-700 cursor-pointer"
                >
                    <span className="truncate">{form.number || '-'}</span>
                </button>

                {/* Uang Muka */}
                <TransactionFieldLabel label="Uang Muka" required />
                <DocumentModalCurrencyField
                    value={form.amount}
                    onChange={(e) => handleChange({ amount: e.target.value })}
                    className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER}`}
                />
            </div>
        </DocumentModalLayout>
    );
}
