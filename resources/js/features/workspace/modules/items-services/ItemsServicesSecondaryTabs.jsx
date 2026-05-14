import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TextareaField from '@/components/ui/TextareaField';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PlusIcon } from '@/features/workspace/shared/Icons';
import {
    FormRow,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';

export function ItemStockTab({ config, values }) {
    return (
        <div className="space-y-9">
            <section className="space-y-3">
                <div className="flex items-center gap-4">
                    <h3 className="text-[22px] font-normal text-[#1f2436]">
                        {config.labels.openingStock}
                    </h3>
                    <button
                        type="button"
                        className="inline-flex h-[34px] w-[56px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                    >
                        <PlusIcon className="h-7 w-7" />
                    </button>
                </div>

                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.openingStockTable.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white text-center`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>
                    <DataTableBody>
                        {values.openingStockRows.length ? (
                            values.openingStockRows.map((row) => (
                                <DataTableRow key={row.id} className="border-[#dde1e8] bg-white">
                                    {config.openingStockTable.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className="px-3 text-center text-[15px] text-[#131a28]"
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-[#dde1e8] bg-white">
                                <DataTableCell
                                    colSpan={config.openingStockTable.columns.length}
                                    className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                                >
                                    {config.openingStockTable.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </section>

            <section className="space-y-4">
                <SectionHeading title={values.stockWarehouseLabel} />

                <div className="grid gap-3 sm:grid-cols-[260px_420px] sm:items-center">
                    <label className="text-[17px] text-[#1f2436]">Kuantitas</label>
                    <SimpleTextField
                        value={values.stockQuantity}
                        onChange={() => {}}
                        inputClassName="text-right"
                    />

                    <label className="text-[17px] text-[#1f2436]">Nilai Satuan</label>
                    <SimpleTextField
                        value={values.stockUnitValue}
                        onChange={() => {}}
                        inputClassName="text-right"
                    />

                    <label className="text-[17px] text-[#1f2436]">Beban Pokok</label>
                    <SimpleTextField
                        value={values.stockCostOfGoods}
                        onChange={() => {}}
                        inputClassName="text-right"
                    />
                </div>
            </section>
        </div>
    );
}

export function ItemAccountsTab({ config, values, onChange }) {
    const accountRows = [
        ['inventory', 'Persediaan'],
        ['sales', 'Penjualan'],
        ['salesReturn', 'Retur Penjualan'],
        ['salesDiscount', 'Diskon Penjualan'],
        ['deliveredGoods', 'Barang Terkirim'],
        ['costOfGoodsSold', 'Beban Pokok Penjualan'],
        ['purchaseReturn', 'Retur Pembelian'],
        ['uninvoicedPurchase', 'Pembelian Belum Tertagih'],
    ];

    return (
        <div className="max-w-[1180px] space-y-4">
            <SectionHeading title={config.labels.accounts} />

            <div className="space-y-3 pt-2">
                {accountRows.map(([key, label]) => (
                    <FormRow key={key} label={label}>
                        <AccountLookupField
                            values={values.accounts[key] ?? []}
                            placeholder="Cari/Pilih..."
                            searchLabel={`Cari akun ${label}`}
                            dialogTitle={`Pilih akun ${label}`}
                            onRemove={(item) =>
                                onChange('accounts', {
                                    ...values.accounts,
                                    [key]: (values.accounts[key] ?? []).filter(
                                        (value) => value !== item,
                                    ),
                                })
                            }
                            onSelectAccount={(_, accountLabel) =>
                                onChange('accounts', {
                                    ...values.accounts,
                                    [key]: accountLabel ? [accountLabel] : [],
                                })
                            }
                            className="max-w-[680px]"
                        />
                    </FormRow>
                ))}
            </div>

            <div className="flex items-start gap-3 pt-1">
                <span className="mt-0.5 h-6 w-[4px] shrink-0 rounded-full bg-[#b9bdc5]" />
                <p className="text-[14px] italic leading-6 text-[#ef513f]">
                    {config.accountNote}
                </p>
            </div>
        </div>
    );
}

export function ItemImagesTab() {
    return (
        <div className="min-h-[620px]">
            <button
                type="button"
                className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] bg-[#2353a0] text-white"
                aria-label="Tambah gambar"
            >
                <PlusIcon className="h-7 w-7" />
            </button>
        </div>
    );
}

export function ItemOtherTab({ config, values, onChange }) {
    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <SectionHeading title={config.labels.otherInfo} />

                <FormRow label="Dipakai di Cabang">
                    <SelectField
                        value={values.branchesUsage}
                        onChange={(event) => onChange('branchesUsage', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] max-w-[420px]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {config.branchOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </FormRow>

                <FormRow label="Catatan">
                    <TextareaField
                        value={values.notes}
                        onChange={(event) => onChange('notes', event.target.value)}
                        rows={4}
                        className="max-w-[576px] rounded-[4px] border-[#cfd6e2]"
                        textareaClassName="min-h-[70px] text-[15px] text-[#1f2436]"
                    />
                </FormRow>
            </section>

            <section className="space-y-4">
                <SectionHeading title={config.labels.dimensionInfo} />

                <div className="grid gap-3 sm:grid-cols-[260px_280px] sm:items-center">
                    <label className="text-[17px] text-[#1f2436]">Panjang (cm)</label>
                    <SimpleTextField
                        value={values.length}
                        onChange={(event) => onChange('length', event.target.value)}
                    />

                    <label className="text-[17px] text-[#1f2436]">Lebar (cm)</label>
                    <SimpleTextField
                        value={values.width}
                        onChange={(event) => onChange('width', event.target.value)}
                    />

                    <label className="text-[17px] text-[#1f2436]">Tinggi (cm)</label>
                    <SimpleTextField
                        value={values.height}
                        onChange={(event) => onChange('height', event.target.value)}
                    />

                    <label className="text-[17px] text-[#1f2436]">Berat (gr)</label>
                    <SimpleTextField
                        value={values.weight}
                        onChange={(event) => onChange('weight', event.target.value)}
                    />
                </div>
            </section>
        </div>
    );
}
