import { useEffect, useMemo, useState } from 'react';
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
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    DownloadIcon,
    FunnelIcon,
    LinkIcon,
    PrintIcon,
    SortIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';
import {
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { resolveWorkOrderCellAlignClassName } from '@/features/workspace/modules/work-order/workOrderViewShared';

function TableFilterField({ filter, value, onChange }) {
    return (
        <SelectField
            value={value}
            onChange={(event) => onChange(filter.id, event.target.value)}
            className="h-[40px] min-w-[110px] rounded-[4px] border-[#cfd6e2]"
            selectClassName="text-xs sm:text-sm text-[#1f2436]"
            containerClassName="w-auto"
        >
            {(filter.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                    {filter.label}: {option.label}
                </option>
            ))}
        </SelectField>
    );
}

export default function WorkOrderTableView({ config, onCreate, onOpenDetail }) {
    const [filters, setFilters] = useState(() =>
        (config.table.filters ?? []).reduce(
            (result, filter) => ({
                ...result,
                [filter.id]: filter.value ?? 'all',
            }),
            {},
        ),
    );
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        setFilters(
            (config.table.filters ?? []).reduce(
                (result, filter) => ({
                    ...result,
                    [filter.id]: filter.value ?? 'all',
                }),
                {},
            ),
        );
        setSearchValue('');
    }, [config.table.filters]);

    const rows = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();

        return (config.table.rows ?? []).filter((row) => {
            if (filters.date !== 'all' && row.dateFilter !== filters.date) {
                return false;
            }

            if (filters.status !== 'all' && row.statusFilter !== filters.status) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [row.number, row.date, row.customer, row.notes, row.status]
                .join(' ')
                .toLowerCase()
                .includes(keyword);
        });
    }, [config.table.rows, filters, searchValue]);

    return (
        <div className="flex min-h-full flex-col gap-3 rounded-[6px] border border-[#cfd6e2] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:px-4">
            <TableToolbar
                filters={
                    <>
                        {(config.table.filters ?? []).map((filter) => (
                            <TableFilterField
                                key={filter.id}
                                filter={filter}
                                value={filters[filter.id] ?? filter.value ?? 'all'}
                                onChange={(filterId, nextValue) =>
                                    setFilters((current) => ({
                                        ...current,
                                        [filterId]: nextValue,
                                    }))
                                }
                            />
                        ))}
                        <TransactionToolbarSplitButton
                            label="Filter lanjutan"
                            icon={<FunnelIcon className="h-4.5 w-4.5" />}
                            items={[{ id: 'reset-filter', label: 'Reset filter' }]}
                        />
                    </>
                }
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    onClick: () => setSearchValue(''),
                    icon: <LinkIcon className="h-4.5 w-4.5" />,
                }}
                rightControls={
                    <>
                        <TransactionToolbarSplitButton
                            label="Unduh"
                            icon={<DownloadIcon className="h-4.5 w-4.5" />}
                            items={config.table.downloadItems}
                        />
                        <TransactionToolbarIconButton label="Cetak daftar">
                            <PrintIcon className="h-4.5 w-4.5" />
                        </TransactionToolbarIconButton>
                        <TransactionToolbarSplitButton
                            label="Pengaturan tabel"
                            icon={<TableActionIcon className="h-4.5 w-4.5" />}
                            items={config.table.settingsItems}
                        />
                    </>
                }
                search={{
                    value: searchValue,
                    onChange: (event) => setSearchValue(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                }}
                />

            <div className="min-h-0 flex-1 overflow-x-auto">
                <div className="min-w-[1320px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                            <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-normal text-white">
                                No.
                            </DataTableHead>
                                {config.table.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-base font-normal text-white ${column.align === 'right' ? 'text-right' : (column.align === 'center' ? 'text-center' : 'text-left')}`.trim()}
                                    >
                                        <span
                                            className={`flex items-center gap-2 justify-center`.trim()}
                                        >
                                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                            <span>{column.label}</span>
                                        </span>
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {rows.length ? (
                                rows.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`cursor-pointer border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'} hover:bg-[#eef3fb]`.trim()}
                                        onClick={() =>
                                            onOpenDetail({
                                                recordId: row.id,
                                                label: row.number,
                                                tabLabel: row.number,
                                            })
                                        }
                                    >
                                                                            {rows.length > 0 ? (
                                        <DataTableCell className="px-3 text-center text-base text-[#646d83]">
                                        {index + 1}
                                    </DataTableCell>
                                    ) : null}
{config.table.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`px-3 text-base text-[#131a28] ${resolveWorkOrderCellAlignClassName(column.align)}`.trim()}
                                            >
                                                {formatTableTextValue(row[column.id])}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="border-[#dde1e8] bg-white">
                                    <DataTableCell
                                        colSpan={config.table.columns.length + 1}
                                        className="px-3 py-3 text-center text-base text-[#131a28]"
                                    >
                                        Belum ada data
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
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
