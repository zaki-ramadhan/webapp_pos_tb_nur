import { useEffect, useState, useCallback } from 'react';
import { showErrorToast } from '@/components/feedback/toast';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    DownloadIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

function cloneLookupValues(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function buildInitialValues(item = {}) {
    const source = item ?? {};

    return {
        code: source.code ?? '',
        name: source.name ?? '',
        quantity: source.quantity ?? '',
        unitLookup: cloneLookupValues(source.unitLookup ?? source.unit),
        warehouse: cloneLookupValues(source.warehouse),
        department: cloneLookupValues(source.department),
        notes: source.notes ?? '',
        serialNumbers: [...(source.serialNumbers ?? [])],
    };
}

function ModalFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[168px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className="pt-2 text-xs font-normal text-slate-700" />
            <div>{children}</div>
        </div>
    );
}

function DetailTab({ values, setValues, errors = {} }) {
    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="space-y-3">
            <ModalFieldRow label="Kode #">
                <div className="flex h-[36px] items-center text-xs sm:text-sm font-medium text-document-code">{values.code}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Nama Barang" required>
                <TextInput
                    value={values.name}
                    readOnly
                    error={errors.name}
                    trailing={<span className="text-xl font-semibold text-brand-dark">×</span>}
                    className="h-[36px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs text-brand-dark"
                    trailingClassName="px-3"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Kuantitas" required>
                <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
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

            <ModalFieldRow label="Gudang">
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
                />
            </ModalFieldRow>

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
        </div>
    );
}

function SerialRow({ value }) {
    return (
        <div className="grid grid-cols-[42px_minmax(0,1fr)] border-b border-table-row-border last:border-b-0">
            <div className="flex items-center justify-center bg-btn-danger-bg text-white cursor-pointer select-none">X</div>
            <div className="px-4 py-2 text-xs text-brand-dark">{value}</div>
        </div>
    );
}

function SerialTab({ values }) {
    return (
        <div className="space-y-3">
            <div className="grid gap-y-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label="Nomor #" className="text-xs font-normal text-slate-700" />
                <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-3">
                    <TextInput
                        value=""
                        readOnly
                        placeholder="Scan Barcode / Ketik lalu [Enter]"
                        className="h-[36px] rounded-[4px] border-ui-border"
                        inputClassName="text-xs text-brand-dark"
                    />
                    <button
                        type="button"
                        className="inline-flex h-[36px] items-center justify-center rounded-[4px] border border-import-action-blue bg-import-action-blue text-white"
                        aria-label="Unduh nomor seri"
                    >
                        <DownloadIcon className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-[4px] border border-table-wrapper-border">
                <div className="grid grid-cols-[42px_minmax(0,1fr)] bg-table-header-bg text-white">
                    <div className="border-r border-white/20" />
                    <div className="px-4 py-2 text-center text-sm font-medium">Nomor #</div>
                </div>

                <div className="max-h-[240px] overflow-y-auto bg-white">
                    {values.serialNumbers.length ? (
                        values.serialNumbers.map((serialNumber) => <SerialRow key={serialNumber} value={serialNumber} />)
                    ) : (
                        <div className="px-4 py-6 text-center text-xs text-text-placeholder">Belum ada data</div>
                    )}
                </div>
            </div>

            <div className="text-xs text-brand-dark">{values.serialNumbers.length} No Seri/Produksi</div>
        </div>
    );
}

function InfoTab({ values, setValues }) {
    return (
        <div className="space-y-3">
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

export default function WorkOrderItemModal({ open, onClose, modal, item }) {
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
            panelClassName="max-w-[620px] overflow-hidden rounded-[8px] px-0 py-0 shadow-modal-import"
            bodyClassName="min-h-[340px] py-4"
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
            ) : activeTabIdSafe === 'serials' ? (
                <SerialTab values={values} />
            ) : (
                <DetailTab values={values} setValues={handleValuesChange} errors={errors} />
            )}
        </DocumentModalLayout>
    );
}
