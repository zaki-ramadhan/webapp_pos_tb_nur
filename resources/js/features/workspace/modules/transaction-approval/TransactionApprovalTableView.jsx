import { useMemo, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
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
import { PlusIcon, RefreshIcon, CogIcon } from '@/features/workspace/shared/Icons';
import Pagination from '@/components/ui/Pagination';

function ApprovalFilterSlot({ filters: filterDefs, values, onChange }) {
    return (
        <>
            {filterDefs.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={values[filter.id]}
                    onChange={(event) => onChange(filter.id, event.target.value)}
                    containerClassName="w-auto shrink-0"
                    className="h-[40px] min-w-[228px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-xs sm:text-sm text-[#394157]"
                >
                    {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </SelectField>
            ))}
        </>
    );
}

export default function TransactionApprovalTableView({ table, onCreate, onRefresh, onOpenDetail }) {
    const [filterValues, setFilterValues] = useState(() =>
        table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? '';
            return result;
        }, {}),
    );

    function handleFilterChange(filterId, value) {
        setFilterValues((current) => ({ ...current, [filterId]: value }));
    }

    const filteredRows = useMemo(() => {
        return table.rows.filter((row) =>
            table.filters.every((filter) => {
                const selected = filterValues[filter.id];
                return !selected || selected === 'all' || row[filter.rowKey] === selected;
            }),
        );
    }, [filterValues, table.filters, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={table.filters?.length ? <ApprovalFilterSlot filters={table.filters} values={filterValues} onChange={handleFilterChange} /> : null}
                size="compact"
                createButton={{ label: table.createLabel, onClick: onCreate, icon: <PlusIcon className="h-6 w-6" /> }}
                refreshButton={{ label: table.refreshLabel, onClick: onRefresh, icon: <RefreshIcon className="h-5 w-5" /> }}
                menuButton={{ label: table.actionsLabel, icon: <CogIcon className="h-5 w-5" />, buttonClassName: 'w-[70px]', items: table.menuItems }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {filteredRows.length > 0 && (
                                <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-normal text-white">
                                    No.
                                </DataTableHead>
                            )}
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-base font-normal text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    onClick={() => onOpenDetail?.({ recordId: row.id, label: row.ruleName, tabLabel: row.tabLabel })}
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'} cursor-pointer hover:bg-[#f3f6fa]`}
                                >
                                    <DataTableCell className="px-3 text-center text-base text-[#646d83] whitespace-nowrap">
                                        {table.pagination ? (table.pagination.from + index) : (index + 1)}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 text-base text-[#131a28]">{formatTableTextValue(row.transactionTypeLabel)}</DataTableCell>
                                    <DataTableCell className="px-3 text-base text-[#131a28]">{formatTableTextValue(row.valueLabel)}</DataTableCell>
                                    <DataTableCell className="px-3 text-base text-[#131a28]">{formatTableTextValue(row.approvedBy)}</DataTableCell>
                                    <DataTableCell className="px-3 text-base text-[#131a28]">{formatTableTextValue(row.createdBy)}</DataTableCell>
                                    <DataTableCell className="px-3 text-base text-[#131a28]">{formatTableTextValue(row.branchLabel)}</DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-[#dde1e8] bg-white">
                                <DataTableCell colSpan={table.columns.length + (filteredRows.length > 0 ? 1 : 0)} className="px-3 py-8 text-center text-base text-[#131a28]">
                                    {table.emptyLabel}
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
