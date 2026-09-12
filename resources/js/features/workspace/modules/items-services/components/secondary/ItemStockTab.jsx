import { useState, useMemo } from 'react';
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
import { showCrudValidationToast } from '@/features/workspace/shared/crudFeedback';
import { formatAmountInput, parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import OpeningStockModal from '../../OpeningStockModal';

function getMultiUnitBreakdown(qtyVal, baseUnitName, conversions) {
    const validConversions = (conversions || [])
        .map((conv) => {
            const name = conv.unitName ?? conv.unit?.[0]?.name ?? conv.name ?? (typeof conv.unit === 'string' ? conv.unit : '');
            const ratio = Number(conv.quantity || 0);
            return { name, ratio };
        })
        .filter((c) => c.name && c.ratio > 0)
        .sort((a, b) => b.ratio - a.ratio);

    const qty = typeof qtyVal === 'number' ? qtyVal : (parseAmountInput(qtyVal) || 0);

    if (validConversions.length === 0) {
        return baseUnitName ? `[ ${formatAmountInput(qty)} ${baseUnitName} ]` : '';
    }

    if (qty <= 0) {
        return `[ 0 ${baseUnitName} ]`;
    }

    let remaining = qty;
    const parts = [];

    for (const conv of validConversions) {
        if (remaining >= conv.ratio) {
            const count = Math.floor(remaining / conv.ratio);
            if (count > 0) {
                parts.push(`${formatAmountInput(count, { allowDecimal: false })} ${conv.name}`);
                remaining = Math.round((remaining - count * conv.ratio) * 10000) / 10000;
            }
        }
    }

    if (remaining > 0.0001 || parts.length === 0) {
        parts.push(`${formatAmountInput(remaining)} ${baseUnitName}`);
    }

    return `[ ${parts.join(' ')} ]`;
}

export default function ItemStockTab({ config, values, onChange }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;
    const openingStockList = values.openingStockRows || [];
    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(openingStockList);

    const totalRows = sortedRows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
    const paginatedRows = sortedRows.slice((currentPage - 1) * perPage, currentPage * perPage);

    const totalOpeningStock = useMemo(() => {
        return openingStockList.reduce(
            (sum, row) => sum + (parseAmountInput(row.quantity) || 0),
            0
        );
    }, [openingStockList]);

    const baseUnit = values.primaryUnit?.[0] ?? null;
    const baseUnitName = baseUnit?.name ?? (typeof baseUnit === 'string' ? baseUnit : (values.unitName ?? values.unit ?? ''));
    const conversions = Array.isArray(values.unitConversions) ? values.unitConversions : [];

    const hasMultiUnits = useMemo(() => {
        return conversions.some((conv) => {
            const name = conv.unitName ?? conv.unit?.[0]?.name ?? conv.name ?? (typeof conv.unit === 'string' ? conv.unit : '');
            const ratio = Number(conv.quantity || 0);
            return Boolean(name && ratio > 0);
        });
    }, [conversions]);

    const multiUnitBreakdown = useMemo(() => {
        return getMultiUnitBreakdown(values.stockQuantity, baseUnitName, conversions);
    }, [values.stockQuantity, baseUnitName, conversions]);

    function handleConfirmOpeningStock(data) {
        const currentRows = values.openingStockRows || [];
        if (editingRow) {
            const updatedRows = currentRows.map((r) => {
                if (r.id === editingRow.id) {
                    return {
                        ...r,
                        ...data,
                        id: r.id,
                        quantity: Number(data.quantity),
                        unitCost: Number(data.unitCost),
                    };
                }
                return r;
            });
            onChange?.('openingStockRows', updatedRows);
        } else {
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
                __fromDb: false,
            };
            onChange?.('openingStockRows', [...currentRows, newRow]);
        }
        setEditingRow(null);
    }

    function handleDeleteOpeningStock(rowToDelete) {
        if (!rowToDelete) return;
        const currentRows = values.openingStockRows || [];
        const updatedRows = currentRows.filter((r) => r.id !== rowToDelete.id);
        onChange?.('openingStockRows', updatedRows);
        setEditingRow(null);
    }

    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <div className="flex items-center justify-between border-b border-abc-card-border pb-1.5">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-normal text-input-brand sm:text-lg xl:text-xl 2xl:text-2xl">
                            {config.labels.openingStock}
                        </h3>
                        <button
                            type="button"
                            onClick={async () => {
                                if (!values.name?.trim()) {
                                    await showCrudValidationToast('Nama Barang harus diisi.');
                                    return;
                                }
                                setEditingRow(null);
                                setModalOpen(true);
                            }}
                            className="inline-flex h-[34px] w-[56px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition cursor-pointer"
                        >
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="text-xs sm:text-sm text-brand-dark flex items-center gap-3">
                        <span className="font-normal text-brand-dark">Total Stok Awal</span>
                        <span className="font-normal text-brand-dark">{formatAmountInput(totalOpeningStock)}</span>
                    </div>
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
                        {paginatedRows.length ? (
                            paginatedRows.map((row) => {
                                return (
                                    <DataTableRow
                                        key={row.id}
                                        className="border-ui-border-row bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => {
                                            setEditingRow(row);
                                            setModalOpen(true);
                                        }}
                                    >
                                        {config.openingStockTable.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`px-3 text-[15px] text-text-workspace-dark ${
                                                    column.align === 'right'
                                                        ? 'text-right'
                                                        : column.align === 'center'
                                                        ? 'text-center'
                                                        : 'text-left'
                                                }`}
                                            >
                                                {column.id === 'unitCost'
                                                    ? formatAmountInput(row.unitCost)
                                                    : column.id === 'quantity'
                                                    ? formatAmountInput(row.quantity)
                                                    : formatTableTextValue(row[column.id], column)}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                );
                            })
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

                {totalRows > perPage && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-text-inactive">
                        <span>
                            Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalRows)} dari {totalRows} data
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="rounded border border-ui-border px-2 py-1 transition disabled:opacity-40 hover:bg-bg-workspace-light"
                            >
                                Sebelumnya
                            </button>
                            <span className="px-2 font-medium text-brand-dark">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="rounded border border-ui-border px-2 py-1 transition disabled:opacity-40 hover:bg-bg-workspace-light"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <section className="space-y-2">
                <div className="w-full">
                    <SectionHeading title={values.stockWarehouseLabel} />

                    <div className="mt-4 space-y-2">
                        <FormRow label="Kuantitas">
                            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                                <div className="w-48 shrink-0">
                                    <SimpleTextField
                                        value={values.stockQuantity}
                                        onChange={() => {}}
                                        inputClassName="text-right"
                                        formatAsAmount
                                        disabled
                                    />
                                </div>
                                <span className="text-xs sm:text-sm text-brand-dark select-none shrink-0 min-w-[32px]">
                                    {baseUnitName}
                                </span>
                                {hasMultiUnits && (
                                    <div className="w-full max-w-[280px] shrink-0">
                                        <SimpleTextField
                                            value={multiUnitBreakdown}
                                            onChange={() => {}}
                                            disabled
                                        />
                                    </div>
                                )}
                            </div>
                        </FormRow>

                        <FormRow label="Nilai Satuan">
                            <div className="w-48">
                                <SimpleTextField
                                    value={values.stockUnitValue}
                                    onChange={() => {}}
                                    inputClassName="text-right"
                                    formatAsAmount
                                    disabled
                                />
                            </div>
                        </FormRow>

                        <FormRow label="Beban Pokok">
                            <div className="w-48">
                                <SimpleTextField
                                    value={values.stockCostOfGoods}
                                    onChange={() => {}}
                                    inputClassName="text-right"
                                    formatAsAmount
                                    disabled
                                />
                            </div>
                        </FormRow>
                    </div>
                </div>
            </section>

            <OpeningStockModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingRow(null);
                }}
                onConfirm={handleConfirmOpeningStock}
                onDelete={handleDeleteOpeningStock}
                initialData={editingRow}
                initialUnit={values.primaryUnit}
                initialUnitCost={values.purchasePrice || values.default_purchase_price || (values.stockUnitValue !== '0' ? values.stockUnitValue : '')}
            />
        </div>
    );
}
