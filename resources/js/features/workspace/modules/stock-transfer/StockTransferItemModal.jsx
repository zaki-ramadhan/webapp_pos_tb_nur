import { useEffect, useState } from 'react';

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
        category: source.category ?? '',
        serialNumbers: [...(source.serialNumbers ?? [])],
        notes: source.notes ?? '',
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

function DetailTab({ values, setValues }) {
    return (
        <div className="space-y-3">
            <ModalFieldRow label="Kode #">
                <div className="flex h-[36px] items-center text-xs sm:text-sm font-medium text-[#22a3f2]">{values.code}</div>
            </ModalFieldRow>

            <ModalFieldRow label="Nama Barang">
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
                <TextInput
                    value={values.quantity}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            quantity: event.target.value,
                        }))
                    }
                    trailing={<TableActionIcon className="h-4 w-4 text-[#111827]" />}
                    className="h-[36px] max-w-[170px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-right text-xs text-[#1f2436]"
                    trailingClassName="px-3"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Satuan">
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
                    className="max-w-[216px]"
                />
            </ModalFieldRow>

            <ModalFieldRow label="Kategori Barang">
                <TextInput
                    value={values.category}
                    readOnly
                    className="h-[36px] max-w-[170px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                    inputClassName="text-center text-xs text-[#1f2436]"
                />
            </ModalFieldRow>
        </div>
    );
}

function SerialRow({ value }) {
    return (
        <div className="grid grid-cols-[42px_minmax(0,1fr)] border-b border-[#edf1f6] last:border-b-0">
            <div className="flex items-center justify-center bg-[#b82924] text-white cursor-pointer select-none">X</div>
            <div className="px-4 py-2 text-xs text-[#1f2436]">{value}</div>
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
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs text-[#1f2436]"
                    />
                    <button
                        type="button"
                        className="inline-flex h-[36px] items-center justify-center rounded-[4px] border border-[#1d52a5] bg-[#1d52a5] text-white"
                        aria-label="Unduh nomor seri"
                    >
                        <DownloadIcon className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-[4px] border border-[#d1d8e4]">
                <div className="grid grid-cols-[42px_minmax(0,1fr)] bg-[#5f7690] text-white">
                    <div className="border-r border-white/20" />
                    <div className="px-4 py-2 text-center text-sm font-medium">Nomor #</div>
                </div>

                <div className="max-h-[240px] overflow-y-auto bg-white">
                    {values.serialNumbers.length ? (
                        values.serialNumbers.map((serialNumber) => <SerialRow key={serialNumber} value={serialNumber} />)
                    ) : (
                        <div className="px-4 py-6 text-center text-xs text-[#7d879a]">Belum ada data</div>
                    )}
                </div>
            </div>

            <div className="text-xs text-[#1f2436]">{values.serialNumbers.length} No Seri/Produksi</div>
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
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[92px] text-xs text-[#1f2436]"
                />
            </ModalFieldRow>
        </div>
    );
}

export default function StockTransferItemModal({ open, onClose, modal, item }) {
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
            {activeTabIdSafe === 'info' ? (
                <InfoTab values={values} setValues={setValues} />
            ) : activeTabIdSafe === 'serials' ? (
                <SerialTab values={values} />
            ) : (
                <DetailTab values={values} setValues={setValues} />
            )}
        </DocumentModalLayout>
    );
}
