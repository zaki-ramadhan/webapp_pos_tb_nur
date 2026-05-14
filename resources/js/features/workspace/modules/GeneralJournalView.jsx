import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    buildCurrencyValue,
    TransactionDataTable,
    TransactionDateInput,
    TransactionDualTotalCard,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionHeaderButton,
    TransactionLineItemsSection,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
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

const JOURNAL_LINE_PRESETS = {
    'sales-receipt': [
        ['111.102-01', 'Bank BCA IDR Jakarta (069-773-3993)', 'debit'],
        ['112.101-01', 'Piutang Usaha Jakarta - IDR', 'credit'],
    ],
    'sales-invoice': [
        ['112.101-01', 'Piutang Usaha Jakarta - IDR', 'debit'],
        ['411.100-01', 'Penjualan Produk', 'credit'],
    ],
    'sales-return': [
        ['511.100-01', 'Retur Penjualan', 'debit'],
        ['112.101-01', 'Piutang Usaha Jakarta - IDR', 'credit'],
    ],
    'purchase-payment': [
        ['211.100-01', 'Hutang Usaha Jakarta - IDR', 'debit'],
        ['111.102-01', 'Bank BCA IDR Jakarta (069-773-3993)', 'credit'],
    ],
    'tax-payment': [
        ['213.100-21', 'Hutang Pajak PPh Ps 21', 'debit'],
        ['111.101-02', 'Bank Mandiri Jakarta - IDR', 'credit'],
    ],
    'payroll-entry': [
        ['611.002-01', 'Beban Gaji Umum & Admin', 'debit'],
        ['214.100-01', 'BYMD - Gaji Jakarta', 'credit'],
    ],
    'period-end': [
        ['399.999-01', 'Ikhtisar Laba Rugi', 'debit'],
        ['310.100-01', 'Laba Tahun Berjalan', 'credit'],
    ],
    'purchase-return': [
        ['111.102-01', 'Bank BCA IDR Jakarta (069-773-3993)', 'debit'],
        ['511.200-01', 'Retur Pembelian', 'credit'],
    ],
};

const DEFAULT_JOURNAL_LINE_PRESET = [
    ['111.102-01', 'Bank BCA IDR Jakarta (069-773-3993)', 'debit'],
    ['112.101-01', 'Piutang Usaha Jakarta - IDR', 'credit'],
];

function buildDerivedJournalLines(source = {}) {
    const amount = source.total ?? source.totalValue ?? '0';
    const linePreset = JOURNAL_LINE_PRESETS[source.transactionTypeValue ?? ''] ?? DEFAULT_JOURNAL_LINE_PRESET;

    return linePreset.map(([accountCode, accountName, side], index) => ({
        id: `${source.id}-line-${index + 1}`,
        accountCode,
        accountName,
        debit: side === 'debit' ? amount : '0',
        credit: side === 'credit' ? amount : '0',
    }));
}

function buildRecordFromTableRow(row = {}, config) {
    return {
        id: row.id,
        documentNumber: row.documentNumber ?? '',
        transactionNumber: row.transactionNumber ?? '',
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? 'Jurnal Umum',
        transactionType: row.transactionTypeLabel ?? config.defaults?.transactionType ?? 'Jurnal Umum',
        transactionTypeValue: row.transactionTypeValue ?? 'general-journal',
        branches: row.branches ?? [...(config.defaults?.branches ?? ['JAKARTA'])],
        notes: row.description ?? '',
        lineLookup: '',
        lineItems: buildDerivedJournalLines(row),
        totalDebit: row.totalCurrency ?? buildCurrencyValue(row.total ?? '0'),
        totalCredit: row.totalCurrency ?? buildCurrencyValue(row.total ?? '0'),
        saveTone: 'muted',
    };
}

function buildFormState(source = {}, config) {
    return {
        documentNumber: source.documentNumber ?? '',
        transactionNumber: source.transactionNumber ?? '',
        entryDate: source.entryDate ?? config.defaults?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.defaults?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.defaults?.numberingType ?? '',
        transactionType: source.transactionType ?? config.defaults?.transactionType ?? '',
        transactionTypeValue: source.transactionTypeValue ?? 'general-journal',
        branches: [...(source.branches ?? config.defaults?.branches ?? [])],
        notes: source.notes ?? config.defaults?.notes ?? '',
        lineLookup: source.lineLookup ?? '',
        lineItems: [...(source.lineItems ?? [])],
        totalDebit: source.totalDebit ?? config.defaults?.totalDebit ?? 'Rp 0',
        totalCredit: source.totalCredit ?? config.defaults?.totalCredit ?? 'Rp 0',
        saveTone: source.saveTone ?? 'muted',
    };
}

