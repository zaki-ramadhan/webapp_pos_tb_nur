import { useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import Pagination from '@/components/ui/Pagination';
import {
    TransactionDataTable,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    CogIcon,
    FunnelIcon,
    PlusIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

function TableUtilityButton({ label, children }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
        >
            {children}
        </button>
    );
}

export default function BudgetTransferTableView({ config, onCreate, onOpenDetail, onRefresh }) {
    const [keyword, setKeyword] = useState('');
    const [dateFilter, setDateFilter] = useState(config.table.filters[0]?.options?.[0]?.value ?? 'all');
    const tableColumns = useMemo(
        () =>
            config.table.columns.map((column) => ({
                ...column,
                align: column.align ?? 'center',
            })),
        [config.table.columns],
    );

    const filteredRows = useMemo(
        () =>
            config.table.rows.filter((row) => {
                if (dateFilter !== 'all' && row.dateFilterValue !== dateFilter) {
                    return false;
                }

                const normalizedKeyword = keyword.trim().toLowerCase();

                if (!normalizedKeyword) {
                    return true;
                }

                return tableColumns.some((column) =>
                    String(row[column.id] ?? '')
                        .toLowerCase()
                        .includes(normalizedKeyword),
                );
            }),
        [config.table.rows, dateFilter, keyword, tableColumns],
    );

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={
                    <div className="flex flex-wrap items-center gap-2">
                        <SelectField
                            value={dateFilter}
                            onChange={(event) => setDateFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[34px] min-w-[126px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
                            iconClassName="mr-2 text-[#6c7894]"
                        >
                            {config.table.filters[0].options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <button
                            type="button"
                            aria-label={config.table.filterButtonLabel}
                            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                        >
                            <FunnelIcon className="h-4.5 w-4.5" />
                        </button>
                    </div>
                }
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                    onClick: onRefresh,
                }}
                printButton={{
                    label: 'Cetak',
                }}
                exportConfig={{
                    columns: tableColumns,
                    rows: filteredRows,
                    filename: 'transfer-anggaran',
                }}
                menuButton={{
                    label: config.table.settingsLabel,
                    icon: <CogIcon className="h-4 w-4" />,
                    items: [{ id: 'settings', label: config.table.settingsLabel }],
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={tableColumns}
                    rows={filteredRows}
                    emptyLabel={config.table.emptyLabel}
                    minWidthClassName="min-w-[1180px]"
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-center'}`.trim()}>
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                    onRowClick={(row) =>
                        onOpenDetail?.({
                            recordId: row.id,
                            label: row.number,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                />
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
