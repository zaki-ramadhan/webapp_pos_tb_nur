import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    ChevronDownIcon,
    CogIcon,
    FunnelIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';
import {
    TransactionDataTable,
    TransactionFieldLabel,
    TransactionFormLayout,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

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

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? []).map((action) => ({
                ...action,
                tone: action.tone === 'green' ? 'success' : action.tone,
            })),
        [config.dockActions],
    );

    return (
        <TransactionFormLayout
            header={
                <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                    <div className="grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.month} required />
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

                        <TransactionFieldLabel label={config.labels.type} />
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
                        <TransactionFieldLabel label={config.labels.branch} required className="sm:text-right" />
                        <ChipLookupField
                            value={values.branches[0] ?? ''}
                            searchLabel="Cari cabang anggaran"
                            className="w-full"
                        />
                    </div>
                </div>
            }
            sectionTabs={config.sectionTabs}
            activeSectionId={activeTabId}
            onSectionChange={setActiveTabId}
            dockActions={dockActions}
        >
            {activeTabId === 'budget-info' ? (
                <div className="min-h-[540px]">
                    <div className="mt-4 grid gap-4 lg:grid-cols-[250px_minmax(0,570px)] lg:items-start">
                        <TransactionFieldLabel label={config.labels.notes} />
                        <textarea
                            value={values.notes}
                            onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
                            rows={4}
                            className="min-h-[60px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
                        />

                        <TransactionFieldLabel label={config.labels.analyzer} />
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
                            <AccountLookupTextInput
                                value={values.keyword}
                                placeholder={config.accountPlaceholder}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[590px]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                dialogTitle="Pilih Akun Anggaran"
                                searchLabel="Cari akun anggaran"
                                onSelectAccount={(_, label) =>
                                    setValues((current) => ({
                                        ...current,
                                        keyword: label,
                                    }))
                                }
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
                        <TransactionDataTable
                            columns={config.grid.columns}
                            rows={[]}
                            emptyLabel={config.grid.emptyLabel}
                            minWidthClassName="min-w-[760px]"
                            renderHeaderCell={(column) => (
                                <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-center'}`.trim()}>
                                    <SortIcon className="h-3 w-3 text-white/55" />
                                    <span>{column.label}</span>
                                </span>
                            )}
                        />
                    </div>
                </div>
            )}
        </TransactionFormLayout>
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
                <TransactionDataTable
                    columns={table.columns}
                    rows={filteredRows}
                    emptyLabel={table.emptyLabel}
                    minWidthClassName="min-w-[1280px]"
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : ''}`.trim()}>
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                    renderCell={({ row, column }) => row[column.id]}
                />
            </div>
        </div>
    );
}

export default function BudgetView({ page, mode, onOpenContent }) {
    return mode === 'table' ? <BudgetTableView page={page} onCreate={onOpenContent} /> : <BudgetFormView page={page} />;
}
