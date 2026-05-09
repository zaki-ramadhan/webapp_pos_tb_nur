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
    TransactionDualTotalCard,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionHeaderButton,
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
    PrintIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

function buildDefaultValues(config) {
    return {
        paymentType: config.defaults?.paymentType ?? config.paymentTypeOptions?.[0] ?? '',
        branches: [...(config.defaults?.branches ?? [])],
        month: config.defaults?.month ?? config.monthOptions?.[0] ?? '',
        year: config.defaults?.year ?? config.yearOptions?.[0] ?? '',
        autoNumber: config.defaults?.autoNumber ?? true,
        numberingType: config.defaults?.numberingType ?? config.numberingOptions?.[0] ?? '',
        entryDate: config.defaults?.entryDate ?? '',
        dueDate: config.defaults?.dueDate ?? '',
        employeeLookup: config.defaults?.employeeLookup ?? '',
        liabilityAccounts: [...(config.defaults?.liabilityAccounts ?? [])],
        notes: config.defaults?.notes ?? '',
    };
}

function resolveCellAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}

function PayrollEmployeeSection({ config, values }) {
    return (
        <div className="flex min-h-[540px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <TextInput
                        value={values.employeeLookup}
                        readOnly
                        placeholder={config.employeeLookupPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[590px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />

                    <TransactionHeaderButton label={config.takeButtonLabel} className="h-[38px] px-4 text-[16px]" />
                </div>

                <div className="text-right text-[24px] font-normal text-[#1f2436]">
                    {config.employeeSectionTitle} <span className="text-[#ED3969]">*</span>
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <div className="min-w-[760px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {config.employeeTable.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${resolveCellAlignClassName(column.align)}`.trim()}
                                    >
                                        {column.kind === 'spacer' ? (
                                            <span className="flex justify-center">
                                                <SortIcon className="h-3 w-3 text-white/55" />
                                            </span>
                                        ) : (
                                            column.label
                                        )}
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {config.employeeTable.rows.length ? (
                                config.employeeTable.rows.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    >
                                        {config.employeeTable.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`${resolveCellAlignClassName(column.align)} px-3 text-[15px] text-[#131a28]`.trim()}
                                            >
                                                {column.kind === 'spacer' ? '' : formatTableTextValue(row[column.id])}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell
                                        colSpan={config.employeeTable.columns.length}
                                        className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                                    >
                                        {config.employeeTable.emptyLabel}
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>

            <div className="mt-5 flex justify-end">
                <TransactionDualTotalCard items={config.summaryItems} className="min-w-[360px] sm:min-w-[565px]" />
            </div>
        </div>
    );
}

function PayrollAdditionalInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="form" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[250px_minmax(0,570px)] lg:items-start">
                <TransactionFieldLabel label={config.additionalInfoFields.liabilityAccountLabel} required />
                <ChipLookupField
                    values={values.liabilityAccounts}
                    placeholder={config.additionalInfoFields.liabilityAccountPlaceholder}
                    onRemove={(value) =>
                        setValues((current) => ({
                            ...current,
                            liabilityAccounts: current.liabilityAccounts.filter((item) => item !== value),
                        }))
                    }
                    searchLabel="Cari akun hutang beban"
                />

                <TransactionFieldLabel label={config.additionalInfoFields.noteLabel} />
                <textarea
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={4}
                    className="min-h-[70px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
                />
            </div>
        </div>
    );
}

function PayrollFormView({ config }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'employees');
    const [values, setValues] = useState(() => buildDefaultValues(config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'employees');
        setValues(buildDefaultValues(config));
    }, [config]);

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? []).map((action) =>
                action.id === 'document'
                    ? {
                          ...action,
                          icon: 'form',
                      }
                    : action,
            ),
        [config.dockActions],
    );

    return (
        <TransactionFormLayout
            header={
                <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
                    <div className="grid gap-y-3 sm:grid-cols-[250px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.paymentType} />
                        <SelectField
                            value={values.paymentType}
                            onChange={(event) => setValues((current) => ({ ...current, paymentType: event.target.value }))}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.paymentTypeOptions.map((option) => (
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

                        <TransactionFieldLabel label={config.labels.periodMonth} />
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_158px]">
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
                    </div>

                    <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <div className="flex items-center gap-4">
                            <TransactionFieldLabel label={config.labels.numbering} required />
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
                        <SelectField
                            value={values.numberingType}
                            onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.numberingOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>

                        <TransactionFieldLabel label={config.labels.entryDate} required />
                        <TransactionDateInput value={values.entryDate} className="w-full max-w-full" />

                        <TransactionFieldLabel label={config.labels.dueDate} required />
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_88px]">
                            <TransactionDateInput value={values.dueDate} className="w-full max-w-full" />
                            <button
                                type="button"
                                disabled
                                className="inline-flex h-[38px] items-center justify-center rounded-[4px] border border-[#d3d7df] bg-[#f3f3f4] px-3 text-[15px] text-[#b1b5be]"
                            >
                                {config.processButtonLabel}
                            </button>
                        </div>
                    </div>
                </div>
            }
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            dockActions={dockActions}
        >
            {activeSectionId === 'additional-info' ? (
                <PayrollAdditionalInfoSection config={config} values={values} setValues={setValues} />
            ) : (
                <PayrollEmployeeSection config={config} values={values} />
            )}
        </TransactionFormLayout>
    );
}

