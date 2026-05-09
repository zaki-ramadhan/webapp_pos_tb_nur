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
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    CogIcon,
    PlusIcon,
    RefreshIcon,
    SaveIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

function PeriodDockButton({ label }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className="inline-flex h-12 w-[84px] shrink-0 items-center justify-center rounded-[8px] border border-[#c8ccd4] bg-[#ececec] text-[#9aa0aa] shadow-[0_4px_10px_rgba(15,23,42,0.08)] sm:h-[54px] sm:w-[92px] md:h-[58px] md:w-[96px]"
        >
            <SaveIcon className="h-9 w-9" />
        </button>
    );
}

function PeriodFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)] md:items-center">
            <label className="text-[17px] text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function PeriodEndTableView({ config, onCreate }) {
    const table = config.historyTable;
    const [keyword, setKeyword] = useState('');
    const [monthFilter, setMonthFilter] = useState(table.filters?.[0]?.options?.[0]?.value ?? 'all');
    const [yearFilter, setYearFilter] = useState(table.filters?.[1]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (monthFilter !== 'all' && row.monthValue !== monthFilter) {
                return false;
            }

            if (yearFilter !== 'all' && row.yearValue !== yearFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return table.columns.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, monthFilter, table.columns, table.rows, yearFilter]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={
                    <div className="flex flex-wrap items-center gap-2">
                        <SelectField
                            value={monthFilter}
                            onChange={(event) => setMonthFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[34px] min-w-[106px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-[15px] text-[#394157]"
                        >
                            {table.filters[0].options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            value={yearFilter}
                            onChange={(event) => setYearFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[34px] min-w-[110px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-[15px] text-[#394157]"
                        >
                            {table.filters[1].options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                }
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                menuButton={{
                    label: table.actionsLabel,
                    icon: <CogIcon className="h-4 w-4" />,
                    items: table.menuItems,
                    widthClassName: 'w-[190px]',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1180px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${column.align === 'right' ? 'text-right' : 'text-left'}`.trim()}
                                >
                                    <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : ''}`.trim()}>
                                        <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                        <span>{column.label}</span>
                                    </span>
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.map((row, index) => (
                            <DataTableRow
                                key={row.id}
                                className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                            >
                                {table.columns.map((column) => (
                                    <DataTableCell key={column.id} className="px-2.5 text-[15px] text-[#131a28]">
                                        {row[column.id]}
                                    </DataTableCell>
                                ))}
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

function PeriodEndFormView({ config }) {
    const [month, setMonth] = useState(config.defaults?.month ?? config.monthOptions?.[0] ?? '');
    const [year, setYear] = useState(config.defaults?.year ?? config.yearOptions?.[0] ?? '');

    return (
        <div className="min-h-full rounded-[6px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="grid max-w-[760px] gap-3 md:grid-cols-[140px_minmax(0,1fr)] md:items-center">
                    <PeriodFieldRow label={config.labels.month} required>
                        <SelectField
                            value={month}
                            onChange={(event) => setMonth(event.target.value)}
                            className="h-[40px] max-w-[424px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.monthOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </PeriodFieldRow>

                    <PeriodFieldRow label={config.labels.year}>
                        <SelectField
                            value={year}
                            onChange={(event) => setYear(event.target.value)}
                            className="h-[40px] max-w-[118px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.yearOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </PeriodFieldRow>
                </div>

                <div className="flex justify-end">
                    <PeriodDockButton label={config.saveLabel} />
                </div>
            </div>

            <div className="mt-3 flex gap-3">
                <button
                    type="button"
                    aria-label={config.gridButtonLabel}
                    className="inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[4px] border border-[#f39bb8] bg-white text-[#ff2d7a]"
                >
                    <NavigationIcon type="format" className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1 overflow-x-auto">
                    <div className="min-w-[720px]">
                        <DataTable wrapperClassName="border-[#d1d8e4]">
                            <DataTableHeader className="bg-[#5f7690]">
                                <tr>
                                    {config.ratesTable.columns.map((column) => (
                                        <DataTableHead
                                            key={column.id}
                                            className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${column.align === 'right' ? 'text-right' : 'text-center'}`.trim()}
                                        >
                                            {column.label}
                                        </DataTableHead>
                                    ))}
                                </tr>
                            </DataTableHeader>

                            <DataTableBody>
                                {config.ratesTable.rows.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    >
                                        <DataTableCell className="w-[36px] px-3 text-center text-[#a4acbc]">≡</DataTableCell>
                                        <DataTableCell className="px-3 text-[15px] text-[#131a28]">{row.currencyName}</DataTableCell>
                                        <DataTableCell className="px-3 text-right text-[15px] text-[#131a28]">{row.rate}</DataTableCell>
                                    </DataTableRow>
                                ))}
                            </DataTableBody>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PeriodEndView({ page, mode, onOpenContent }) {
    const config = page.periodEnd;

    return mode === 'table' ? (
        <PeriodEndTableView config={config} onCreate={onOpenContent} />
    ) : (
        <PeriodEndFormView config={config} />
    );
}
