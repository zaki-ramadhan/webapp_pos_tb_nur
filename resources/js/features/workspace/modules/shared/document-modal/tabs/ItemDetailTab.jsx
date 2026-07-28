import TextInput from '@/components/ui/TextInput';
import CheckboxField from '@/components/ui/CheckboxField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { TableActionIcon } from '@/features/workspace/shared/Icons';
import { DocumentModalCurrencyReadonlyField } from '../DocumentModalFields';

export default function ItemDetailTab({ detail }) {
    return (
        <div className="grid gap-y-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-x-4">
            <TransactionFieldLabel label="Kode #" />
            <div className="flex h-[36px] items-center text-xs sm:text-sm font-medium text-document-code">{detail.code ?? ''}</div>

            <TransactionFieldLabel label="Nama Barang" required />
            <TextInput
                value={detail.name ?? ''}
                readOnly
                trailing={<span className="text-2xl font-semibold text-brand-dark">×</span>}
                className="h-[36px] rounded-[4px] border-ui-border"
                inputClassName="text-xs sm:text-sm text-brand-dark"
                trailingClassName="px-3"
            />

            <TransactionFieldLabel label="Kuantitas" required />
            <div className="grid grid-cols-[minmax(0,1fr)_128px] gap-3">
                <TextInput
                    value={detail.quantity ?? ''}
                    readOnly
                    trailing={<TableActionIcon className="h-4 w-4 text-text-darkest" />}
                    className="h-[36px] rounded-[4px] border-ui-border"
                    inputClassName="text-right text-xs sm:text-sm text-brand-dark"
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
                    className="h-[34px] rounded-[4px] border-ui-border"
                    prefixClassName="min-w-[42px] justify-center bg-input-prefix-bg-compact px-0 text-text-inactive"
                    inputClassName="text-right text-xs sm:text-sm text-brand-dark"
                />
                <DocumentModalCurrencyReadonlyField value={detail.discountValue} />
            </div>

            <TransactionFieldLabel label="Total Harga" />
            <TextInput
                value={detail.total ?? ''}
                readOnly
                className="h-[34px] rounded-[4px] border-ui-border bg-bg-workspace-input-panel"
                inputClassName="text-right text-xs sm:text-sm font-normal text-text-darkest"
            />

            <TransactionFieldLabel label="Pajak" />
            <CheckboxField
                id="taxChecked"
                label={detail.taxLabel ?? 'PPN 10 %'}
                checked={detail.taxChecked ?? false}
                disabled
                align="center"
                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                containerClassName="w-auto inline-flex h-[34px]"
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
