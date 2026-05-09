import { useEffect, useMemo, useState } from 'react';

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
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CogIcon,
    FunnelIcon,
    PlusIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

function buildInitialValues(config) {
    return {
        year: config.defaults?.year ?? config.yearOptions?.[0] ?? '',
        type: config.defaults?.type ?? config.typeOptions?.[0] ?? '',
        branches: [...(config.defaults?.branches ?? [])],
        autoNumber: config.defaults?.autoNumber ?? true,
        numberingType: config.defaults?.numberingType ?? config.numberingOptions?.[0] ?? '',
        transferNumber: config.defaults?.transferNumber ?? '',
        date: config.defaults?.date ?? '',
        fromMonth: config.defaults?.fromMonth ?? config.monthOptions?.[0] ?? '',
        fromBudget: config.defaults?.fromBudget ?? '',
        remainingBudget: config.defaults?.remainingBudget ?? '-',
        transferAmount: config.defaults?.transferAmount ?? '',
        toMonth: config.defaults?.toMonth ?? config.monthOptions?.[0] ?? '',
        toBudget: config.defaults?.toBudget ?? '',
        notes: config.defaults?.notes ?? '',
    };
}

function resolveCellAlignClassName(align, fallback = 'text-left') {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return fallback;
}

function BudgetLookupInput({ value, placeholder, onChange }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
            inputClassName="text-[15px] text-[#1f2436]"
        />
    );
}

function TransferAmountInput({ value, onChange, prefix }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            trailing={<TableActionIcon className="h-[18px] w-[18px] text-[#1f2436]" />}
            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
            prefixClassName="min-w-[46px] justify-center border-r-[#d8dde7] bg-[#fbfcfe] px-2 text-[15px] text-[#9097aa]"
            inputClassName="text-[15px] text-[#1f2436]"
            trailingClassName="px-2.5"
        />
    );
}

function TransferBudgetPanel({ title, children }) {
    return (
        <section className="min-w-0">
            <div className="border-b border-[#d8dde7] pb-3">
                <h3 className="text-[22px] font-normal text-[#1564d7]">{title}</h3>
            </div>
            <div className="pt-4">{children}</div>
        </section>
    );
}

function TransferDetailsSection({ config, values, setValues }) {
    return (
        <div className="min-h-[540px]">
            <div className="grid gap-8 xl:grid-cols-2">
                <TransferBudgetPanel title={config.fromTitle}>
                    <div className="grid gap-y-4 sm:grid-cols-[280px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.month} required />
                        <SelectField
                            value={values.fromMonth}
                            onChange={(event) => setValues((current) => ({ ...current, fromMonth: event.target.value }))}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.monthOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>

                        <TransactionFieldLabel label={config.labels.budget} required />
                        <BudgetLookupInput
                            value={values.fromBudget}
                            placeholder={config.accountPlaceholder}
                            onChange={(event) => setValues((current) => ({ ...current, fromBudget: event.target.value }))}
                        />

                        <TransactionFieldLabel label={config.labels.remainingBudget} />
                        <div className="text-[17px] text-[#1f2436]">{formatTableTextValue(values.remainingBudget)}</div>

                        <TransactionFieldLabel label={config.labels.transferAmount} required />
                        <div className="max-w-[348px]">
                            <TransferAmountInput
                                value={values.transferAmount}
                                onChange={(event) => setValues((current) => ({ ...current, transferAmount: event.target.value }))}
                                prefix={config.currencyPrefix}
                            />
                        </div>
                    </div>
                </TransferBudgetPanel>

                <TransferBudgetPanel title={config.toTitle}>
                    <div className="grid gap-y-4 sm:grid-cols-[280px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.month} required />
                        <SelectField
                            value={values.toMonth}
                            onChange={(event) => setValues((current) => ({ ...current, toMonth: event.target.value }))}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.monthOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>

                        <TransactionFieldLabel label={config.labels.budget} required />
                        <BudgetLookupInput
                            value={values.toBudget}
                            placeholder={config.accountPlaceholder}
                            onChange={(event) => setValues((current) => ({ ...current, toBudget: event.target.value }))}
                        />
                    </div>
                </TransferBudgetPanel>
            </div>
        </div>
    );
}

function TransferInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.infoTitle} icon="document" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[250px_minmax(0,570px)] lg:items-start">
                <TransactionFieldLabel label={config.labels.notes} />
                <textarea
                    value={values.notes}
                    onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
                    rows={4}
                    className="min-h-[60px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
                />
            </div>
        </div>
    );
}

function BudgetTransferFormView({ config }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildInitialValues(config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildInitialValues(config));
    }, [config]);

    return (
        <TransactionFormLayout
            header={
                <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                    <div className="grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.year} required />
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

                        <TransactionFieldLabel label={config.labels.branch} required />
                        <ChipLookupField
                            values={values.branches}
                            placeholder={config.branchPlaceholder}
                            onRemove={(value) =>
                                setValues((current) => ({
                                    ...current,
                                    branches: current.branches.filter((item) => item !== value),
                                }))
                            }
                            searchLabel="Cari cabang"
                        />
                    </div>

                    <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <div className="flex items-center justify-start gap-4 sm:justify-end">
                            <TransactionFieldLabel label={config.labels.transferNumber} required className="sm:text-right" />
                            <TransactionSwitch
                                checked={values.autoNumber}
                                onChange={(nextChecked) =>
                                    setValues((current) => ({
                                        ...current,
                                        autoNumber: nextChecked,
                                    }))
                                }
                            />
                        </div>

                        {values.autoNumber ? (
                            <SelectField
                                value={values.numberingType}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        numberingType: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#1f2436]"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        ) : (
                            <TextInput
                                value={values.transferNumber}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        transferNumber: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        )}

                        <TransactionFieldLabel label={config.labels.date} required className="sm:text-right" />
                        <TransactionDateInput value={values.date} className="w-full max-w-full" />
                    </div>
                </div>
            }
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            dockActions={config.dockActions}
        >
            {activeSectionId === 'additional-info' ? (
                <TransferInfoSection config={config} values={values} setValues={setValues} />
            ) : (
                <TransferDetailsSection config={config} values={values} setValues={setValues} />
            )}
        </TransactionFormLayout>
    );
}

function TableUtilityButton({ label, children }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
        >
            {children}
        </button>
    );
}

function BudgetTransferTableView({ config, onCreate }) {
    const [keyword, setKeyword] = useState('');
    const [dateFilter, setDateFilter] = useState(config.table.filters[0]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(
        () =>
            config.table.rows.filter((row) => {
                if (dateFilter !== 'all' && row.dateFilterValue !== dateFilter) {
                    return false;
                }

                const normalizedKeyword = keyword.trim().toLowerCase();

                if (!normalizedKeyword) {
                    return true;
                }

                return config.table.columns.some((column) =>
                    String(row[column.id] ?? '')
                        .toLowerCase()
                        .includes(normalizedKeyword),
                );
            }),
        [config.table.columns, config.table.rows, dateFilter, keyword],
    );

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={
                    <div className="flex flex-wrap items-center gap-2">
                        <SelectField
                            value={dateFilter}
                            onChange={(event) => setDateFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[34px] min-w-[126px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-[15px] text-[#394157]"
                            iconClassName="mr-2 text-[#6c7894]"
                        >
                            {config.table.filters[0].options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <button
                            type="button"
                            aria-label={config.table.filterButtonLabel}
                            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                        >
                            <FunnelIcon className="h-4.5 w-4.5" />
                        </button>
                    </div>
                }
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                rightControls={
                    <TableUtilityButton label={config.table.settingsLabel}>
                        <CogIcon className="h-4 w-4" />
                    </TableUtilityButton>
                }
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
                <DataTable className="min-w-[1180px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${resolveCellAlignClassName(column.align)}`.trim()}
                                >
                                    <span
                                        className={`flex items-center gap-2 ${
                                            column.align === 'right' ? 'justify-end' : 'justify-center'
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
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                >
                                    {config.table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${resolveCellAlignClassName(column.align, 'text-center')} px-2.5 text-[15px] text-[#131a28]`.trim()}
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={config.table.columns.length} className="px-2.5 py-3 text-center text-[15px] text-[#131a28]">
                                    {config.table.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function BudgetTransferView({ page, mode, onOpenContent }) {
    const config = page.budgetTransfer;

    return mode === 'table' ? (
        <BudgetTransferTableView config={config} onCreate={onOpenContent} />
    ) : (
        <BudgetTransferFormView config={config} />
    );
}
