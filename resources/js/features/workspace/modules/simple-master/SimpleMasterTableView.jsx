import { useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import { LinkIcon, PlusIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { renderSimpleMasterCellValue } from './simpleMasterShared.jsx';

function ToolbarLeftButton({ button }) {
    return (
        <button
            type="button"
            aria-label={button.label}
            title={button.label}
            className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
        >
            <LinkIcon className="h-4.5 w-4.5" />
        </button>
    );
}

export default function SimpleMasterTableView({ table, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return (table.rows ?? []).filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            return table.columns.some((column) => {
                if (column.kind === 'spacer') {
                    return false;
                }

                return String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword);
            });
        });
    }, [keyword, table.columns, table.rows]);
    const isRowInteractive = Boolean(onOpenDetail);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                leftControls={
                    table.leftButtons?.length
                        ? table.leftButtons.map((button) => <ToolbarLeftButton key={button.id} button={button} />)
                        : null
                }
                refreshButton={{ label: table.refreshLabel, onClick: table.onRefresh, loading: table.loading }}
                printButton={table.printLabel ? { label: table.printLabel } : null}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[310px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
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
                                    className={`${isRowInteractive ? 'cursor-pointer transition hover:bg-[#eef3fb]' : ''} border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.name ?? row.label ?? row.id,
                                            tabLabel: row.tabLabel ?? row.name ?? row.label ?? row.id,
                                        })
                                    }
                                >
                                    {table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.cellClassName ?? ''} px-3 text-[15px] text-[#131a28]`.trim()}
                                        >
                                            {column.kind === 'spacer' ? null : (
                                                <span className={column.truncate === false ? '' : 'block truncate'}>
                                                    {renderSimpleMasterCellValue(column, row)}
                                                </span>
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={table.columns.length} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    {table.emptyLabel ?? 'Belum ada data'}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
