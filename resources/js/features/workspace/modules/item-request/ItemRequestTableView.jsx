import { useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/ui/Pagination';
import SelectField from '@/components/ui/SelectField';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import { RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import useTableSort from '@/features/workspace/shared/useTableSort';

function TableFilterField({ filter, value, onChange }) {
    return (
        <SelectField
            value={value}
            onChange={(event) => onChange(filter.id, event.target.value)}
            className="h-[40px] min-w-[110px] rounded-[4px] border-ui-border"
            selectClassName="text-xs sm:text-sm text-brand-dark"
            containerClassName="w-auto"
        >
            {(filter.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </SelectField>
    );
}

export default function ItemRequestTableView({
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

    const filteredRows = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();

        return (config.table.rows ?? []).filter((row) => {
            if (filters.date && filters.date !== 'all' && row.dateFilter !== filters.date) {
                return false;
            }

            if (filters.status && filters.status !== 'all' && row.statusFilter !== filters.status) {
                return false;
            }



            if (filters.type && filters.type !== 'all' && row.typeFilter !== filters.type) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            return [
                row.number,
                row.date,
                row.requestType,
                row.notes,
                row.status,
                row.total,
                row.estimatedTotal,
            ]
                .join(' ')
                .toLowerCase()
                .includes(keyword);
        });
    }, [config.table.rows, filters, searchValue]);

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);

    const handleChangeFilter = (filterId, nextValue) => {
        setFilters((current) => ({
            ...current,
            [filterId]: nextValue,
        }));
    };

    return (
        <div className="flex min-h-full flex-col gap-3 rounded-[6px] border border-ui-border bg-white px-3 py-3 shadow-card-light sm:px-4">
            <TableToolbar
                filters={
                    config.table.filters?.length ? (
                        <>
                            {(config.table.filters ?? []).map((filter) => (
                                <TableFilterField
                                    key={filter.id}
                                    filter={filter}
                                    value={filters[filter.id] ?? filter.value ?? 'all'}
                                    onChange={handleChangeFilter}
                                />
                            ))}
                        </>
                    ) : null
                }
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{
                    label: config.table.refreshLabel || (loading ? 'Memuat...' : 'Perbarui'),
                    icon: <RefreshIcon className="h-4.5 w-4.5" />,
                    onClick: onRefresh,
                    loading,
                }}
                exportConfig={false}
                resourceName="item-requests"
                search={{
                    value: searchValue,
                    onChange: (event) => setSearchValue(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
                pageValue={String(sortedRows.length)}
            />

            <div className="min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={sortedRows}
                    emptyLabel={loading ? 'Memuat data...' : (error || 'Belum ada data')}
                    minWidthClassName="min-w-[1060px]"
                    onRowClick={(row) =>
                        onOpenDetail({
                            recordId: row.id,
                            label: row.number,
                            tabLabel: row.number,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer hover:bg-workspace-hover-bg'}
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                />
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
