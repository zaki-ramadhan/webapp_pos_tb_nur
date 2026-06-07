import { useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    CogIcon,
    FunnelIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';

export default function WarehouseTableView({ config, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');
    const [inactiveFilter, setInactiveFilter] = useState(config.table.filters?.[0]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            if (inactiveFilter !== 'all' && row.inactiveValue !== inactiveFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.name, row.address].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.rows, inactiveFilter, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={
                    <>
                        {(config.table.filters ?? []).map((filter) => (
                            <SelectField
                                key={filter.id}
                                value={inactiveFilter}
                                onChange={(event) => setInactiveFilter(event.target.value)}
                                containerClassName="w-auto shrink-0"
                                className="h-[40px] min-w-[128px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#394157]"
                            >
                                {filter.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectField>
                        ))}
                        <button
                            type="button"
                            aria-label={config.table.filterButtonLabel}
                            className="inline-flex h-[40px] w-[50px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcecff] text-[#2353a0]"
                        >
                            <FunnelIcon className="h-4.5 w-4.5" />
                        </button>
                    </>
                }
                topRowClassName="mb-4"
                size="compact"
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                printButton={{
                    label: config.table.printLabel,
                }}
                exportConfig={{
                    columns: config.table.columns,
                    rows: filteredRows,
                    filename: 'gudang-master',
                }}
                menuButton={{
                    label: config.table.settingsLabel,
                    icon: <CogIcon className="h-4.5 w-4.5" />,
                    items: config.table.menuItems,
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
                    columns={config.table.columns}
                    rows={filteredRows}
                    emptyLabel={config.table.emptyLabel ?? 'Belum ada data'}
                    minWidthClassName="min-w-[940px]"
                    onRowClick={(row) =>
                        onOpenDetail({
                            recordId: row.id,
                            label: row.tabLabel ?? row.name,
                            tabLabel: row.tabLabel ?? row.name,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                />
            </div>
        </div>
    );
}
