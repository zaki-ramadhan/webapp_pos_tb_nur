import { useEffect, useMemo, useRef, useState } from 'react';

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
import TextInput from '@/components/ui/TextInput';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    ChevronDownIcon,
    CogIcon,
    FunnelIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SaveIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

function BudgetSectionRail({ tabs, activeTabId, onSelectTab }) {
    return (
        <div className="flex shrink-0 flex-row gap-1.5 lg:flex-col">
            {tabs.map((tab) => {
                const active = tab.id === activeTabId;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectTab(tab.id)}
                        aria-label={tab.label}
                        title={tab.label}
                        className={`inline-flex h-[36px] w-[36px] items-center justify-center rounded-[4px] border ${
                            active ? 'border-[#f08bb0] bg-white text-[#ff2d7a]' : 'border-[#bfc6d3] bg-[#f3f4f6] text-[#454d61]'
                        }`.trim()}
                    >
                        <NavigationIcon type={tab.icon} className="h-5 w-5 text-current" />
                    </button>
                );
            })}
        </div>
    );
}

function BudgetSplitDockButton({ action }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const isSplit = action.icon !== 'save' && action.items?.length;
    const tones = {
        muted: 'border-[#c8ccd4] bg-[#ececec] text-[#9aa0aa]',
        blue: 'border-[#4d94dd] bg-[#8fc0ef] text-[#0d4e96]',
        green: 'border-[#53c86f] bg-[#9ee29a] text-[#0b7a2a]',
    };
    const divider = {
        muted: 'border-l-[#d8dde7]',
        blue: 'border-l-[#5a9bdd]',
        green: 'border-l-[#66cf79]',
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => {
                    if (isSplit) {
                        setOpen((current) => !current);
                    }
                }}
                aria-label={action.label}
                title={action.label}
                className={`inline-flex h-[48px] w-[78px] shrink-0 overflow-hidden rounded-[8px] border shadow-[0_5px_10px_rgba(20,75,138,0.16)] sm:h-[52px] sm:w-[88px] lg:h-[56px] lg:w-[96px] ${tones[action.tone]}`.trim()}
            >
                <span className="inline-flex flex-1 items-center justify-center">
                    {action.icon === 'save' ? (
                        <SaveIcon className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9" />
                    ) : action.icon === 'document' ? (
                        <NavigationIcon type="document" className="h-7 w-7 sm:h-8 sm:w-8" />
                    ) : (
                        <NavigationIcon type="kebab" className="h-7 w-7 sm:h-8 sm:w-8" />
                    )}
                </span>
                {isSplit ? (
                    <span className={`inline-flex w-[28px] items-center justify-center border-l sm:w-[32px] ${divider[action.tone]}`.trim()}>
                        <ChevronDownIcon className="h-5 w-5" />
                    </span>
                ) : null}
            </button>

            {isSplit ? (
                <DropdownMenu
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorRef={buttonRef}
                    widthClassName="w-[190px]"
                >
                    <div className="flex flex-col">
                        {action.items.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                onClick={() => setOpen(false)}
                            >
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenu>
            ) : null}
        </div>
    );
}

function buildFormValues(config) {
    return {
        month: config.defaults?.month ?? config.monthOptions?.[0] ?? '',
        year: config.defaults?.year ?? config.yearOptions?.[0] ?? '',
        type: config.defaults?.type ?? config.typeOptions?.[0] ?? '',
        branches: config.defaults?.branches ?? [],
        keyword: '',
        notes: config.defaults?.notes ?? '',
        analyzer: config.defaults?.analyzer ?? '',
    };
}

