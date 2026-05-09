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
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import {
    DownloadIcon,
    FunnelIcon,
    LinkIcon,
    PlusIcon,
    PrintIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

export function buildDepositFormState(source = {}) {
    return Object.fromEntries(
        Object.entries(source).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value]),
    );
}

export function ReadonlyTransactionTextarea({ value, rows = 3, className = '' }) {
    return (
        <textarea
            value={value}
            readOnly
            rows={rows}
            className={`w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none ${className}`.trim()}
        />
    );
}

export function DepositStamp({ label, tone = 'blue', className = '' }) {
    const toneClassName =
        tone === 'gray'
            ? 'border-[#bebfc8] text-[#b8bac3]'
            : tone === 'green'
              ? 'border-[#8bd987] text-[#8ccc81]'
              : 'border-[#7fd1ff] text-[#7dcaf4]';

    return (
        <div
            className={`pointer-events-none absolute flex h-[98px] w-[144px] rotate-[-18deg] items-center justify-center opacity-55 ${className}`.trim()}
        >
            <div
                className={`relative flex h-[82px] w-[82px] items-center justify-center rounded-full border-[4px] ${toneClassName}`.trim()}
            >
                <div className={`absolute h-[96px] w-[96px] rounded-full border-[2px] ${toneClassName}`.trim()} />
            </div>
            <div
                className={`absolute whitespace-pre-line rounded-[3px] border-[3px] bg-white px-3 py-1 text-center text-[14px] font-bold leading-[1.05] tracking-[0.12em] ${toneClassName}`.trim()}
            >
                {label}
            </div>
        </div>
    );
}

export function DepositStatusPill({ value }) {
    const toneClassName =
        value === 'Lunas'
            ? 'border-[#bcebc1] bg-[#effcf0] text-[#2db757]'
            : 'border-[#ffd08c] bg-[#fff5e7] text-[#ff8d08]';

    return (
        <span className={`inline-flex rounded-[4px] border px-3 py-1 text-[15px] ${toneClassName}`.trim()}>
            {value}
        </span>
    );
}

export function DepositAmountField({ prefix = 'Rp', value, className = '' }) {
    return (
        <div className={`flex h-[34px] overflow-hidden rounded-[4px] border border-[#cfd6e2] ${className}`.trim()}>
            <span className="inline-flex items-center border-r border-[#d8dde7] bg-[#f5f6f8] px-3 text-[15px] text-[#9aa3b1]">
                {prefix}
            </span>
            <span className="inline-flex flex-1 items-center justify-end px-3 text-[18px] font-semibold text-[#111827]">
                {value}
            </span>
            <span className="inline-flex w-10 items-center justify-center border-l border-[#d8dde7] text-[#1f2436]">
                <NavigationIcon type="payment" className="h-4 w-4 text-current" />
            </span>
        </div>
    );
}