function JournalLinesSection({ config, values, setValues }) {
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
            searchInput={
                <AccountLookupTextInput
                    value={values.lineLookup}
                    placeholder={config.lineSearchPlaceholder}
                    searchLabel="Cari akun jurnal"
                    dialogTitle="Pilih Akun Jurnal"
                    onSelectAccount={(_, label) =>
                        setValues((current) => ({
                            ...current,
                            lineLookup: label,
                        }))
                    }
                />
            }
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            minWidthClassName="min-w-[820px]"
            showTitleSearchButton
            spacerHeaderContent={
                <span className="flex justify-center">
                    <SortIcon className="h-3 w-3 text-white/55" />
                </span>
            }
        />
    );
}

function JournalAdditionalInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[250px_minmax(0,570px)] lg:items-start">
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

function GeneralJournalFormView({ config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.defaults;
        }

        return config.records?.[activeRecordId] ?? buildRecordFromTableRow(config.rowMap?.[activeRecordId], config);
    }, [activeRecordId, config]);
    const [values, setValues] = useState(() => buildFormState(sourceRecord, config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord, config));
    }, [config, sourceRecord]);

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => (activeRecordId ? true : action.id !== 'delete'))
                .map((action) =>
                    action.id === 'save'
                        ? {
                              ...action,
                              tone: values.saveTone,
                          }
                        : action,
                ),
        [activeRecordId, config.dockActions, values.saveTone],
    );

    return (
        <TransactionFormLayout
            header={
                <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
                    <div className="grid gap-y-3 sm:grid-cols-[250px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.entryDate} required />
                        <TransactionDateInput value={values.entryDate} className="w-full max-w-full" />

                        <TransactionFieldLabel label={config.labels.transactionType} />
                        <TextInput
                            value={values.transactionType}
                            readOnly
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>

                    <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <div className="flex items-center gap-4">
                            <TransactionFieldLabel label={config.labels.documentNumber} required />
                            {!activeRecordId ? (
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

                        {values.transactionNumber ? (
                            <TransactionFieldLabel label={config.labels.transactionNumber} />
                        ) : (
                            <div />
                        )}
                        {values.transactionNumber ? (
                            <TextInput
                                value={values.transactionNumber}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#96d86d] bg-[#eef9e4]"
                                inputClassName="text-[15px] font-medium text-[#53a11f]"
                            />
                        ) : (
                            <div className="flex justify-end">
                                <TransactionHeaderButton label={config.takeButtonLabel} trailingChevron />
                            </div>
                        )}
                    </div>
                </div>
            }
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            footer={
                <TransactionDualTotalCard
                    items={[
                        { label: config.totalLabels.debit, value: values.totalDebit },
                        { label: config.totalLabels.credit, value: values.totalCredit },
                    ]}
                />
            }
            dockActions={dockActions}
        >
            {activeSectionId === 'additional-info' ? (
                <JournalAdditionalInfoSection config={config} values={values} setValues={setValues} />
            ) : (
                <JournalLinesSection config={config} values={values} setValues={setValues} />
            )}
        </TransactionFormLayout>
    );
}

function JournalTableFilters({ table, filters, setFilters }) {
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

function GeneralJournalTableView({ config, onCreate, onOpenDetail }) {
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
                    filters={<JournalTableFilters table={config.table} filters={filters} setFilters={setFilters} />}
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
                    <TransactionDataTable
                        columns={config.table.columns}
                        rows={filteredRows}
                        emptyLabel="Belum ada data"
                        minWidthClassName="min-w-[1320px]"
                        onRowClick={(row) =>
                            onOpenDetail?.({
                                recordId: row.id,
                                label: row.documentNumber,
                                tabLabel: row.documentNumber,
                            })
                        }
                        getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                        renderHeaderCell={(column) => (
                            <span
                                className={`flex items-center gap-2 ${
                                    column.align === 'right' ? 'justify-end' : 'justify-start'
                                }`.trim()}
                            >
                                <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                <span>{column.label}</span>
                            </span>
                        )}
                        renderCell={({ row, column }) => (
                            <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

export default function GeneralJournalView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => ({
            ...page.generalJournal,
            rowMap: (page.generalJournal.table?.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [page.generalJournal],
    );

    return mode === 'table' ? (
        <GeneralJournalTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <GeneralJournalFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
