import { useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
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
                rightControls={
                    <>
                        <TransactionToolbarSplitButton label={config.table.downloadLabel} icon={<DownloadIcon className="h-4.5 w-4.5" />} items={config.table.downloadItems} />
                        <TransactionToolbarSplitButton label={config.table.shareLabel} icon={<ExternalLinkIcon className="h-4.5 w-4.5" />} items={config.table.shareItems} />
                        <TransactionToolbarIconButton label={config.table.printLabel}>
                            <PrintIcon className="h-4.5 w-4.5" />
                        </TransactionToolbarIconButton>
                    </>
                }
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <div className="min-w-[1060px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {config.table.columns.map((column) => (
                                    <DataTableHead key={column.id} className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${resolveRowAlignClassName(column.align)}`.trim()}>
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
                                    {config.table.columns.map((column) => (
                                        <DataTableCell key={column.id} className={`${column.cellClassName ?? ''} px-3 text-[15px] text-[#131a28]`.trim()}>
                                            {column.kind === 'spacer' ? null : <span className="block truncate">{formatTableTextValue(row[column.id])}</span>}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}