export function DepositFooterSummary({ items = [] }) {
    if (!items.length) {
        return null;
    }

    const gridTemplateClassName =
        items.length >= 4 ? 'md:grid-cols-4' : items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

    return (
        <div className="flex justify-end">
            <div
                className={`grid w-full max-w-[866px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${gridTemplateClassName}`.trim()}
            >
                {items.map((item, index) => (
                    <div
                        key={item.id ?? item.label}
                        className={`border-b border-[#e4e8f0] px-4 py-3 last:border-b-0 md:border-b-0 md:px-5 ${
                            index < items.length - 1 ? 'md:border-r' : ''
                        }`.trim()}
                    >
                        <div className="flex items-center gap-2 text-[17px] text-[#1f2436]">
                            <span>{item.label}</span>
                            {item.badge ? (
                                <span className="inline-flex rounded-[4px] border border-[#8ab2ea] px-1.5 py-0.5 text-[12px] text-[#21539b]">
                                    {item.badge}
                                </span>
                            ) : null}
                        </div>
                        <div className="mt-2 text-right text-[18px] font-semibold text-[#111827]">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DepositLinkedRowsSection({ title, icon = 'payment', rows = [], emptyLabel = 'Belum ada data.' }) {
    return (
        <section>
            <div className="flex items-center gap-3 border-b border-[#d8dde7] pb-3">
                <NavigationIcon type={icon} className="h-5 w-5 text-[#2f78e5]" />
                <h3 className="text-[22px] font-normal text-[#1564d7]">{title}</h3>
            </div>

            <div className="mt-4">
                {rows.length ? (
                    <div className="rounded-[4px] border border-[#d8dde7] bg-white">
                        {rows.map((item, index) => (
                            <div
                                key={item.id}
                                className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 ${
                                    index > 0 ? 'border-t border-[#e6ebf2]' : ''
                                }`.trim()}
                            >
                                <div>
                                    <div className="text-[17px] font-semibold text-[#1661d8]">{item.number}</div>
                                    <div className="mt-1 text-[14px] text-[#1f2436]">{item.date}</div>
                                </div>
                                <div className="text-right text-[17px] font-semibold text-[#111827]">{item.amount}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[4px] border border-dashed border-[#d8dde7] px-4 py-6 text-[15px] text-[#7d879a]">
                        {emptyLabel}
                    </div>
                )}
            </div>
        </section>
    );
}

function DepositTableFilterBar({ table, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) =>
                        setFilters((current) => ({
                            ...current,
                            [filter.id]: event.target.value,
                        }))
                    }
                    containerClassName="w-auto"
                    className="h-[34px] min-w-[118px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-[15px] text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {filter.options.map((option, optionIndex) => (
                        <option key={`${filter.id}-${option.label}-${optionIndex}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}

            <button
                type="button"
                className="inline-flex h-[34px] w-[48px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}

export function DepositTableView({
    config,
    onCreate,
    onOpenDetail,
    rowSearchFields = [],
}) {
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        config.table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const resolvedSearchFields = rowSearchFields.length
        ? rowSearchFields
        : config.table.columns.map((column) => column.id);

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

            return resolvedSearchFields.some((field) =>
                String(row[field] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.filters, config.table.rows, filters, keyword, resolvedSearchFields]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={<DepositTableFilterBar table={config.table} filters={filters} setFilters={setFilters} />}
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
                        <TransactionToolbarSplitButton
                            label="Unduh"
                            icon={<DownloadIcon className="h-4 w-4" />}
                            items={config.table.downloadItems}
                        />
                        <TransactionToolbarSplitButton
                            label="Cetak"
                            icon={<PrintIcon className="h-4 w-4" />}
                            items={config.table.printItems}
                        />
                        <TransactionToolbarSplitButton
                            label="Pengaturan tabel"
                            icon={<NavigationIcon type="settings" className="h-4 w-4" />}
                            items={config.table.settingsItems}
                        />
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
                <DataTable className={config.table.minWidthClassName ?? 'min-w-[1480px]'} wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${
                                        column.align === 'right'
                                            ? 'text-right'
                                            : column.align === 'center'
                                              ? 'text-center'
                                              : 'text-left'
                                    }`.trim()}
                                >
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
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${
                                        index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'
                                    }`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row[config.table.detailLabelKey ?? 'number'],
                                            tabLabel: row[config.table.detailTabLabelKey ?? 'number'],
                                        })
                                    }
                                >
                                    {config.table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'} px-2.5 text-[15px] text-[#131a28]`.trim()}
                                        >
                                            {column.render ? (
                                                column.render({
                                                    row,
                                                    value: row[column.id],
                                                    column,
                                                })
                                            ) : (
                                                <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-[#dde1e8] bg-white">
                                <DataTableCell colSpan={config.table.columns.length} className="px-2.5 py-6 text-center text-[15px] text-[#7d879a]">
                                    {config.table.emptyLabel ?? 'Belum ada data'}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
