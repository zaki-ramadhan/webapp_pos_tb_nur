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
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';

export default function GroupAccessTableView({ table, onCreate, onOpenDetail, loading = false, error = '', onRefresh = null }) {
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return table.rows;
        }

        return table.rows.filter((row) =>
            [row.groupName, row.userList].some((value) =>
                String(value).toLowerCase().includes(normalizedKeyword),
            ),
        );
    }, [keyword, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{ label: table.createLabel, onClick: onCreate }}
                refreshButton={{
                    label: loading ? 'Memuat data...' : table.refreshLabel,
                    onClick: onRefresh,
                    loading,
                    icon: <RefreshIcon className="h-4.5 w-4.5" />,
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[320px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3">
                <DataTable>
                    <DataTableHeader>
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={column.id === 'groupName' ? 'w-[20%] text-left' : 'text-left'}
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
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.tabLabel ?? row.groupName,
                                            tabLabel: row.tabLabel ?? row.groupName,
                                        })
                                    }
                                    className={`cursor-pointer transition hover:bg-[#eef3fb] ${
                                        index % 2 === 1 ? 'bg-[#f6f7f9]' : 'bg-white'
                                    }`.trim()}
                                >
                                    <DataTableCell className="text-left text-[15px] font-normal text-[#131a28]">
                                        {formatTableTextValue(row.groupName)}
                                    </DataTableCell>
                                    <DataTableCell className="text-left text-[15px] font-normal text-[#131a28]">
                                        {formatTableTextValue(row.userList)}
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={table.columns.length} className="px-3 py-8 text-center text-[15px] text-[#131a28]">
                                    {loading ? 'Memuat data...' : (error || table.emptyLabel || 'Belum ada data')}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