function PayrollTableToolbar({ table, filters, setFilters, keyword, setKeyword, onCreate }) {
    return (
        <TableToolbar
            size="compact"
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
                icon: <PrintIcon className="h-5 w-5" />,
            }}
            menuButton={{
                label: table.settingsLabel,
                icon: <CogIcon className="h-4 w-4" />,
                items: [{ id: 'table-settings', label: table.settingsLabel }],
                widthClassName: 'w-[190px]',
            }}
            search={{
                value: keyword,
                onChange: (event) => setKeyword(event.target.value),
                placeholder: table.searchPlaceholder,
                widthClassName: 'sm:w-[342px]',
                trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
            }}
            pageValue={table.pageValue}
            className="space-y-3"
            filters={
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
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                    ))}

                    <button
                        type="button"
                        className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                        aria-label={table.filterButtonLabel}
                    >
                        <FunnelIcon className="h-5 w-5" />
                    </button>
                </div>
            }
        />
    );
}

function PayrollTableView({ config, onCreate }) {
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
            const matchFilter = config.table.filters.every((filter) => {
                const selectedValue = filters[filter.id];

                if (!selectedValue || selectedValue === 'all') {
                    return true;
                }

                return row[filter.rowKey] === selectedValue;
            });

            if (!matchFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return config.table.columns.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.columns, config.table.filters, config.table.rows, filters, keyword]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                <PayrollTableToolbar
                    table={config.table}
                    filters={filters}
                    setFilters={setFilters}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    onCreate={onCreate}
                />

                <div className="mt-3 min-h-0 overflow-x-auto">
                    <div className="min-w-[1180px]">
                        <DataTable wrapperClassName="border-[#d1d8e4]">
                            <DataTableHeader className="bg-[#5f7690]">
                                <tr>
                                    {config.table.columns.map((column) => (
                                        <DataTableHead
                                            key={column.id}
                                            className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${resolveCellAlignClassName(column.align)}`.trim()}
                                        >
                                            <span
                                                className={`flex items-center gap-2 ${
                                                    column.align === 'right' ? 'justify-end' : 'justify-start'
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
                                {filteredRows.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    >
                                        {config.table.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`${resolveCellAlignClassName(column.align)} px-3 text-[15px] text-[#131a28]`.trim()}
                                            >
                                                <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                            </DataTableCell>
                                        ))}
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

export default function PayrollEntryView({ page, mode, onOpenContent }) {
    const config = page.payrollEntry;

    return mode === 'table' ? (
        <PayrollTableView config={config} onCreate={onOpenContent} />
    ) : (
        <PayrollFormView config={config} />
    );
}