function BudgetFormView({ page }) {
    const config = page.budgetPage;
    const [activeTabId, setActiveTabId] = useState(config.sectionTabs?.[0]?.id ?? 'budget-lines');
    const [values, setValues] = useState(() => buildFormValues(config));

    useEffect(() => {
        setActiveTabId(config.sectionTabs?.[0]?.id ?? 'budget-lines');
        setValues(buildFormValues(config));
    }, [config]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-[#d8dde7] px-4 py-4">
                        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                            <div className="grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                <label className="text-[17px] text-[#1f2436]">
                                    {config.labels.month}
                                    <span className="text-[#ED3969]"> *</span>
                                </label>
                                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_154px]">
                                    <SelectField
                                        value={values.month}
                                        onChange={(event) => setValues((current) => ({ ...current, month: event.target.value }))}
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        selectClassName="text-[15px] text-[#1f2436]"
                                    >
                                        {config.monthOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </SelectField>

                                    <SelectField
                                        value={values.year}
                                        onChange={(event) => setValues((current) => ({ ...current, year: event.target.value }))}
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        selectClassName="text-[15px] text-[#1f2436]"
                                    >
                                        {config.yearOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </SelectField>
                                </div>

                                <label className="text-[17px] text-[#1f2436]">{config.labels.type}</label>
                                <SelectField
                                    value={values.type}
                                    onChange={(event) => setValues((current) => ({ ...current, type: event.target.value }))}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    selectClassName="text-[15px] text-[#1f2436]"
                                >
                                    {config.typeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>

                            <div className="grid gap-y-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                <label className="text-[17px] text-[#1f2436] xl:text-right">
                                    {config.labels.branch}
                                    <span className="text-[#ED3969]"> *</span>
                                </label>
                                <ChipLookupField
                                    value={values.branches[0] ?? ''}
                                    searchLabel="Cari cabang anggaran"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex min-h-[620px] gap-3 px-2 py-2 sm:px-3">
                        <BudgetSectionRail
                            tabs={config.sectionTabs}
                            activeTabId={activeTabId}
                            onSelectTab={setActiveTabId}
                        />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeTabId === 'budget-info' ? (
                                <div className="min-h-[540px]">
                                    <div className="flex items-center gap-3 border-b border-[#d8dde7] pb-3">
                                        <NavigationIcon type="info" className="h-5 w-5 text-[#ff2d7a]" />
                                        <h3 className="text-[22px] font-normal text-[#1564d7]">{config.infoTitle}</h3>
                                    </div>

                                    <div className="mt-4 grid gap-4 lg:grid-cols-[250px_minmax(0,570px)] lg:items-start">
                                        <label className="pt-2 text-[17px] text-[#1f2436]">{config.labels.notes}</label>
                                        <textarea
                                            value={values.notes}
                                            onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
                                            rows={4}
                                            className="min-h-[60px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
                                        />

                                        <label className="pt-2 text-[17px] text-[#1f2436]">{config.labels.analyzer}</label>
                                        <TextInput
                                            value={values.analyzer}
                                            onChange={(event) => setValues((current) => ({ ...current, analyzer: event.target.value }))}
                                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                            inputClassName="text-[15px] text-[#1f2436]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex min-h-[540px] flex-col">
                                    <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                                            <TextInput
                                                value={values.keyword}
                                                onChange={(event) => setValues((current) => ({ ...current, keyword: event.target.value }))}
                                                placeholder={config.accountPlaceholder}
                                                trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                                                className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[590px]"
                                                inputClassName="text-[15px] text-[#1f2436]"
                                            />

                                            <button
                                                type="button"
                                                className="inline-flex h-[38px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[16px] text-[#21539b]"
                                            >
                                                {config.takeButtonLabel}
                                                <ChevronDownIcon className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="text-right text-[24px] font-normal text-[#1f2436]">
                                            {config.gridTitle} <span className="text-[#ED3969]">*</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                                        <div className="min-w-[760px]">
                                            <DataTable wrapperClassName="border-[#d1d8e4]">
                                                <DataTableHeader className="bg-[#5f7690]">
                                                    <tr>
                                                        {config.grid.columns.map((column) => (
                                                            <DataTableHead
                                                                key={column.id}
                                                                className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${column.align === 'right' ? 'text-right' : 'text-center'}`.trim()}
                                                            >
                                                                <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-center'}`.trim()}>
                                                                    <SortIcon className="h-3 w-3 text-white/55" />
                                                                    <span>{column.label}</span>
                                                                </span>
                                                            </DataTableHead>
                                                        ))}
                                                    </tr>
                                                </DataTableHeader>

                                                <DataTableBody>
                                                    <DataTableRow className="bg-white">
                                                        <DataTableCell
                                                            colSpan={config.grid.columns.length}
                                                            className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                                                        >
                                                            {config.grid.emptyLabel}
                                                        </DataTableCell>
                                                    </DataTableRow>
                                                </DataTableBody>
                                            </DataTable>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <div className="flex flex-row gap-3 xl:flex-col">
                        {config.dockActions.map((action) => (
                            <BudgetSplitDockButton key={action.id} action={action} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function BudgetTableView({ page, onCreate }) {
    const table = page.budgetPage.table;
    const [keyword, setKeyword] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState(table.filters[0]?.options?.[0]?.value ?? 'all');
    const [typeFilter, setTypeFilter] = useState(table.filters[1]?.options?.[0]?.value ?? 'all');
    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (departmentFilter !== 'all' && row.departmentValue !== departmentFilter) {
                return false;
            }

            if (typeFilter !== 'all' && row.typeValue !== typeFilter) {
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
    }, [departmentFilter, keyword, table.columns, table.rows, typeFilter]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={
                    <div className="flex flex-wrap items-center gap-2">
                        <SelectField
                            value={departmentFilter}
                            onChange={(event) => setDepartmentFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[34px] min-w-[144px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-[15px] text-[#394157]"
                        >
                            {table.filters[0].options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            value={typeFilter}
                            onChange={(event) => setTypeFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[34px] min-w-[100px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-[15px] text-[#394157]"
                        >
                            {table.filters[1].options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <button
                            type="button"
                            aria-label={table.filterButtonLabel}
                            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                        >
                            <FunnelIcon className="h-4.5 w-4.5" />
                        </button>
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
                printButton={{
                    label: table.printLabel,
                    icon: <PrintIcon className="h-4 w-4" />,
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
                <DataTable className="min-w-[1280px]" wrapperClassName="border-[#d1d8e4]">
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
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                >
                                    {table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-2.5 text-[15px] text-[#131a28]`.trim()}
                                        >
                                            {row[column.id]}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={table.columns.length} className="px-2.5 py-3 text-center text-[15px] text-[#131a28]">
                                    {table.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function BudgetView({ page, mode, onOpenContent }) {
    return mode === 'table' ? <BudgetTableView page={page} onCreate={onOpenContent} /> : <BudgetFormView page={page} />;
}
