import { useMemo, useState } from 'react';

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
    CashReceiptSortHeader,
    cashReceiptToolbarConfig,
} from '@/features/workspace/modules/cash-receipt/cashReceiptViewShared';

export default function CashReceiptTableView({
    config,
    onCreate,
    onOpenDetail,
    loading = false,
    error = '',
    onRefresh = null,
}) {
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        config.table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            const matchesFilters = config.table.filters.every((filter) => {
                const selectedValue = filters[filter.id];

                if (!selectedValue || selectedValue === 'all') {
                    return true;
                }

                return row[filter.rowKey] === selectedValue;
            });

            if (!matchesFilters) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.number, row.date, row.cashBank, row.checkNumber, row.description, row.amount].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.filters, config.table.rows, filters, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                {...cashReceiptToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters, SelectField)}
                refreshButton={{
                    ...cashReceiptToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters, SelectField).refreshButton,
                    label: loading ? 'Memuat data...' : config.table.refreshLabel,
                    onClick: onRefresh,
                    loading,
                }}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1380px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${
                                        column.align === 'right' ? 'text-right' : 'text-left'
                                    }`.trim()}
                                >
                                    <CashReceiptSortHeader column={column} />
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? filteredRows.map((row, index) => (
                            <DataTableRow
                                key={row.id}
                                className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${
                                    index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'
                                }`.trim()}
                                onClick={() => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
                            >
                                {config.table.columns.map((column) => (
                                    <DataTableCell
                                        key={column.id}
                                        className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-2.5 text-[15px] text-[#131a28]`.trim()}
                                    >
                                        {formatTableTextValue(row[column.id])}
                                    </DataTableCell>
                                ))}
                            </DataTableRow>
                        )) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={config.table.columns.length} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    {loading ? 'Memuat data...' : (error || 'Belum ada data')}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
