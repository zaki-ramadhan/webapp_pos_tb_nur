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
import AttachmentUploadField from '@/features/workspace/shared/AttachmentUploadField';

import { useState } from 'react';
import useTableSort from '@/features/workspace/shared/useTableSort';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import OpeningStockModal from './OpeningStockModal';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';

export function ItemStockTab({ config, values, onChange }) {
    const [modalOpen, setModalOpen] = useState(false);
    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(values.openingStockRows || []);

    function handleAddOpeningStock(data) {
        const newRow = {
            id: `opening-stock-${Date.now()}`,
            date: data.date,
            quantity: Number(data.quantity),
            unit: data.unit,
            unitCost: Number(data.unitCost),
            warehouse: data.warehouse,
            serials: data.serials || [],
        };
        const currentRows = values.openingStockRows || [];
        onChange?.('openingStockRows', [...currentRows, newRow]);
    }

    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <div className="flex items-center gap-4 border-b border-abc-card-border pb-1.5">
                    <h3 className="text-lg font-normal text-input-brand sm:text-lg xl:text-xl 2xl:text-2xl">
                        {config.labels.openingStock}
                    </h3>
                    <button
                        type="button"
                        onClick={async () => {
                            if (!values.name?.trim()) {
                                await showSystemErrorModal({
                                    title: 'Terjadi Permasalahan pada Pemrosesan',
                                    description: 'Silakan perbaiki permasalahan berikut ini:',
                                    message: 'Nama Barang harus diisi.',
                                    confirmLabel: 'OK',
                                });
                                return;
                            }
                            setModalOpen(true);
                        }}
                        className="inline-flex h-[34px] w-[56px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>

                <DataTable wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {config.openingStockTable.columns.map((column) => (
                                <SortableTableHeaderCell
                                    key={column.id}
                                    label={column.label}
                                    align={column.align ?? 'center'}
                                    widthClassName={column.widthClassName}
                                    sortable={column.sortable !== false}
                                    sortDirection={sortKey === column.id ? sortDir : null}
                                    onSort={() => handleSort(column.id)}
                                />
                            ))}
                        </tr>
                    </DataTableHeader>
                    <DataTableBody>
                        {sortedRows.length ? (
                            sortedRows.map((row) => (
                                <DataTableRow key={row.id} className="border-ui-border-row bg-white">
                                    {config.openingStockTable.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className="px-3 text-center text-[15px] text-text-workspace-dark"
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-ui-border-row bg-white">
                                <DataTableCell
                                    colSpan={config.openingStockTable.columns.length}
                                    className="px-3 py-3 text-center text-[15px] text-text-workspace-dark"
                                >
                                    {config.openingStockTable.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </section>

            <section className="space-y-2">
                <div className="lg:max-w-[33.33%] w-full">
                    <SectionHeading title={values.stockWarehouseLabel} />

                    <div className="mt-4 space-y-2">
                        <FormRow label="Kuantitas">
                            <SimpleTextField
                                value={values.stockQuantity}
                                onChange={() => {}}
                                inputClassName="text-right"
                                formatAsAmount
                                disabled
                            />
                        </FormRow>

                        <FormRow label="Nilai Satuan">
                            <SimpleTextField
                                value={values.stockUnitValue}
                                onChange={() => {}}
                                inputClassName="text-right"
                                prefix="Rp"
                                formatAsAmount
                                disabled
                            />
                        </FormRow>

                        <FormRow label="Beban Pokok">
                            <SimpleTextField
                                value={values.stockCostOfGoods}
                                onChange={() => {}}
                                inputClassName="text-right"
                                prefix="Rp"
                                formatAsAmount
                                disabled
                            />
                        </FormRow>
                    </div>
                </div>
            </section>

            <OpeningStockModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleAddOpeningStock}
                initialUnit={values.primaryUnit}
            />
        </div>
    );
}

export function ItemAccountsTab({ config, values, onChange }) {
    const fields = [
        { key: 'inventory', idKey: 'inventoryAccountId', label: 'Persediaan' },
        { key: 'sales', idKey: 'salesAccountId', label: 'Penjualan' },
        { key: 'salesReturn', idKey: 'salesReturnAccountId', label: 'Retur Penjualan' },
        { key: 'salesDiscount', idKey: 'salesDiscountAccountId', label: 'Diskon Penjualan' },
        { key: 'deliveredGoods', idKey: 'deliveredGoodsAccountId', label: 'Barang Terkirim' },
        { key: 'costOfGoodsSold', idKey: 'costOfGoodsSoldAccountId', label: 'Beban Pokok Penjualan' },
        { key: 'purchaseReturn', idKey: 'purchaseReturnAccountId', label: 'Retur Pembelian' },
        { key: 'uninvoicedPurchase', idKey: 'uninvoicedPurchaseAccountId', label: 'Pembelian Belum Tertagih' },
    ];

    return (
        <div className="space-y-4">
            <div className="lg:max-w-[50%] w-full">
                <SectionHeading title={config.labels.accounts} />

                <div className="mt-4 space-y-2">
                    {fields.map(({ key, idKey, label }) => (
                        <FormRow key={key} label={label}>
                            <AccountLookupField
                                values={values.accounts[key] ?? []}
                                placeholder="Cari/Pilih..."
                                searchLabel={`Cari akun ${label}`}
                                dialogTitle={`Pilih akun ${label}`}
                                onRemove={(item) => {
                                    onChange(idKey, null);
                                    onChange('accounts', {
                                        ...values.accounts,
                                        [key]: (values.accounts[key] ?? []).filter(
                                            (value) => value !== item,
                                        ),
                                    });
                                }}
                                onSelectAccount={(record, accountLabel) => {
                                    onChange(idKey, record?.id ?? null);
                                    onChange('accounts', {
                                        ...values.accounts,
                                        [key]: accountLabel ? [accountLabel] : [],
                                    });
                                }}
                            />
                        </FormRow>
                    ))}
                </div>
            </div>

            <div className="flex items-start gap-3 pt-2 lg:max-w-[50%] w-full">
                <span className="mt-1 h-6 w-[3px] shrink-0 rounded-full bg-tab-active-border-t" />
                <p className="text-xs sm:text-sm italic leading-6 text-red-550">
                    {config.accountNote}
                </p>
            </div>
        </div>
    );
}

export function ItemImagesTab({ values, onChange }) {
    const currentCount = (values.attachments ?? []).length;
    const maxFiles = 5;

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-3">
                <SectionHeading title={`Gambar / Foto Produk (${currentCount}/${maxFiles})`} />
                <div className="mt-4">
                    <AttachmentUploadField
                        value={values.attachments ?? []}
                        onChange={(newList) => onChange('attachments', newList)}
                        accept="image/*"
                        multiple={true}
                        maxFiles={maxFiles}
                        label=""
                    />
                </div>
            </section>
            <div></div>
        </div>
    );
}

export function ItemOtherTab({ config, values, onChange }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-2">
                <SectionHeading title={config.labels.otherInfo} />

                <div className="mt-4 space-y-2">


                    <FormRow label="Catatan">
                        <TextareaField
                            value={values.notes}
                            onChange={(event) => onChange('notes', event.target.value)}
                            rows={4}
                            className="rounded-[4px] border-ui-border w-full"
                            textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                            maxLength={500}
                        />
                    </FormRow>
                </div>
            </section>

            <section className="space-y-2">
                <SectionHeading title={config.labels.dimensionInfo} />

                <div className="mt-4 space-y-2">
                    <FormRow label="Panjang (cm)">
                        <SimpleTextField
                            value={values.length}
                            onChange={(event) => onChange('length', event.target.value)}
                            formatAsAmount
                            maxLength={10}
                        />
                    </FormRow>

                    <FormRow label="Lebar (cm)">
                        <SimpleTextField
                            value={values.width}
                            onChange={(event) => onChange('width', event.target.value)}
                            formatAsAmount
                            maxLength={10}
                        />
                    </FormRow>

                    <FormRow label="Tinggi (cm)">
                        <SimpleTextField
                            value={values.height}
                            onChange={(event) => onChange('height', event.target.value)}
                            formatAsAmount
                            maxLength={10}
                        />
                    </FormRow>

                    <FormRow label="Berat (gr)">
                        <SimpleTextField
                            value={values.weight}
                            onChange={(event) => onChange('weight', event.target.value)}
                            formatAsAmount
                            allowDecimal={false}
                            maxLength={9}
                        />
                    </FormRow>
                </div>
            </section>
        </div>
    );
}
