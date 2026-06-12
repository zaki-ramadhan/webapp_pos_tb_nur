import { useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { TransactionToolbarIconButton, TransactionToolbarSplitButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { DownloadIcon, ExternalLinkIcon, PrintIcon, SortIcon } from '@/features/workspace/shared/Icons';
import { resolveRowAlignClassName } from './itemCategoryShared';

export default function ItemCategoryTableView({ page, onCreate, onOpenDetail }) {
    const config = page.itemCategory;
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            return [row.name, row.defaultLabel].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.rows, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                }}
                printButton={{
                    label: config.table.printLabel,
                }}
                exportConfig={{
                    columns: config.table.columns,
                    rows: filteredRows,
                    filename: 'kategori-barang',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                }}
                />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <div className="min-w-[1060px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                            <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-medium text-white">
                                No.
                            </DataTableHead>
                                {config.table.columns.map((column) => (
                                    <DataTableHead key={column.id} className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${resolveRowAlignClassName(column.align)}`.trim()}>
                                        {column.kind === 'spacer' ? (
                                            <span className="flex justify-center text-white/55">
                                                <SortIcon className="h-3 w-3" />
                                            </span>
                                        ) : (
                                            <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`.trim()}>
                                                {column.sortable ? <SortIcon className="h-3 w-3 shrink-0 text-white/55" /> : null}
                                                <span>{column.label}</span>
                                            </span>
                                        )}
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.name,
                                            tabLabel: row.tabLabel ?? row.name,
                                        })
                                    }
                                >
                                                                        <DataTableCell className="px-3 text-center text-base text-[#646d83]">
                                        {index + 1}
                                    </DataTableCell>
{config.table.columns.map((column) => (
                                        <DataTableCell key={column.id} className={`${column.cellClassName ?? ''} px-3 text-base text-[#131a28]`.trim()}>
                                            {column.kind === 'spacer' ? null : <span className="block truncate">{formatTableTextValue(row[column.id])}</span>}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))}
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
