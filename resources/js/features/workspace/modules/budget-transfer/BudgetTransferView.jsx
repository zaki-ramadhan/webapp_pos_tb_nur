import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
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

function TransferAmountInput({ value, onChange, prefix }) {
    return (
        <FormattedAmountInput
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
                        <AccountLookupTextInput
                            value={values.fromBudget}
                            placeholder={config.accountPlaceholder}
                            dialogTitle="Pilih Anggaran Asal"
                            searchLabel="Cari akun anggaran asal"
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    fromBudget: label,
                                }))
                            }
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
                        <AccountLookupTextInput
                            value={values.toBudget}
                            placeholder={config.accountPlaceholder}
                            dialogTitle="Pilih Anggaran Tujuan"
                            searchLabel="Cari akun anggaran tujuan"
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    toBudget: label,
                                }))
                            }
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

function BudgetTransferFormView({ pageId, activeLevel2Tab, config }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildInitialValues(config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildInitialValues(config));
    }, [config]);

    const initialComparable = useMemo(() => {
        const initialValues = buildInitialValues(config);

        return {
            year: initialValues.year,
            type: initialValues.type,
            branches: initialValues.branches,
            autoNumber: initialValues.autoNumber,
            numberingType: initialValues.numberingType,
            transferNumber: initialValues.transferNumber,
            date: initialValues.date,
            fromMonth: initialValues.fromMonth,
            fromBudget: initialValues.fromBudget,
            transferAmount: initialValues.transferAmount,
            toMonth: initialValues.toMonth,
            toBudget: initialValues.toBudget,
            notes: initialValues.notes,
        };
    }, [config]);

    const currentComparable = useMemo(
        () => ({
            year: values.year,
            type: values.type,
            branches: values.branches,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            transferNumber: values.transferNumber,
            date: values.date,
            fromMonth: values.fromMonth,
            fromBudget: values.fromBudget,
            transferAmount: values.transferAmount,
            toMonth: values.toMonth,
            toBudget: values.toBudget,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.year, value: values.year },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                    {
                        label: config.labels.transferNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.transferNumber),
                    },
                    { label: config.labels.date, value: values.date },
                    { label: `${config.fromTitle} - ${config.labels.month}`, value: values.fromMonth },
                    { label: `${config.fromTitle} - ${config.labels.budget}`, value: values.fromBudget },
                    { label: config.labels.transferAmount, value: values.transferAmount },
                    { label: `${config.toTitle} - ${config.labels.month}`, value: values.toMonth },
                    { label: `${config.toTitle} - ${config.labels.budget}`, value: values.toBudget },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.fromTitle,
            config.labels.branch,
            config.labels.budget,
            config.labels.date,
            config.labels.month,
            config.labels.transferAmount,
            config.labels.transferNumber,
            config.labels.year,
            config.toTitle,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.branches,
            values.date,
            values.fromBudget,
            values.fromMonth,
            values.numberingType,
            values.toBudget,
            values.toMonth,
            values.transferAmount,
            values.transferNumber,
            values.year,
        ],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? []).map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          disabled: saveDisabled,
                      }
                    : action,
            ),
        [config.dockActions, saveDisabled],
    );

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
                        <TransactionDateInput
                            value={values.date}
                            onChange={(nextValue) => setValues((current) => ({ ...current, date: nextValue }))}
                            className="w-full max-w-full"
                        />
                    </div>
                </div>
            }
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            dockActions={dockActions}
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
    const tableColumns = useMemo(
        () =>
            config.table.columns.map((column) => ({
                ...column,
                align: column.align ?? 'center',
            })),
        [config.table.columns],
    );

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

                return tableColumns.some((column) =>
                    String(row[column.id] ?? '')
                        .toLowerCase()
                        .includes(normalizedKeyword),
                );
            }),
        [config.table.rows, dateFilter, keyword, tableColumns],
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
                <TransactionDataTable
                    columns={tableColumns}
                    rows={filteredRows}
                    emptyLabel={config.table.emptyLabel}
                    minWidthClassName="min-w-[1180px]"
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-center'}`.trim()}>
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                />
            </div>
        </div>
    );
}

export default function BudgetTransferView({ page, mode, activeLevel2Tab, onOpenContent }) {
    const config = page.budgetTransfer;

    return mode === 'table' ? (
        <BudgetTransferTableView config={config} onCreate={onOpenContent} />
    ) : (
        <BudgetTransferFormView pageId={page.id} activeLevel2Tab={activeLevel2Tab} config={config} />
    );
}
