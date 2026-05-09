import { useEffect, useState } from 'react';

import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    CloseIcon,
    DownloadIcon,
    PencilIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

function ReadonlyDocumentTextarea({ value, rows = 3, className = '' }) {
    return (
        <textarea
            value={value}
            readOnly
            rows={rows}
            className={`w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none ${className}`.trim()}
        />
    );
}

function ModalTabButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`border-b-2 px-3 py-2 text-[16px] ${
                active ? 'border-[#ff4836] text-[#ff4836]' : 'border-transparent text-[#5f6980]'
            }`.trim()}
        >
            {label}
        </button>
    );
}

function ModalFooter({ deleteLabel, submitLabel }) {
    return (
        <div className="flex items-center justify-between border-t border-[#d8dde7] pt-3">
            <button
                type="button"
                className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-5 text-[18px] text-[#21539b]"
            >
                {deleteLabel ?? 'Hapus'}
            </button>
            <button
                type="button"
                className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#1d52a5] bg-[#1d52a5] px-6 text-[18px] text-white"
            >
                {submitLabel ?? 'Lanjut'}
            </button>
        </div>
    );
}

function CurrencyReadonlyField({ value, prefix = 'Rp', className = '', prefixAction = null }) {
    return (
        <div className={`grid gap-3 ${prefixAction ? 'grid-cols-[48px_minmax(0,1fr)]' : 'grid-cols-1'} ${className}`.trim()}>
            {prefixAction ? (
                <button
                    type="button"
                    className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#21539b]"
                    aria-label={prefixAction.ariaLabel ?? 'Aksi harga'}
                >
                    {prefixAction.content}
                </button>
            ) : null}
            <TextInput
                value={value ?? ''}
                readOnly
                prefix={prefix}
                trailing={<TableActionIcon className="h-4 w-4 text-[#111827]" />}
                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                prefixClassName="min-w-[48px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
                inputClassName="text-right text-[15px] font-semibold text-[#111827]"
                trailingClassName="px-3"
            />
        </div>
    );
}

function ItemDetailTab({ detail }) {
    return (
        <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
            <TransactionFieldLabel label="Kode #" />
            <div className="flex h-[36px] items-center text-[16px] font-semibold text-[#22a3f2]">{detail.code ?? ''}</div>

            <TransactionFieldLabel label="Nama Barang" required />
            <TextInput
                value={detail.name ?? ''}
                readOnly
                trailing={<span className="text-[22px] font-semibold text-[#1f2436]">×</span>}
                className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                inputClassName="text-[15px] text-[#1f2436]"
                trailingClassName="px-3"
            />

            <TransactionFieldLabel label="Kuantitas" required />
            <div className="grid grid-cols-[minmax(0,1fr)_128px] gap-3">
                <TextInput
                    value={detail.quantity ?? ''}
                    readOnly
                    trailing={<TableActionIcon className="h-4 w-4 text-[#111827]" />}
                    className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-right text-[15px] text-[#1f2436]"
                    trailingClassName="px-3"
                />
                <ChipLookupField
                    values={detail.unit ?? []}
                    placeholder=""
                    onRemove={() => {}}
                    searchLabel="Cari satuan"
                    heightClassName="h-[36px]"
                />
            </div>

            <TransactionFieldLabel label="@Harga" />
            <CurrencyReadonlyField
                value={detail.price}
                prefixAction={{ ariaLabel: 'Mode harga', content: <span className="text-[18px] font-semibold">@</span> }}
            />

            <TransactionFieldLabel label="Diskon" />
            <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-3">
                <TextInput
                    value={detail.discountPercent ?? ''}
                    readOnly
                    prefix="%"
                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                    prefixClassName="min-w-[42px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
                    inputClassName="text-right text-[15px] text-[#1f2436]"
                />
                <CurrencyReadonlyField value={detail.discountValue} />
            </div>

            <TransactionFieldLabel label="Total Harga" />
            <TextInput
                value={detail.total ?? ''}
                readOnly
                className="h-[34px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                inputClassName="text-right text-[15px] font-semibold text-[#111827]"
            />

            <TransactionFieldLabel label="Pajak" />
            <label className="inline-flex h-[34px] items-center gap-3 text-[17px] text-[#1f2436]">
                <input
                    type="checkbox"
                    checked={detail.taxChecked ?? false}
                    readOnly
                    className="h-[20px] w-[20px] rounded border border-[#cfd6e2]"
                />
                <span>{detail.taxLabel ?? 'PPN 10 %'}</span>
            </label>

            <TransactionFieldLabel label="Gudang" required />
            <ChipLookupField
                values={detail.warehouse ?? []}
                placeholder="Cari/Pilih..."
                onRemove={() => {}}
                searchLabel="Cari gudang"
                heightClassName="h-[36px]"
            />

            <TransactionFieldLabel label="Penjual" />
            <ChipLookupField
                values={detail.salesPerson ?? []}
                placeholder="Cari/Pilih..."
                onRemove={() => {}}
                searchLabel="Cari penjual"
                heightClassName="h-[36px]"
            />
        </div>
    );
}

function SerialRow({ value }) {
    return (
        <div className="grid grid-cols-[42px_minmax(0,1fr)] border-b border-[#edf1f6] last:border-b-0">
            <div className="flex items-center justify-center bg-[#b82924] text-white">
                <CloseIcon className="h-4 w-4 text-white" strokeWidth={2.4} />
            </div>
            <div className="px-4 py-2 text-[15px] text-[#1f2436]">{value}</div>
        </div>
    );
}

function ItemSerialTab({ detail }) {
    const serialNumbers = detail.serialNumbers ?? [];

    return (
        <div className="space-y-4">
            <div className="grid gap-y-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={detail.serialFieldLabel ?? 'Nomor #'} />
                <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-3">
                    <TextInput
                        value={detail.serialInput ?? ''}
                        readOnly
                        placeholder={detail.serialPlaceholder ?? 'Scan Barcode / Ketik lalu [Enter]'}
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                    <button
                        type="button"
                        className="inline-flex h-[36px] items-center justify-center rounded-[4px] border border-[#1d52a5] bg-[#1d52a5] text-white"
                        aria-label={detail.downloadLabel ?? 'Unduh nomor seri'}
                    >
                        <DownloadIcon className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-[4px] border border-[#d1d8e4]">
                <div className="grid grid-cols-[42px_minmax(0,1fr)] bg-[#5f7690] text-white">
                    <div className="border-r border-white/20" />
                    <div className="px-4 py-2 text-center text-[15px] font-medium">
                        {detail.serialColumnLabel ?? 'Nomor #'}
                    </div>
                </div>
                <div className="max-h-[280px] overflow-y-auto bg-white">
                    {serialNumbers.length ? (
                        serialNumbers.map((serialNumber) => <SerialRow key={serialNumber} value={serialNumber} />)
                    ) : (
                        <div className="px-4 py-6 text-center text-[15px] text-[#7d879a]">Belum ada data</div>
                    )}
                </div>
            </div>

            <div className="text-[15px] text-[#1f2436]">
                {detail.serialCountLabel ?? `${serialNumbers.length} No Seri/Produksi`}
            </div>
        </div>
    );
}

function ItemInfoTab({ detail }) {
    return (
        <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
            <TransactionFieldLabel label="Departemen" />
            <ChipLookupField
                values={detail.department ?? []}
                placeholder="Cari/Pilih..."
                onRemove={() => {}}
                searchLabel="Cari departemen"
                heightClassName="h-[36px]"
            />

            <TransactionFieldLabel label="Keterangan" />
            <ReadonlyDocumentTextarea value={detail.notes ?? ''} className="min-h-[92px]" />

            {detail.quoteNumber ? (
                <>
                    <TransactionFieldLabel label="No. Penawaran" />
                    <TextInput
                        value={detail.quoteNumber}
                        readOnly
                        className="h-[36px] rounded-[4px] border-[#8fdb5d] bg-[#f7fff2]"
                        inputClassName="text-[15px] font-semibold text-[#67b52c]"
                    />
                </>
            ) : null}

            {detail.orderNumber ? (
                <>
                    <TransactionFieldLabel label="No. Pesanan" />
                    <TextInput
                        value={detail.orderNumber}
                        readOnly
                        className="h-[36px] rounded-[4px] border-[#8fdb5d] bg-[#f7fff2]"
                        inputClassName="text-[15px] font-semibold text-[#67b52c]"
                    />
                </>
            ) : null}
        </div>
    );
}

export default function SalesDocumentItemModal({ open, onClose, modal }) {
    const [activeTabId, setActiveTabId] = useState(modal?.tabs?.[0]?.id ?? 'details');

    useEffect(() => {
        if (!open) {
            setActiveTabId(modal?.tabs?.[0]?.id ?? 'details');
        }
    }, [modal?.tabs, open]);

    if (!modal) {
        return null;
    }

    const activeTabIdSafe = modal.tabs.some((tab) => tab.id === activeTabId) ? activeTabId : modal.tabs[0]?.id ?? 'details';
    const detail = modal.values ?? {};

    return (
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-[rgba(15,23,42,0.72)]"
            panelClassName="max-w-[620px] overflow-hidden rounded-[8px] px-0 py-0 shadow-[0_18px_44px_rgba(15,23,42,0.28)]"
        >
            <div className="bg-[#173968] px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <PencilIcon className="h-5 w-5 text-white" />
                        <h2 className="text-[16px] font-medium">{modal.title}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-white transition hover:bg-white/10"
                        aria-label="Tutup rincian barang"
                    >
                        <CloseIcon className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="bg-white px-4 pb-4 pt-3">
                <div className="flex flex-wrap border-b border-[#d8dde7]">
                    {modal.tabs.map((tab) => (
                        <ModalTabButton
                            key={tab.id}
                            active={tab.id === activeTabIdSafe}
                            label={tab.label}
                            onClick={() => setActiveTabId(tab.id)}
                        />
                    ))}
                </div>

                <div className="min-h-[336px] py-3">
                    {activeTabIdSafe === 'serial' ? (
                        <ItemSerialTab detail={detail} />
                    ) : activeTabIdSafe === 'info' ? (
                        <ItemInfoTab detail={detail} />
                    ) : (
                        <ItemDetailTab detail={detail} />
                    )}
                </div>

                <ModalFooter deleteLabel={modal.deleteLabel} submitLabel={modal.submitLabel} />
            </div>
        </ModalBase>
    );
}
