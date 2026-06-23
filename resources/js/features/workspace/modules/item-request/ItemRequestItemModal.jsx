import { useEffect, useState } from 'react';

import DocumentModalLayout, {
    DocumentModalFooter,
} from '@/features/workspace/modules/shared/document-modal/DocumentModalLayout';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionDateInput,
    TransactionFieldLabel,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { TableActionIcon } from '@/features/workspace/shared/Icons';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

function cloneLookupValues(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function buildInitialValues(item = {}) {
    return {
        code: item.code ?? '',
        requestDate: item.requestDate ?? '',
        name: item.name ?? '',
        quantity: item.quantity ?? '',
        unit: cloneLookupValues(item.unit),
        department: cloneLookupValues(item.department),
        notes: item.notes ?? '',
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

function ItemDetailsTab({ values, setValues }) {
    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="space-y-3">
            <ModalFieldRow label="Kode #">
                <div className="flex h-[36px] items-center text-xs sm:text-sm font-medium text-[#22a3f2]">{values.code}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Tgl Diminta">
                <TransactionDateInput value={values.requestDate} className="max-w-[170px]" />
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

            <ModalFieldRow label="Kuantitas" required>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_124px]">
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
                        values={values.unit}
                        placeholder=""
                        searchLabel="Cari satuan"
                        onRemove={(unitValue) =>
                            setValues((current) => ({
                                ...current,
                                unit: current.unit.filter((item) => item !== unitValue),
                            }))
                        }
                        heightClassName="h-[36px]"
                    />
                </div>
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

function ItemNotesTab({ values, setValues }) {
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
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[92px] text-xs text-[#1f2436]"
                />
            </ModalFieldRow>
        </div>
    );
}

export default function ItemRequestItemModal({ open, onClose, modal, item }) {
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
            panelClassName="max-w-[620px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
            bodyClassName="min-h-[340px] py-4"
            footer={
                <DocumentModalFooter
                    deleteLabel={modal.deleteLabel}
                    submitLabel={modal.submitLabel}
                    onDelete={onClose}
                    onSubmit={onClose}
                />
            }
        >
            {activeTabIdSafe === 'notes' ? (
                <ItemNotesTab values={values} setValues={setValues} />
            ) : (
                <ItemDetailsTab values={values} setValues={setValues} />
            )}
        </DocumentModalLayout>
    );
}
