import { useMemo, useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
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
    ChevronDownIcon,
    CogIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

import { cleanHeaderLabel, getColumnMinWidth } from '@/features/workspace/shared/columnVisibility';

function ActionMenuButton({ menu }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    if (!menu?.items?.length) {
        return null;
    }

    return (
        <div className="relative shrink-0">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-2 text-[#2353a0]"
                aria-label={menu.label}
                title={menu.label}
            >
                <CogIcon className="h-4 w-4" />
                <ChevronDownIcon className="h-4 w-4" />
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName={menu.widthClassName ?? 'w-[200px]'}
            >
                <div className="flex flex-col">
                    {menu.items.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => setOpen(false)}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}

function PrimaryToolbarButton({ action }) {
    if (!action) {
        return null;
    }

    return (
        <button
            type="button"
            className="inline-flex h-[34px] shrink-0 items-center justify-center rounded-[4px] bg-[#ff7a00] px-4 text-[15px] font-medium text-white shadow-[0_4px_10px_rgba(173,89,0,0.14)]"
            aria-label={action.label}
        >
            {action.label}
        </button>
    );
}

function SavedTransactionFilters({ filters, values, onChange }) {
    return filters.map((filter) => (
        <SelectField
            key={filter.id}
            value={values[filter.id]}
            onChange={(event) => onChange(filter.id, event.target.value)}
            containerClassName="w-auto shrink-0"
            className="h-[34px] min-w-[128px] rounded-[4px] border-[#cfd6e2]"
            selectClassName="px-3 text-[15px] text-[#394157]"
            iconClassName="mr-2 text-[#6c7894]"
        >
            {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </SelectField>
    ));
}

export default function SavedTransactionsView({ page }) {
    const table = page.savedTransactions;
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        (table.filters ?? []).reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const cleanedColumns = useMemo(() => {
        return (table.columns ?? []).map(col => ({
            ...col,
            label: cleanHeaderLabel(col.label)
        }));
    }, [table.columns]);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            const matchesFilters = (table.filters ?? []).every((filter) => {
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

            return cleanedColumns.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [filters, keyword, cleanedColumns, table.filters, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={
                    table.filters?.length ? (
                        <SavedTransactionFilters
                            filters={table.filters}
                            values={filters}
                            onChange={(filterId, nextValue) =>
                                setFilters((current) => ({
                                    ...current,
                                    [filterId]: nextValue,
                                }))
                            }
                        />
                    ) : null
                }
                size="compact"
                refreshButton={{
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                rightControls={
                    <>
                        <ActionMenuButton menu={table.actionMenu} />
                        <PrimaryToolbarButton action={table.primaryAction} />
                    </>
                }
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: table.searchWidthClassName ?? 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable
                    className={table.tableClassName ?? 'min-w-[1080px]'}
                    wrapperClassName="border-[#d1d8e4]"
                >
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {cleanedColumns.map((column) => {
                                const minWidth = getColumnMinWidth(column.label);
                                return (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`.trim()}
                                        style={minWidth ? { minWidth } : undefined}
                                    >
                                        <span
                                            className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`.trim()}
                                        >
                                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                            <span>{column.label}</span>
                                        </span>
                                    </DataTableHead>
                                );
                            })}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                >
                                    {cleanedColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'} px-2.5 text-[15px] text-[#131a28]`.trim()}
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell
                                    colSpan={cleanedColumns.length}
                                    className="px-2.5 py-3 text-center text-[15px] text-[#131a28]"
                                >
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
