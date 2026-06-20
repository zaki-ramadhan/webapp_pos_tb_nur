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
import { buildOrderFulfillmentConfig } from './inventoryFulfillmentConfig';
import { LinkIcon } from '@/features/workspace/shared/Icons';

function resolveHeaderAlignClassName(align) {
    return 'text-center';
}

function resolveCellAlignClassName(align) {
    return 'text-left';
}


export default function OrderFulfillmentView({ page }) {
    const config = useMemo(() => buildOrderFulfillmentConfig(page.orderFulfillment), [page.orderFulfillment]);
    const [branch, setBranch] = useState(config.branchOptions[0] ?? '');
    const [warehouse, setWarehouse] = useState(config.warehouseOptions[0] ?? '');

    const [pageNumber, setPageNumber] = useState(1);
    const [perPage, setPerPage] = useState(25);

    useEffect(() => {
        setPageNumber(1);
    }, [branch, warehouse]);

    const filteredRows = config.table.rows ?? [];
    const paginatedRows = useMemo(() => {
        const start = (pageNumber - 1) * perPage;
        return filteredRows.slice(start, start + perPage);
    }, [filteredRows, pageNumber, perPage]);

    const total = filteredRows.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const from = total > 0 ? (pageNumber - 1) * perPage + 1 : 0;
    const to = Math.min(total, pageNumber * perPage);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 border-b border-[#e0e5ee] pb-3 lg:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row xl:items-center">
                    <div className="w-full xl:max-w-[424px]">
                        <SelectField
                            value={branch}
                            onChange={(event) => setBranch(event.target.value)}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {config.branchOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="w-full xl:max-w-[424px]">
                        <SelectField
                            value={warehouse}
                            onChange={(event) => setWarehouse(event.target.value)}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {config.warehouseOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <button
                        type="button"
                        className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] bg-[#2353a0] text-white"
                        aria-label="Muat ulang"
                    >
                        <LinkIcon className="h-4.5 w-4.5" />
                    </button>

                    <button
                        type="button"
                        disabled
                        className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#d4d7de] bg-[#f0f0f1] px-4 text-base text-[#b1b5bf]"
                    >
                        {config.actionButtonLabel}
                    </button>

                </div>
            </div>

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className={config.table.tableClassName} wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            <DataTableHead className="w-[50px] px-2.5 text-center text-base font-medium text-white">
                                    No.
                                </DataTableHead>
                            {config.table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-base font-medium text-white ${resolveHeaderAlignClassName(column.align)}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {paginatedRows.length ? (
                            paginatedRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}`.trim()}
                                >
                                    {filteredRows.length > 0 ? (
                                        <DataTableCell className="px-2.5 text-center text-base text-[#646d83]">
                                            {from + index}
                                        </DataTableCell>
                                    ) : null}
                                    {config.table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-2.5 text-base text-[#131a28] ${resolveCellAlignClassName(column.align)}`.trim()}
                                        >
                                            {row[column.id] ?? ''}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={config.table.columns.length + 1} className="px-2.5 py-3 text-center text-base text-[#131a28]">
                                    {config.table.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>

            {total > 0 ? (
                <Pagination
                    page={pageNumber}
                    perPage={perPage}
                    total={total}
                    lastPage={lastPage}
                    from={from}
                    to={to}
                    onPageChange={setPageNumber}
                    onPerPageChange={(nextPerPage) => {
                        setPerPage(nextPerPage);
                        setPageNumber(1);
                    }}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}
