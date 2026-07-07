import { useState, useEffect, useCallback } from 'react';

import DocumentModalLayout, { DocumentModalFooter } from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import { DocumentModalCurrencyField } from '@/features/workspace/modules/shared/document-modal/DocumentModalFields';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import SelectField from '@/components/ui/SelectField';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { parseNumericInput, formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';

const MODAL_TABS = [
    { id: 'cost', label: 'Biaya Lainnya' },
    { id: 'info', label: 'Info lainnya' },
    { id: 'deferral', label: 'Penangguhan' },
];

const MONTHS = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

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

function CostDetailTab({ form, onChange }) {
    const { code, name, amount } = form;

    return (
        <div className="grid gap-y-2.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-4 sm:items-center">
            {/* Kode # */}
            <TransactionFieldLabel label="Kode #" />
            <div className="flex items-center h-[34px]">
                <span className="text-xs sm:text-sm font-medium text-document-code">{code || '-'}</span>
            </div>

            {/* Nama Biaya */}
            <TransactionFieldLabel label="Nama Biaya" required />
            <TextInput
                value={name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="Masukkan nama biaya"
                className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER}`}
                inputClassName={FIELD_INPUT_CLS}
            />

            {/* Jumlah */}
            <TransactionFieldLabel label="Jumlah" />
            <DocumentModalCurrencyField
                value={amount}
                onChange={(e) => onChange({ amount: e.target.value })}
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

// ─── Tab: Penangguhan ─────────────────────────────────────────────────────────

function CostDeferralTab({ form, onChange }) {
    const { isDeferred, deferredAccount, recognitionMonths, recognitionMode, recognitionStartMonth, recognitionStartYear } = form;

    return (
        <div className="space-y-4">
            <div>
                <ToggleSwitch
                    label="Tangguhkan Pendapatan dan akui per akhir Bulan"
                    checked={isDeferred}
                    onChange={(checked) => onChange({ isDeferred: checked })}
                />
            </div>

            {isDeferred && (
                <div className="grid gap-y-2.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-4 sm:items-center pl-1">
                    {/* Akun Penangguhan */}
                    <TransactionFieldLabel label="Akun Penangguhan" required />
                    <AccountLookupField
                        values={deferredAccount}
                        placeholder="Cari/Pilih Akun Perkiraan..."
                        searchLabel="Cari akun penangguhan"
                        resource="accounts"
                        queryParams={{ account_type: 'Other Current Liability' }}
                        onRemove={() => onChange({ deferredAccount: [], __deferredAccountId: null })}
                        onSelectAccount={(rec) =>
                            onChange({ deferredAccount: [rec.name], __deferredAccountId: rec.id })
                        }
                        heightClassName={FIELD_H}
                    />

                    {/* Pengakuan/bln selama */}
                    <TransactionFieldLabel label="Pengakuan/bln selama" required />
                    <div className="flex items-center gap-2">
                        <FormattedAmountInput
                            value={recognitionMonths}
                            onChange={(e) => onChange({ recognitionMonths: e.target.value })}
                            allowDecimal={false}
                            allowNegative={false}
                            maxLength={3}
                            clearable={false}
                            containerClassName="!w-20 !max-w-none"
                            style={{ width: '80px' }}
                            className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER}`}
                            inputClassName={FIELD_INPUT_RIGHT_CLS}
                        />
                        <span className="text-xs sm:text-sm text-brand-dark">Bulan</span>
                    </div>

                    {/* Mulai Pengakuan */}
                    <div className="sm:col-start-1 sm:col-span-1 self-start pt-1.5">
                        <TransactionFieldLabel label="Mulai Pengakuan" />
                    </div>
                    <div className="space-y-2.5">
                        {/* Radio 1: Specific Month/Year */}
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                id="rec-mode-specific"
                                name="recognitionMode"
                                checked={recognitionMode === 'specific'}
                                onChange={() => onChange({ recognitionMode: 'specific' })}
                                className="h-4 w-4 text-brand-blue-accent border-slate-300 focus:ring-brand-blue cursor-pointer"
                            />
                            <div className="flex items-center gap-2">
                                <SelectField
                                    value={recognitionStartMonth}
                                    onChange={(e) => onChange({ recognitionStartMonth: Number(e.target.value) })}
                                    disabled={recognitionMode !== 'specific'}
                                    className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER} w-[140px]`}
                                    selectClassName="text-xs sm:text-sm text-brand-dark"
                                >
                                    {MONTHS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </SelectField>
                                <SelectField
                                    value={recognitionStartYear}
                                    onChange={(e) => onChange({ recognitionStartYear: Number(e.target.value) })}
                                    disabled={recognitionMode !== 'specific'}
                                    className={`${FIELD_H} ${FIELD_ROUNDED} ${FIELD_BORDER} w-[100px]`}
                                    selectClassName="text-xs sm:text-sm text-brand-dark"
                                >
                                    {YEARS.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </SelectField>
                            </div>
                        </div>

                        {/* Radio 2: Manual */}
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                id="rec-mode-manual"
                                name="recognitionMode"
                                checked={recognitionMode === 'manual'}
                                onChange={() => onChange({ recognitionMode: 'manual' })}
                                className="h-4 w-4 text-brand-blue-accent border-slate-300 focus:ring-brand-blue cursor-pointer"
                            />
                            <label htmlFor="rec-mode-manual" className="text-xs sm:text-sm text-brand-dark cursor-pointer">
                                Belum Ditentukan/jurnal manual
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Form Initializer ─────────────────────────────────────────────────────────

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
            // Deferral
            isDeferred: Boolean(item.isDeferred),
            deferredAccount: item.deferredAccount ?? [],
            __deferredAccountId: item.__deferredAccountId ?? null,
            recognitionMonths: item.recognitionMonths ?? '0',
            recognitionMode: item.recognitionMode ?? 'specific',
            recognitionStartMonth: item.recognitionStartMonth ?? new Date().getMonth() + 1,
            recognitionStartYear: item.recognitionStartYear ?? new Date().getFullYear(),
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
        // Deferral
        isDeferred: false,
        deferredAccount: [],
        __deferredAccountId: null,
        recognitionMonths: '0',
        recognitionMode: 'specific',
        recognitionStartMonth: new Date().getMonth() + 1,
        recognitionStartYear: new Date().getFullYear(),
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

    useEffect(() => {
        if (open) {
            setForm(buildInitialForm(item));
            setActiveTabId('cost');
        }
    }, [open, item]);

    const handleChange = useCallback((patch) => {
        setForm((prev) => ({ ...prev, ...patch }));
    }, []);

    function handleSubmit() {
        if (!form.__accountId) {
            showSystemErrorModal({
                title: 'Gagal Menyimpan',
                description: 'Nama Biaya harus diisi.',
            });
            return;
        }

        if (form.isDeferred) {
            if (!form.__deferredAccountId) {
                showSystemErrorModal({
                    title: 'Gagal Menyimpan',
                    description: 'Akun Penangguhan harus diisi.',
                });
                return;
            }

            const monthsNum = parseNumericInput(form.recognitionMonths);
            if (monthsNum <= 0) {
                showSystemErrorModal({
                    title: 'Gagal Menyimpan',
                    description: 'Pengakuan/bln selama harus lebih dari 0 Bulan.',
                });
                return;
            }
        }

        const amountValue = parseNumericInput(form.amount);

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
            // Deferral fields
            isDeferred: form.isDeferred,
            deferredAccount: form.deferredAccount,
            __deferredAccountId: form.__deferredAccountId,
            recognitionMonths: String(parseNumericInput(form.recognitionMonths)),
            recognitionMode: form.recognitionMode,
            recognitionStartMonth: form.recognitionStartMonth,
            recognitionStartYear: form.recognitionStartYear,
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
            ) : activeTabId === 'deferral' ? (
                <CostDeferralTab form={form} onChange={handleChange} />
            ) : (
                <CostDetailTab form={form} onChange={handleChange} />
            )}
        </DocumentModalLayout>
    );
}
