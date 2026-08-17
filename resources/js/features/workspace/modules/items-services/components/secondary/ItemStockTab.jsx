import { useState } from 'react';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PlusIcon } from '@/features/workspace/shared/Icons';
import {
    FormRow,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import useTableSort from '@/features/workspace/shared/useTableSort';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import OpeningStockModal from '../../OpeningStockModal';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';

export default function ItemStockTab({ config, values, onChange }) {
    const [modalOpen, setModalOpen] = useState(false);
    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(values.openingStockRows || []);

    function handleAddOpeningStock(data) {
        const newRow = {
            id: `opening-stock-${Date.now()}`,
            date: data.date,
            quantity: Number(data.quantity),
            unit: data.unit,
            unit_id: data.unit_id ?? null,
            unitCost: Number(data.unitCost),
            warehouse: data.warehouse,
            warehouse_id: data.warehouse_id ?? null,
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
                                            {formatTableTextValue(row[column.id], column)}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-ui-border-row bg-white">
                                <DataTableCell
                                    colSpan={config.openingStockTable.columns.length}
                                    className="px-3 py-2 text-center text-[15px] text-black"
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
