import { useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import Pagination from '@/components/ui/Pagination';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    CogIcon,
    FunnelIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function BudgetTableView({ page, onCreate, onOpenDetail, onRefresh }) {
    const table = page.budgetPage.table;
    const [keyword, setKeyword] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState(table.filters[0]?.options?.[0]?.value ?? 'all');
    const [typeFilter, setTypeFilter] = useState(table.filters[1]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (departmentFilter !== 'all' && row.departmentValue !== departmentFilter) {
                return false;
            }

            if (typeFilter !== 'all' && row.typeValue !== typeFilter) {
                return false;
            }

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
    }, [departmentFilter, keyword, table.columns, table.rows, typeFilter]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={
                    <div className="flex flex-wrap items-center gap-2">
                        <SelectField
                            value={departmentFilter}
                            onChange={(event) => setDepartmentFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[34px] min-w-[144px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
                        >
                            {table.filters[0].options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            value={typeFilter}
                            onChange={(event) => setTypeFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[34px] min-w-[100px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
                        >
                            {table.filters[1].options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <button
                            type="button"
                            aria-label={table.filterButtonLabel}
                            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                        >
                            <FunnelIcon className="h-4.5 w-4.5" />
                        </button>
                    </div>
                }
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                    onClick: onRefresh,
                }}
                printButton={{
                    label: table.printLabel,
                    icon: <PrintIcon className="h-4 w-4" />,
                }}
                exportConfig={{
                    columns: table.columns,
                    rows: filteredRows,
                    filename: 'anggaran',
                }}
                menuButton={{
                    label: table.actionsLabel,
                    icon: <CogIcon className="h-4 w-4" />,
                    items: table.menuItems,
                    widthClassName: 'w-[190px]',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={table.columns}
                    rows={filteredRows}
                    emptyLabel={table.emptyLabel}
                    minWidthClassName="min-w-[1280px]"
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : ''}`.trim()}>
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                    renderCell={({ row, column }) => row[column.id]}
                    onRowClick={(row) =>
                        onOpenDetail?.({
                            recordId: row.id,
                            label: row.number,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                />
            </div>

            {page.budgetPage.table.pagination ? (
                <Pagination
                    page={page.budgetPage.table.pagination.page}
                    perPage={page.budgetPage.table.pagination.perPage}
                    total={page.budgetPage.table.pagination.total}
                    lastPage={page.budgetPage.table.pagination.lastPage}
                    from={page.budgetPage.table.pagination.from}
                    to={page.budgetPage.table.pagination.to}
                    onPageChange={page.budgetPage.table.pagination.onPageChange}
                    onPerPageChange={page.budgetPage.table.pagination.onPerPageChange}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}
