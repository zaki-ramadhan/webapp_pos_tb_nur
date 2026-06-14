import { useMemo, useState } from 'react';
import Pagination from '@/components/ui/Pagination';


import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PlusIcon, RefreshIcon, SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import { useColumnVisibility, getTableSchemaKey } from '@/features/workspace/shared/columnVisibility';

export default function CurrencyTableView({ page, rows, total, loading, error, onCreate, onOpenDetail, onRefresh }) {
    const table = page.currency.table;
    const [keyword, setKeyword] = useState('');
    const [syncing, setSyncing] = useState(false);

    const schemaKey = getTableSchemaKey(table.columns);
    const [visibleColumnIds, setVisibleColumnIds] = useColumnVisibility(schemaKey, table.columns);

    const visibleColumns = useMemo(() => {
        return table.columns.filter((column) => visibleColumnIds.includes(column.id));
    }, [table.columns, visibleColumnIds]);

    async function handleSync() {
        if (syncing) {
            return;
        }

        setSyncing(true);
        try {
            const response = await window.axios.post('/api/backend/currencies/sync');
            const message = response?.data?.message || 'Berhasil mensinkronisasi kurs mata uang.';
            showSuccessToast({ message });
            await onRefresh?.();
        } catch (syncError) {
            const errorMsg = syncError?.response?.data?.message || 'Gagal mensinkronisasi kurs mata uang.';
            showErrorToast({ message: errorMsg });
        } finally {
            setSyncing(false);
        }
    }

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return rows.filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            const searchCols = table.columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
            return searchCols.slice(0, 2).some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: syncing || loading ? 'Sinkronisasi Kurs...' : 'Sinkronisasi Kurs API',
                    onClick: handleSync,
                    loading: syncing || loading,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                resourceName="currencies"
                onRefresh={onRefresh}
                exportConfig={{
                    columns: table.columns,
                    rows: filteredRows,
                    filename: 'mata-uang',
                    title: 'Laporan Kurs Mata Uang',
                }}
                columnSettings={{
                    columns: table.columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label),
                    visibleIds: visibleColumnIds,
                    onToggle: (columnId) => {
                        setVisibleColumnIds(prev =>
                            prev.includes(columnId)
                                ? prev.filter(id => id !== columnId)
                                : [...prev, columnId]
                        );
                    }
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {filteredRows.length > 0 ? (
                            <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-medium text-white">
                                No.
                            </DataTableHead>
                        ) : null}
                            {visibleColumns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${column.align === 'right' ? 'text-right' : 'text-left'}`.trim()}
                                >
                                    <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : ''}`.trim()}>
                                        <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                        <span>{column.label}</span>
                                    </span>
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.countryName,
                                            tabLabel: row.tabLabel ?? row.countryName,
                                        })
                                    }
                                >
                                                                        {filteredRows.length > 0 ? (
                                        <DataTableCell className="px-3 text-center text-base text-[#646d83]">
                                        {index + 1}
                                    </DataTableCell>
                                    ) : null}
                                    {visibleColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-3 text-base text-[#131a28]`.trim()}
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={filteredRows.length > 0 ? visibleColumns.length + 1 : visibleColumns.length} className="px-3 py-3 text-center text-base text-[#131a28]">
                                    {error || (keyword.trim() ? 'Tidak ada hasil pencarian yang cocok' : 'Belum ada data')}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>

            {table.pagination ? (
                <Pagination
                    page={table.pagination.page}
                    perPage={table.pagination.perPage}
                    total={table.pagination.total}
                    lastPage={table.pagination.lastPage}
                    from={table.pagination.from}
                    to={table.pagination.to}
                    onPageChange={table.pagination.onPageChange}
                    onPerPageChange={table.pagination.onPerPageChange}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}
