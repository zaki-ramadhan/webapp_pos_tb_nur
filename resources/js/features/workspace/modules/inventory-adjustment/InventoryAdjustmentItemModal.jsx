import { useEffect, useState } from 'react';

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

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function buildInitialValues(item = {}) {
    const source = item ?? {};

    return {
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

function DetailTab({ values, setValues, modal }) {
    return (
        <div className="space-y-3">
            <ModalFieldRow label="Kode #">
                <div className="flex h-[36px] items-center text-xs sm:text-sm font-medium text-[#22a3f2]">{values.code}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Nama Barang" required>
                <TextInput
                    value={values.name}
                    readOnly
                    trailing={<span className="text-xl font-semibold text-[#1f2436]">×</span>}
                    className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-xs text-[#1f2436]"
                    trailingClassName="px-3"
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
                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-xs text-[#1f2436]"
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
                        trailing={<TableActionIcon className="h-4 w-4 text-[#111827]" />}
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-right text-xs text-[#1f2436]"
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
                    trailing={<TableActionIcon className="h-4 w-4 text-[#111827]" />}
                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                    prefixClassName="min-w-[36px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
                    inputClassName="text-right text-xs text-[#1f2436]"
                    trailingClassName="px-3"
                    containerClassName="max-w-[204px]"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Total Biaya">
                <TextInput
                    value={values.totalCost}
                    readOnly
                    className="h-[34px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                    inputClassName="text-right text-xs text-[#6b7280]"
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
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[92px] text-xs text-[#1f2436]"
                />
            </ModalFieldRow>
        </div>
    );
}

export default function InventoryAdjustmentItemModal({ open, onClose, modal, item }) {
    const tabs = modal?.tabs ?? [];
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildInitialValues(item));

    useEffect(() => {
        setActiveTabId(tabs[0]?.id ?? 'details');
        setValues(buildInitialValues(item));
    }, [item, tabs]);

    if (!modal || !item) {
        return null;
    }

    const activeTabIdSafe = tabs.some((tab) => tab.id === activeTabId) ? activeTabId : tabs[0]?.id ?? 'details';

    return (
        <DocumentModalLayout
            open={open}
            onClose={onClose}
            title={modal.title}
            tabs={tabs}
            activeTabId={activeTabIdSafe}
            onTabChange={setActiveTabId}
            closeAriaLabel="Tutup rincian barang"
            panelClassName="max-w-[540px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
            bodyClassName="min-h-[360px] py-4"
            footer={
                <DocumentModalFooter
                    deleteLabel={modal.deleteLabel}
                    submitLabel={modal.submitLabel}
                    onDelete={onClose}
                    onSubmit={onClose}
                />
            }
        >
            {activeTabIdSafe === 'info' ? (
                <InfoTab values={values} setValues={setValues} />
            ) : (
                <DetailTab values={values} setValues={setValues} modal={modal} />
            )}
        </DocumentModalLayout>
    );
}
