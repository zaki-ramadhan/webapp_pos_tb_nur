import { useEffect, useState, useCallback } from 'react';
import { showErrorToast } from '@/components/feedback/toast';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { TableActionIcon } from '@/features/workspace/shared/Icons';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function buildInitialValues(item = {}) {
    const source = item ?? {};

    return {
        __productId: source.__productId ?? null,
        code: source.code ?? '',
        name: source.name ?? '',
        adjustmentType: source.adjustmentType ?? 'Penambahan',
        quantity: source.quantity ?? '',
        unitLookup: cloneList(source.unitLookup),
        unitCost: source.unitCost ?? '',
        totalCost: source.totalCost ?? '',
        warehouse: cloneList(source.warehouse),
        department: cloneList(source.department),
        notes: source.notes ?? '',
    };
}

function ModalFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[156px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className="pt-2 text-xs font-normal text-slate-700" />
            <div>{children}</div>
        </div>
    );
}

function DetailTab({ values, setValues, modal, errors = {} }) {
    return (
        <div className="space-y-3">
            <ModalFieldRow label="Kode #">
                <div className="flex h-[36px] items-center text-xs sm:text-sm font-medium text-document-code">{values.code || '—'}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Nama Barang" required>
                <TextInput
                    value={values.name}
                    readOnly
                    placeholder="Klik cari untuk pilih produk..."
                    error={errors.name}
                    trailing={
                        <button
                            type="button"
                            onClick={async () => {
                                const record = await promptSelectBackendRecord(
                                    'items-services',
                                    'produk',
                                    (p) => `[${p.code ?? ''}] ${p.name ?? ''}`,
                                );
                                if (!record) return;
                                setValues((current) => ({
                                    ...current,
                                    __productId: record.id,
                                    name: record.name ?? '',
                                    code: record.code ?? '',
                                    unitLookup: record.base_unit?.name ? [record.base_unit.name] : current.unitLookup,
                                }));
                            }}
                            className="inline-flex h-full items-center px-3 text-xs font-medium text-brand-blue hover:text-brand-blue-darker"
                        >
                            Cari
                        </button>
                    }
                    className="h-[36px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs text-brand-dark"
                    trailingClassName="px-0 border-l border-ui-border"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Tipe Penyesuaian">
                <SelectField
                    value={values.adjustmentType}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            adjustmentType: event.target.value,
                        }))
                    }
                    className="h-[34px] rounded-[4px] border-ui-border"
                    selectClassName="text-xs text-brand-dark"
                    containerClassName="max-w-[204px]"
                >
                    {(modal.adjustmentTypeOptions ?? ['Penambahan', 'Pengurangan']).map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </ModalFieldRow>

            <ModalFieldRow label="Kuantitas" required>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_116px]">
                    <TextInput
                        value={values.quantity}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                quantity: event.target.value,
                            }))
                        }
                        trailing={<TableActionIcon className="h-4 w-4 text-text-darkest" />}
                        error={errors.quantity}
                        className="h-[36px] rounded-[4px] border-ui-border"
                        inputClassName="text-right text-xs text-brand-dark"
                        trailingClassName="px-3"
                    />
                    <ChipLookupField
                        values={values.unitLookup}
                        placeholder=""
                        searchLabel="Cari satuan"
                        onRemove={(unitValue) =>
                            setValues((current) => ({
                                ...current,
                                unitLookup: current.unitLookup.filter((item) => item !== unitValue),
                            }))
                        }
                        heightClassName="h-[36px]"
                    />
                </div>
            </ModalFieldRow>

            <ModalFieldRow label="Biaya Satuan">
                <FormattedAmountInput
                    value={values.unitCost}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            unitCost: event.target.value,
                        }))
                    }
                    prefix="Rp"
                    maxLength={11}
                    trailing={<TableActionIcon className="h-4 w-4 text-text-darkest" />}
                    className="h-[34px] rounded-[4px] border-ui-border"
                    prefixClassName="min-w-[36px] justify-center bg-input-prefix-bg-compact px-0 text-text-inactive"
                    inputClassName="text-right text-xs text-brand-dark"
                    trailingClassName="px-3"
                    containerClassName="max-w-[204px]"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Total Biaya">
                <TextInput
                    value={values.totalCost}
                    readOnly
                    className="h-[34px] rounded-[4px] border-ui-border bg-bg-workspace-input-panel"
                    inputClassName="text-right text-xs text-tab-view-active-text"
                    containerClassName="max-w-[204px]"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Gudang" required>
                <ChipLookupField
                    values={values.warehouse}
                    placeholder="Cari/Pilih..."
                    searchLabel="Cari gudang"
                    onRemove={(warehouseValue) =>
                        setValues((current) => ({
                            ...current,
                            warehouse: current.warehouse.filter((item) => item !== warehouseValue),
                        }))
                    }
                    error={errors.warehouse}
                    heightClassName="h-[36px]"
                    className="max-w-[204px]"
                />
            </ModalFieldRow>
        </div>
    );
}

