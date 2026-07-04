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
import SelectField from '@/components/ui/SelectField';
import {
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    DownloadIcon,
    RefreshIcon,
    PlusIcon,
    PrintIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import useTableSort from '@/features/workspace/shared/useTableSort';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';

function DepositTableFilterBar({ table, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) =>
                        setFilters((current) => ({
                            ...current,
                            [filter.id]: event.target.value,
                        }))
                    }
                    containerClassName="w-auto"
                    className="h-[34px] rounded-[4px] border-ui-border"
                    selectClassName="px-3 text-xs sm:text-sm text-filter-select-text"
                    iconClassName="mr-2 text-filter-icon"
                >
                    {filter.options.map((option, optionIndex) => (
                        <option key={`${filter.id}-${option.label}-${optionIndex}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}



            {config.table.pagination ? (
                <Pagination
                    page={config.table.pagination.page}
                    perPage={config.table.pagination.perPage}
                    total={config.table.pagination.total}
                    lastPage={config.table.pagination.lastPage}
                    from={config.table.pagination.from}
                    to={config.table.pagination.to}
                    onPageChange={config.table.pagination.onPageChange}
                    onPerPageChange={config.table.pagination.onPerPageChange}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}

export default function DepositTableView({
    config,
    onCreate,
    onOpenDetail,
    rowSearchFields = [],
}) {
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        config.table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const resolvedSearchFields = rowSearchFields.length
        ? rowSearchFields
        : config.table.columns.map((column) => column.id);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            const matchesFilters = config.table.filters.every((filter) => {
                const selectedValue = filters[filter.id];
                return !selectedValue || selectedValue === 'all' ? true : row[filter.rowKey] === selectedValue;
            });

            if (!matchesFilters) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return resolvedSearchFields.some((field) =>
                String(row[field] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.filters, config.table.rows, filters, keyword, resolvedSearchFields]);

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);
    const { handleResizeStart, getCellStyle } = useColumnResize('deposit-workspace');

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={config.table.filters?.length ? <DepositTableFilterBar table={config.table} filters={filters} setFilters={setFilters} /> : null}
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <RefreshIcon className="h-4.5 w-4.5" />,
                }}
                rightControls={
                    <>
                        <TransactionToolbarSplitButton
                            label="Unduh"
                            icon={<DownloadIcon className="h-4 w-4" />}
                            items={config.table.downloadItems}
                        />
                        <TransactionToolbarSplitButton
                            label="Cetak"
                            icon={<PrintIcon className="h-4 w-4" />}
                            items={config.table.printItems}
                        />
                        <TransactionToolbarSplitButton
                            label="Pengaturan tabel"
                            icon={<NavigationIcon type="settings" className="h-4 w-4" />}
                            items={config.table.settingsItems}
                        />
                    </>
                }
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
                />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className={config.table.minWidthClassName ?? 'min-w-[1480px]'} wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {sortedRows.length > 0 && (
                                <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-normal text-white">
                                    No.
                                </DataTableHead>
                            )}
                            {config.table.columns.map((column) => (
                                <SortableTableHeaderCell
                                    key={column.id}
                                    label={column.label}
                                    align={column.align}
                                    widthClassName={column.widthClassName}
                                    sortable={column.sortable !== false}
                                    sortDirection={sortKey === column.id ? sortDir : null}
                                    onSort={() => handleSort(column.id)}
                                    style={getCellStyle(column.id, { position: 'relative' })}
                                    onResizeStart={(e) => handleResizeStart(e, column.id)}
                                />
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {sortedRows.length ? (
                            sortedRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-ui-border-row transition hover:bg-workspace-hover-bg ${
                                        index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'
                                    }`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row[config.table.detailLabelKey ?? 'number'],
                                            tabLabel: row[config.table.detailTabLabelKey ?? 'number'],
                                        })
                                    }
                                >
                                    {sortedRows.length > 0 ? (
                                        <DataTableCell className="px-3 text-center text-base text-table-row-number">
                                        {index + 1}
                                    </DataTableCell>
                                    ) : null}
{config.table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'} px-2.5 text-base text-text-workspace-dark`.trim()}
                                            style={getCellStyle(column.id)}
                                            onResizeStart={(e) => handleResizeStart(e, column.id)}
                                        >
                                            {column.render ? (
                                                column.render({
                                                    row,
                                                    value: row[column.id],
                                                    column,
                                                })
                                            ) : (
                                                <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-ui-border-row bg-white">
                                <DataTableCell colSpan={config.table.columns.length + 1} className="px-2.5 py-6 text-center text-base text-text-placeholder">
                                    {config.table.emptyLabel ?? 'Belum ada data'}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>

            {config.table.pagination ? (
                <Pagination
                    page={config.table.pagination.page}
                    perPage={config.table.pagination.perPage}
                    total={config.table.pagination.total}
                    lastPage={config.table.pagination.lastPage}
                    from={config.table.pagination.from}
                    to={config.table.pagination.to}
                    onPageChange={config.table.pagination.onPageChange}
                    onPerPageChange={config.table.pagination.onPerPageChange}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}
