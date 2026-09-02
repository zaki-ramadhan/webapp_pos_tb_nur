import { useState, useEffect, useCallback } from 'react';
import { showErrorToast } from '@/components/feedback/toast';

import DocumentModalLayout, { DocumentModalFooter } from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import { DocumentModalCurrencyField } from '@/features/workspace/modules/shared/document-modal/DocumentModalFields';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import SelectField from '@/components/ui/SelectField';
import { parseNumericInput, formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';

const MODAL_TABS = [
    { id: 'cost', label: 'Biaya Lainnya' },
    { id: 'info', label: 'Catatan' },
];

const FIELD_H = 'h-[38px]';
const FIELD_ROUNDED = 'rounded-[4px]';
const FIELD_BORDER = 'border-ui-border';
const FIELD_INPUT_CLS = 'text-xs sm:text-sm text-brand-dark';
const FIELD_INPUT_RIGHT_CLS = 'text-right text-xs sm:text-sm text-brand-dark';

// ─── Toggle Switch Component ──────────────────────────────────────────────────

function ToggleSwitch({ label, checked, onChange, disabled }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={[
                    'relative inline-flex h-6 w-10 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-accent/40',
                    checked ? 'bg-brand-blue-accent' : 'bg-slate-300',
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
            >
                <span
                    className={[
                        'pointer-events-none inline-block h-5 w-5 translate-y-0 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out',
                        checked ? 'translate-x-4' : 'translate-x-0',
                    ].join(' ')}
                />
            </button>
            <span className="text-xs sm:text-sm font-normal text-brand-dark">{label}</span>
        </label>
    );
}

// ─── Tab: Biaya Lainnya ───────────────────────────────────────────────────────

function CostDetailTab({ form, onChange, errors = {} }) {
    const { code, name, amount } = form;

    return (
        <div className="grid gap-y-2.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-4 sm:items-center">
            {/* Kode # */}
            <TransactionFieldLabel label="Kode Barang" />
            <div className="flex items-center h-[34px]">
                <span className="text-xs sm:text-sm font-medium text-document-code">{code || '-'}</span>
            </div>

            {/* Nama Biaya */}
            <TransactionFieldLabel label="Nama Biaya" required />
            <TextInput
                value={name}
                readOnly
                trailing={
                    name ? (
                        <button
                            type="button"
                            className="text-lg font-semibold text-brand-dark"
                            onClick={() => onChange({ name: '' })}
                        >
                            ×
                        </button>
                    ) : null
                }
                error={errors.name}
                className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER}`}
                inputClassName={FIELD_INPUT_CLS}
                trailingClassName="px-3"
            />

            {/* Jumlah */}
            <TransactionFieldLabel label="Jumlah" />
            <DocumentModalCurrencyField
                value={amount}
                onChange={(e) => onChange({ amount: e.target.value })}
                error={errors.amount}
                className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER}`}
            />
        </div>
    );
}

// ─── Tab: Info lainnya ───────────────────────────────────────────────────────

function CostInfoTab({ form, onChange }) {
    return (
        <div className="grid gap-y-2.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-4 sm:items-start">
            <TransactionFieldLabel label="Keterangan" />
            <TextareaField
                value={form.notes ?? ''}
                onChange={(e) => onChange({ notes: e.target.value })}
                rows={4}
                className="min-h-[92px]"
            />
        </div>
    );
}

function buildInitialForm(item) {
    if (item) {
        return {
            id: item.id,
            __lineId: item.__lineId ?? null,
            __accountId: item.__accountId ?? null,
            name: item.name ?? '',
            accountName: item.accountName ?? item.name ?? '',
            code: item.code ?? '',
            amount: item.amount ?? '0',
            notes: item.notes ?? '',
        };
    }
    return {
        id: null,
        __lineId: null,
        __accountId: null,
        name: '',
        accountName: '',
        code: '',
        amount: '0',
        notes: '',
    };
}

export default function SalesDocumentCostEditModal({
    open,
    onClose,
    item = null,
    onSubmit,
    onDelete,
}) {
    const isEdit = Boolean(item);
    const [activeTabId, setActiveTabId] = useState('cost');
    const [form, setForm] = useState(() => buildInitialForm(item));
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setForm(buildInitialForm(item));
            setActiveTabId('cost');
            setErrors({});
        }
    }, [open, item]);

    const handleChange = useCallback((patch) => {
        setForm((prev) => ({ ...prev, ...patch }));
        setErrors((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(patch)) {
                delete next[key];
            }
            return next;
        });
    }, []);

    function handleSubmit() {
        const newErrors = {};
        if (!String(form.name ?? '').trim()) {
            newErrors.name = 'Nama biaya harus diisi.';
        }
        const amountValue = parseNumericInput(form.amount);
        if (amountValue <= 0) {
            newErrors.amount = 'Jumlah biaya harus lebih besar dari 0.';
        }

        if (Object.keys(newErrors).length > 0) {
            onClose();
            return;
        }

        const nextCost = {
            ...(item ?? {}),
            id: item?.id ?? `cost-item-${Date.now()}-${Math.random()}`,
            __lineId: item?.__lineId ?? null,
            __accountId: form.__accountId,
            name: form.name,
            accountName: form.accountName,
            code: form.code,
            amount: formatCurrencyValue(amountValue),
            notes: form.notes,
        };

        onSubmit?.(nextCost);
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
            title="Biaya Lainnya"
            tabs={MODAL_TABS}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup biaya lainnya"
            panelClassName="max-w-[540px] overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[260px] py-2"
            footer={
                <DocumentModalFooter
                    deleteLabel={isEdit ? 'Hapus' : 'Batal'}
                    submitLabel="Lanjut"
                    onDelete={isEdit ? handleDelete : onClose}
                    onSubmit={handleSubmit}
                />
            }
        >
            {activeTabId === 'info' ? (
                <CostInfoTab form={form} onChange={handleChange} />
            ) : (
                <CostDetailTab form={form} onChange={handleChange} errors={errors} />
            )}
        </DocumentModalLayout>
    );
}
