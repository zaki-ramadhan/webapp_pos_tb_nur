import { useMemo, useState } from 'react';

import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    DownloadIcon,
    FunnelIcon,
    LinkIcon,
    PlusIcon,
    PrintIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';
import {
    TransactionDataTable,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    SalesDepositFilterBar,
    SalesDepositTableCell,
    SalesDepositTableHeaderCell,
} from './SalesDepositSections';

export default function SalesDepositTableView({ config, onCreate, onOpenDetail }) {
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
                return !selectedValue || selectedValue === 'all' ? true : row[filter.rowKey] === selectedValue;
            });

            if (!matchesFilters) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.number, row.date, row.customer, row.notes, row.status, row.total].some((value) =>
                String(value ?? '').toLowerCase().includes(normalizedKeyword),
            );
        });
    }, [config.table.filters, config.table.rows, filters, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={<SalesDepositFilterBar config={config} filters={filters} setFilters={setFilters} />}
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <LinkIcon className="h-4.5 w-4.5" />,
                }}
                rightControls={
                    <>
                        <TransactionToolbarSplitButton label="Unduh" icon={<DownloadIcon className="h-4 w-4" />} items={config.table.downloadItems} />
                        <TransactionToolbarSplitButton label="Cetak" icon={<PrintIcon className="h-4 w-4" />} items={config.table.printItems} />
                        <TransactionToolbarSplitButton label="Pengaturan tabel" icon={<NavigationIcon type="settings" className="h-4 w-4" />} items={config.table.settingsItems} />
                    </>
                }
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={filteredRows}
                    emptyLabel="Belum ada data"
                    minWidthClassName="min-w-[1480px]"
                    onRowClick={(row) => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
                    getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) => <SalesDepositTableHeaderCell column={column} />}
                    renderCell={({ row, column }) => <SalesDepositTableCell row={row} column={column} />}
                />
            </div>
        </div>
    );
}
