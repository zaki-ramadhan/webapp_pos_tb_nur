import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import {
    TransactionDataTable,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    FunnelIcon,
    LinkIcon,
    PrintIcon,
    SortIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

function TableFilterField({ filter, value, onChange }) {
    return (
        <SelectField
            value={value}
            onChange={(event) => onChange(filter.id, event.target.value)}
            className="h-[40px] min-w-[110px] rounded-[4px] border-[#cfd6e2]"
            selectClassName="text-xs sm:text-sm text-[#1f2436]"
            containerClassName="w-auto"
        >
            {(filter.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                    {filter.label}: {option.label}
                </option>
            ))}
        </SelectField>
    );
}

export default function MaterialAdditionTableView({
    config,
    onCreate,
    onOpenDetail,
    loading = false,
    error = '',
    onRefresh = null,
}) {
    const [filters, setFilters] = useState(() =>
        (config.table.filters ?? []).reduce(
            (result, filter) => ({
                ...result,
                [filter.id]: filter.value ?? 'all',
            }),
            {},
        ),
    );
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        setFilters(
            (config.table.filters ?? []).reduce(
                (result, filter) => ({
                    ...result,
                    [filter.id]: filter.value ?? 'all',
                }),
                {},
            ),
        );
        setSearchValue('');
    }, [config.table.filters]);

    const rows = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();

        return (config.table.rows ?? []).filter((row) => {
            if (filters.date !== 'all' && row.dateFilter !== filters.date) {
                return false;
            }

            if (filters.type !== 'all' && row.typeFilter !== filters.type) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [row.number, row.date, row.type, row.workOrderNumber, row.notes]
                .join(' ')
                .toLowerCase()
                .includes(keyword);
        });
    }, [config.table.rows, filters, searchValue]);

    return (
        <div className="flex min-h-full flex-col gap-3 rounded-[6px] border border-[#cfd6e2] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:px-4">
            <TableToolbar
                filters={
                    <>
                        {(config.table.filters ?? []).map((filter) => (
                            <TableFilterField
                                key={filter.id}
                                filter={filter}
                                value={filters[filter.id] ?? filter.value ?? 'all'}
                                onChange={(filterId, nextValue) =>
                                    setFilters((current) => ({
                                        ...current,
                                        [filterId]: nextValue,
                                    }))
                                }
                            />
                        ))}
                        <TransactionToolbarSplitButton
                            label="Filter lanjutan"
                            icon={<FunnelIcon className="h-4.5 w-4.5" />}
                            items={[{ id: 'reset-filter', label: 'Reset filter' }]}
                        />
                    </>
                }
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{
                    label: loading ? 'Memuat data...' : config.table.refreshLabel,
                    onClick: onRefresh ?? (() => setSearchValue('')),
                    loading,
                    icon: <LinkIcon className="h-4.5 w-4.5" />,
                }}
                rightControls={
                    <>
                        <TransactionToolbarIconButton label="Cetak daftar">
                            <PrintIcon className="h-4.5 w-4.5" />
                        </TransactionToolbarIconButton>
                        <TransactionToolbarSplitButton
                            label="Pengaturan tabel"
                            icon={<TableActionIcon className="h-4.5 w-4.5" />}
                            items={config.table.settingsItems}
                        />
                    </>
                }
                search={{
                    value: searchValue,
                    onChange: (event) => setSearchValue(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                }}
                pageValue={config.table.pageValue}
            />

            <div className="min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={rows}
                    emptyLabel={loading ? 'Memuat data...' : (error || 'Belum ada data')}
                    minWidthClassName="min-w-[1280px]"
                    onRowClick={(row) =>
                        onOpenDetail({
                            recordId: row.id,
                            label: row.number,
                            tabLabel: row.number,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) => (
                        <span
                            className={`flex items-center gap-2 ${
                                column.align === 'right'
                                    ? 'justify-end'
                                    : column.align === 'center'
                                      ? 'justify-center'
                                      : 'justify-start'
                            }`.trim()}
                        >
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                />
            </div>
        </div>
    );
}
