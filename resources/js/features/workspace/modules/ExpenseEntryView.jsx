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
    TransactionHeaderButton,
    TransactionLineItemsSection,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CogIcon,
    CloseIcon,
    DownloadIcon,
    FunnelIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

function buildFormState(source = {}) {
    return {
        liabilityAccounts: [...(source.liabilityAccounts ?? [])],
        entryDate: source.entryDate ?? '',
        autoNumber: source.autoNumber ?? true,
        numberingType: source.numberingType ?? '',
        documentNumber: source.documentNumber ?? '',
        dueDate: source.dueDate ?? '',
        branches: [...(source.branches ?? [])],
        notes: source.notes ?? '',
        lineLookup: source.lineLookup ?? '',
        lineItems: [...(source.lineItems ?? [])],
        paidAmount: source.paidAmount ?? 'Rp 0',
        status: source.status ?? '-',
        totalValue: source.totalValue ?? '0',
        saveTone: source.saveTone ?? 'primary',
    };
}

function ExpenseLineItemsSection({ config, values, setValues }) {
    const detailTitle = values.lineItems.length
        ? `${values.lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    return (
        <TransactionLineItemsSection
            searchValue={values.lineLookup}
            onSearchChange={(event) =>
                setValues((current) => ({
                    ...current,
                    lineLookup: event.target.value,
                }))
            }
            searchPlaceholder={config.lineSearchPlaceholder}
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            spacerHeaderContent={
                <span className="flex justify-center">
                    <SortIcon className="h-3 w-3 text-white/55" />
                </span>
            }
        />
    );
}

function ExpenseAdditionalInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[250px_minmax(0,570px)] lg:items-start">
                <TransactionFieldLabel label={config.labels.dueDate} required />
                <TransactionDateInput value={values.dueDate} className="w-full max-w-full" />

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

                <TransactionFieldLabel label={config.labels.notes} />
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

function ExpenseSummarySection({ config, values }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.summaryTitle} icon="document" />

            <div className="mt-4 max-w-[860px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)]">
                <div className="grid grid-cols-[minmax(0,1fr)_220px] border-b border-[#d8dde7] px-4 py-3 text-[17px] text-[#1f2436]">
                    <span>{config.summaryRows.paidAmountLabel}</span>
                    <span className="text-right font-semibold text-[#111827]">{values.paidAmount}</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_220px] px-4 py-3 text-[17px] text-[#1f2436]">
                    <span>{config.summaryRows.statusLabel}</span>
                    <span className="text-right font-semibold text-[#111827]">{values.status}</span>
                </div>
            </div>
        </div>
    );
}

function ExpenseFormView({ config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const showAutoNumberSwitch = !activeRecordId;
    const entryContent = useMemo(() => {
        if (activeRecordId) {
            return config.records?.[activeRecordId] ?? config.draft;
        }

        return config.draft;
    }, [activeRecordId, config.draft, config.records]);
    const [values, setValues] = useState(() => buildFormState(entryContent));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(entryContent));
    }, [config.sectionTabs, entryContent]);

    const dockActions = useMemo(() => {
        const baseActions = config.dockActions ?? [];

        return baseActions
            .filter((action) => (activeRecordId ? true : action.id !== 'delete'))
            .map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          tone: values.saveTone,
                      }
                    : action,
            );
    }, [activeRecordId, config.dockActions, values.saveTone]);

    return (
        <TransactionFormLayout
            header={
                <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
                    <div className="grid gap-y-3 sm:grid-cols-[250px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.liabilityAccount} required />
                        <ChipLookupField
                            values={values.liabilityAccounts}
                            placeholder={config.liabilityAccountPlaceholder}
                            onRemove={(value) =>
                                setValues((current) => ({
                                    ...current,
                                    liabilityAccounts: current.liabilityAccounts.filter((item) => item !== value),
                                }))
                            }
                            searchLabel="Cari akun hutang beban"
                        />

                        <TransactionFieldLabel label={config.labels.entryDate} required />
                        <TransactionDateInput value={values.entryDate} className="w-full max-w-full" />
                    </div>

                    <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <div className="flex items-center gap-4">
                            <TransactionFieldLabel label={config.labels.documentNumber} required />
                            {showAutoNumberSwitch ? (
                                <TransactionSwitch
                                    checked={values.autoNumber}
                                    onChange={(nextChecked) =>
                                        setValues((current) => ({
                                            ...current,
                                            autoNumber: nextChecked,
                                        }))
                                    }
                                />
                            ) : null}
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
                                value={values.documentNumber}
                                readOnly
                                trailing={<CloseIcon className="h-4 w-4 text-[#1f2436]" />}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        )}

                        <div />
                        <div className="flex flex-wrap justify-end gap-2">
                            <TransactionHeaderButton label={config.takeButtonLabel} />
                            <TransactionHeaderButton label={config.processButtonLabel} trailingChevron />
                        </div>
                    </div>
                </div>
            }
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            footer={<TransactionTotalCard label={config.totalCardLabel} value={values.totalValue} />}
            dockActions={dockActions}
        >
            {activeSectionId === 'additional-info' ? (
                <ExpenseAdditionalInfoSection config={config} values={values} setValues={setValues} />
            ) : activeSectionId === 'summary' ? (
                <ExpenseSummarySection config={config} values={values} />
            ) : (
                <ExpenseLineItemsSection config={config} values={values} setValues={setValues} />
            )}
        </TransactionFormLayout>
    );
}

function ExpenseTableFilters({ table, filters, setFilters }) {
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
    );
}

function ExpenseEntryTableView({ config, onCreate, onOpenDetail }) {
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
            const matchesFilters = config.table.filters.every((filter) => {
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
                <TableToolbar
                    size="compact"
                    className="space-y-3"
                    filters={<ExpenseTableFilters table={config.table} filters={filters} setFilters={setFilters} />}
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
                        <>
                            <TransactionToolbarIconButton label={config.table.downloadLabel}>
                                <DownloadIcon className="h-4 w-4" />
                            </TransactionToolbarIconButton>
                            <TransactionToolbarIconButton label={config.table.printLabel}>
                                <PrintIcon className="h-4 w-4" />
                            </TransactionToolbarIconButton>
                        </>
                    }
                    menuButton={{
                        label: config.table.settingsLabel,
                        icon: <CogIcon className="h-4 w-4" />,
                        items: config.table.settingsMenu,
                        widthClassName: 'w-[190px]',
                    }}
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
                    <div className="min-w-[1180px]">
                        <DataTable wrapperClassName="border-[#d1d8e4]">
                            <DataTableHeader className="bg-[#5f7690]">
                                <tr>
                                    {config.table.columns.map((column) => (
                                        <DataTableHead
                                            key={column.id}
                                            className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${
                                                column.align === 'right' ? 'text-right' : 'text-left'
                                            }`.trim()}
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
                                                    label: row.documentNumber,
                                                    tabLabel: row.documentNumber,
                                                })
                                            }
                                        >
                                            {config.table.columns.map((column) => (
                                                <DataTableCell
                                                    key={column.id}
                                                    className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-3 text-[15px] text-[#131a28]`.trim()}
                                                >
                                                    <span className="block truncate">
                                                        {formatTableTextValue(row[column.id])}
                                                    </span>
                                                </DataTableCell>
                                            ))}
                                        </DataTableRow>
                                    ))
                                ) : (
                                    <DataTableRow className="bg-white">
                                        <DataTableCell
                                            colSpan={config.table.columns.length}
                                            className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                                        >
                                            {config.table.emptyLabel}
                                        </DataTableCell>
                                    </DataTableRow>
                                )}
                            </DataTableBody>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ExpenseEntryView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = page.expenseEntry;

    return mode === 'table' ? (
        <ExpenseEntryTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <ExpenseFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