function InfoTab({ values, setValues }) {
    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="space-y-3">
            {!hideDepartment ? (
                <ModalFieldRow label="Departemen">
                    <ChipLookupField
                        values={values.department}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari departemen"
                        onRemove={(departmentValue) =>
                            setValues((current) => ({
                                ...current,
                                department: current.department.filter((item) => item !== departmentValue),
                            }))
                        }
                        heightClassName="h-[36px]"
                    />
                </ModalFieldRow>
            ) : null}

            <ModalFieldRow label="Keterangan">
                <TextareaField
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={4}
                    className="rounded-[4px] border-ui-border"
                    textareaClassName="min-h-[92px] text-xs text-brand-dark"
                />
            </ModalFieldRow>
        </div>
    );
}

export default function InventoryAdjustmentItemModal({ open, onClose, modal, item }) {
    const tabs = modal?.tabs ?? [];
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildInitialValues(item));
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setActiveTabId(tabs[0]?.id ?? 'details');
        setValues(buildInitialValues(item));
        setErrors({});
    }, [item, tabs]);

    const handleValuesChange = useCallback((updater) => {
        setValues(updater);
        setErrors({});
    }, []);

    if (!modal || !item) {
        return null;
    }

    const activeTabIdSafe = tabs.some((tab) => tab.id === activeTabId) ? activeTabId : tabs[0]?.id ?? 'details';

    function handleSubmit() {
        const newErrors = {};
        if (!String(values.name ?? '').trim()) {
            newErrors.name = 'Nama barang harus diisi.';
        }
        const qty = parseFloat(String(values.quantity).replace(/\./g, '').replace(/,/g, '.'));
        if (!qty || qty <= 0) {
            newErrors.quantity = 'Kuantitas harus lebih besar dari 0.';
        }
        if (!values.warehouse?.length) {
            newErrors.warehouse = 'Gudang harus diisi.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setActiveTabId(tabs[0]?.id ?? 'details');
            showErrorToast({ message: Object.values(newErrors)[0] });
            return;
        }

        onClose();
    }

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title={modal.title}
            tabs={tabs}
            activeTabId={activeTabIdSafe}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup rincian barang"
            panelClassName="max-w-[540px] overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[360px] py-4"
            footer={
                <DocumentModalFooter
                    deleteLabel={modal.deleteLabel}
                    submitLabel={modal.submitLabel}
                    onDelete={onClose}
                    onSubmit={handleSubmit}
                />
            }
        >
            {activeTabIdSafe === 'info' ? (
                <InfoTab values={values} setValues={handleValuesChange} />
            ) : (
                <DetailTab values={values} setValues={handleValuesChange} modal={modal} errors={errors} />
            )}
        </DocumentModalLayout>
    );
}
