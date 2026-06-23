import TextInput from '@/components/ui/TextInput';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { CloseIcon, DownloadIcon, TableActionIcon } from '@/features/workspace/shared/Icons';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

import CheckboxField from '@/components/ui/CheckboxField';
import {
    DocumentModalCurrencyReadonlyField,
    ReadonlyDocumentTextarea,
} from './DocumentModalFields';

export function ItemDetailTab({ detail }) {
    return (
        <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
            <TransactionFieldLabel label="Kode #" />
            <div className="flex h-[36px] items-center text-xs sm:text-sm font-medium text-[#22a3f2]">{detail.code ?? ''}</div>

            <TransactionFieldLabel label="Nama Barang" required />
            <TextInput
                value={detail.name ?? ''}
                readOnly
                trailing={<span className="text-2xl font-semibold text-[#1f2436]">×</span>}
                className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                trailingClassName="px-3"
            />

            <TransactionFieldLabel label="Kuantitas" required />
            <div className="grid grid-cols-[minmax(0,1fr)_128px] gap-3">
                <TextInput
                    value={detail.quantity ?? ''}
                    readOnly
                    trailing={<TableActionIcon className="h-4 w-4 text-[#111827]" />}
                    className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
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
            <DocumentModalCurrencyReadonlyField
                value={detail.price}
                prefixAction={{ ariaLabel: 'Mode harga', content: <span className="text-lg font-semibold">@</span> }}
            />

            <TransactionFieldLabel label="Diskon" />
            <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-3">
                <TextInput
                    value={detail.discountPercent ?? ''}
                    readOnly
                    prefix="%"
                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                    prefixClassName="min-w-[42px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
                    inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
                />
                <DocumentModalCurrencyReadonlyField value={detail.discountValue} />
            </div>

            <TransactionFieldLabel label="Total Harga" />
            <TextInput
                value={detail.total ?? ''}
                readOnly
                className="h-[34px] rounded-[4px] border-[#cfd6e2] bg-[#f8f9fb]"
                inputClassName="text-right text-xs sm:text-sm font-normal text-[#111827]"
            />

            <TransactionFieldLabel label="Pajak" />
            <CheckboxField
                id="taxChecked"
                label={detail.taxLabel ?? 'PPN 10 %'}
                checked={detail.taxChecked ?? false}
                disabled
                inputClassName="h-[20px] w-[20px] rounded"
                containerClassName="w-auto inline-flex items-center h-[34px]"
            />

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
            <div className="px-4 py-2 text-xs sm:text-sm text-[#1f2436]">{value}</div>
        </div>
    );
}

export function ItemSerialTab({ detail }) {
    const serialNumbers = detail.serialNumbers ?? [];

    return (
        <div className="space-y-3">
            <div className="grid gap-y-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={detail.serialFieldLabel ?? 'Nomor #'} />
                <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-3">
                    <TextInput
                        value={detail.serialInput ?? ''}
                        readOnly
                        placeholder={detail.serialPlaceholder ?? 'Scan Barcode / Ketik lalu [Enter]'}
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
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
                    <div className="px-4 py-2 text-center text-base font-medium">
                        {detail.serialColumnLabel ?? 'Nomor #'}
                    </div>
                </div>
                <div className="max-h-[280px] overflow-y-auto bg-white">
                    {serialNumbers.length ? (
                        serialNumbers.map((serialNumber) => <SerialRow key={serialNumber} value={serialNumber} />)
                    ) : (
                        <div className="px-4 py-6 text-center text-base text-[#7d879a]">Belum ada data</div>
                    )}
                </div>
            </div>

            <div className="text-xs sm:text-sm text-[#1f2436]">
                {detail.serialCountLabel ?? `${serialNumbers.length} No Seri/Produksi`}
            </div>
        </div>
    );
}

export function ItemInfoTab({ detail }) {
    const hideDepartment = isWorkspacePageInactive('department');

    return (
        <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
            {!hideDepartment ? (
                <>
                    <TransactionFieldLabel label="Departemen" />
                    <ChipLookupField
                        values={detail.department ?? []}
                        placeholder="Cari/Pilih..."
                        onRemove={() => {}}
                        searchLabel="Cari departemen"
                        heightClassName="h-[36px]"
                    />
                </>
            ) : null}

            <TransactionFieldLabel label="Keterangan" />
            <ReadonlyDocumentTextarea value={detail.notes ?? ''} className="min-h-[92px]" />

            {detail.quoteNumber ? (
                <>
                    <TransactionFieldLabel label="No. Penawaran" />
                    <TextInput
                        value={detail.quoteNumber}
                        readOnly
                        className="h-[36px] rounded-[4px] border-[#8fdb5d] bg-[#f7fff2]"
                        inputClassName="text-xs sm:text-sm font-semibold text-[#67b52c]"
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
                        inputClassName="text-xs sm:text-sm font-semibold text-[#67b52c]"
                    />
                </>
            ) : null}
        </div>
    );
}
