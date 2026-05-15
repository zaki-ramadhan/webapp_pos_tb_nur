import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import {
    CogIcon,
    DownloadIcon,
    FunnelIcon,
    LinkIcon,
    PlusIcon,
    PrintIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

function buildDetailRecordFromRow(row = {}, config) {
    return {
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? '',
        documentNumber: row.number ?? '',
        fromBankAccounts: row.fromBankFull ? [row.fromBankFull] : [],
        fromBranches: row.fromBranch ? [row.fromBranch] : ['JAKARTA'],
        exchangeRate: row.exchangeRate ?? '',
        exchangeRateLabel: row.exchangeRateLabel ?? '',
        transferValue: row.transferValue ?? '',
        transferPrefix: row.transferPrefix ?? '',
        transferWords: row.transferWords ?? '',
        toBankAccounts: row.toBankFull ? [row.toBankFull] : [],
        toBranches: row.toBranch ? [row.toBranch] : ['JAKARTA'],
        resultValue: row.resultValue ?? '',
        resultPrefix: row.resultPrefix ?? '',
        resultWords: row.resultWords ?? '',
        notes: row.description ?? '',
        feeLookup: '',
        feeRows: row.feeRows ?? [],
        fromTotalLabel: row.fromTotalLabel ?? config.draft?.fromTotalLabel ?? 'Total',
        fromTotalValue: row.fromTotalValue ?? '0',
        toTotalLabel: row.toTotalLabel ?? config.draft?.toTotalLabel ?? 'Total',
        toTotalValue: row.toTotalValue ?? '0',
        saveTone: 'muted',
        reconciliations: row.reconciliations ?? [],
    };
}

function buildFormState(source = {}, config) {
    return {
        entryDate: source.entryDate ?? config.draft?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.draft?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.draft?.numberingType ?? '',
        documentNumber: source.documentNumber ?? config.draft?.documentNumber ?? '',
        fromBankAccounts: [...(source.fromBankAccounts ?? config.draft?.fromBankAccounts ?? [])],
        fromBranches: [...(source.fromBranches ?? config.draft?.fromBranches ?? [])],
        exchangeRate: source.exchangeRate ?? config.draft?.exchangeRate ?? '',
        exchangeRateLabel: source.exchangeRateLabel ?? config.draft?.exchangeRateLabel ?? '',
        transferValue: source.transferValue ?? config.draft?.transferValue ?? '',
        transferPrefix: source.transferPrefix ?? config.draft?.transferPrefix ?? '',
        transferWords: source.transferWords ?? config.draft?.transferWords ?? '',
        toBankAccounts: [...(source.toBankAccounts ?? config.draft?.toBankAccounts ?? [])],
        toBranches: [...(source.toBranches ?? config.draft?.toBranches ?? [])],
        resultValue: source.resultValue ?? config.draft?.resultValue ?? '',
        resultPrefix: source.resultPrefix ?? config.draft?.resultPrefix ?? '',
        resultWords: source.resultWords ?? config.draft?.resultWords ?? '',
        notes: source.notes ?? config.draft?.notes ?? '',
        feeLookup: source.feeLookup ?? '',
        feeRows: [...(source.feeRows ?? config.draft?.feeRows ?? [])],
        fromTotalLabel: source.fromTotalLabel ?? config.draft?.fromTotalLabel ?? 'Total',
        fromTotalValue: source.fromTotalValue ?? config.draft?.fromTotalValue ?? '0',
        toTotalLabel: source.toTotalLabel ?? config.draft?.toTotalLabel ?? 'Total',
        toTotalValue: source.toTotalValue ?? config.draft?.toTotalValue ?? '0',
        saveTone: source.saveTone ?? config.draft?.saveTone ?? 'primary',
        reconciliations: [...(source.reconciliations ?? config.draft?.reconciliations ?? [])],
    };
}

function TransferValueInput({ prefix, value, maxWidthClassName = 'max-w-[276px]' }) {
    return (
        <div className={maxWidthClassName}>
            <TextInput
                value={value}
                readOnly
                prefix={prefix}
                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                prefixClassName="min-w-[42px] justify-center border-r-[#d8dde7] bg-[#fbfcfe] px-2 text-[15px] text-[#9097aa]"
                inputClassName="text-right text-[15px] text-[#1f2436]"
            />
        </div>
    );
}

function TransferMoneySection({ config, values, isDetail }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.transferTitle} icon="document" />

            <div className="mt-4 grid gap-10 xl:grid-cols-2">
                <section className="grid gap-y-4 sm:grid-cols-[280px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.fromBank} required />
                    <ChipLookupField values={values.fromBankAccounts} placeholder={config.bankPlaceholder} onRemove={() => {}} searchLabel="Cari kas bank asal" />

                    <TransactionFieldLabel label={config.labels.fromBranch} required />
                    <ChipLookupField values={values.fromBranches} placeholder={config.branchPlaceholder} onRemove={() => {}} searchLabel="Cari cabang asal" />

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.exchangeRate} />
                            <div className="max-w-[276px]">
                                <div className="mb-1 text-[15px] text-[#1f2436]">{values.exchangeRateLabel}</div>
                                <TransferValueInput prefix="Rp" value={values.exchangeRate} />
                            </div>
                        </>
                    ) : null}

                    <TransactionFieldLabel label={config.labels.transferValue} required />
                    <div className="max-w-[276px]">
                        <TransferValueInput prefix={values.transferPrefix} value={values.transferValue} maxWidthClassName="" />
                    </div>

                    {isDetail ? (
                        <>
                            <div />
                            <div className="text-[17px] italic text-[#1f2436]">{values.transferWords}</div>
                        </>
                    ) : null}
                </section>

                <section className="grid gap-y-4 sm:grid-cols-[280px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.toBank} required />
                    <ChipLookupField values={values.toBankAccounts} placeholder={config.bankPlaceholder} onRemove={() => {}} searchLabel="Cari kas bank tujuan" />

                    <TransactionFieldLabel label={config.labels.toBranch} required />
                    <ChipLookupField values={values.toBranches} placeholder={config.branchPlaceholder} onRemove={() => {}} searchLabel="Cari cabang tujuan" />

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.resultValue} required />
                            <TransferValueInput prefix={values.resultPrefix} value={values.resultValue} />

                            <div />
                            <div className="text-[17px] italic text-[#1f2436]">{values.resultWords}</div>
                        </>
                    ) : null}
                </section>
            </div>
        </div>
    );
}

function TransferFeeSection({ config, values }) {
    return (
        <div className="flex min-h-[540px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[560px]">
                    <TextInput
                        value={values.feeLookup}
                        readOnly
                        placeholder={config.feeLookupPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <div className="text-right text-[24px] font-normal text-[#1f2436]">{config.feeTitle}</div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.feeTable.columns}
                    rows={values.feeRows}
                    emptyLabel={config.feeTable.emptyLabel}
                    minWidthClassName="min-w-[880px]"
                />
            </div>
        </div>
    );
}

function TransferInfoSection({ config, values, isDetail }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.infoTitle} icon="receipt" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.notes} />
                <TransactionReadonlyTextarea value={values.notes} rows={4} className="min-h-[70px]" />

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.reconcileStatus} />
                        <div className="space-y-4 pt-1">
                            {values.reconciliations.map((item) => (
                                <div key={item.id} className="grid gap-1 sm:grid-cols-[220px_1fr]">
                                    <div className="text-[17px] text-[#1f2436]">{item.bank}</div>
                                    <div className="text-[17px] text-[#1f2436]">
                                        <span className="italic">{item.status}</span>
                                        {item.date ? <span className="ml-8">{item.date}</span> : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

function TransferSummaryCards({ values }) {
    return (
        <div className="grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] sm:grid-cols-2">
            <TransactionTotalCard label={values.fromTotalLabel} value={values.fromTotalValue} className="max-w-none rounded-none border-0 shadow-none sm:border-r sm:border-r-[#d8dde7]" />
            <TransactionTotalCard label={values.toTotalLabel} value={values.toTotalValue} className="max-w-none rounded-none border-0 shadow-none" />
        </div>
    );
}

function BankTransferFormView({ pageId, config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.draft;
        }

        return config.detailRecords?.[activeRecordId] ?? buildDetailRecordFromRow(config.rowMap?.[activeRecordId], config);
    }, [activeRecordId, config]);
    const [values, setValues] = useState(() => buildFormState(sourceRecord, config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord, config));
    }, [config, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            entryDate: sourceRecord.entryDate ?? config.draft?.entryDate ?? '',
            autoNumber: sourceRecord.autoNumber ?? config.draft?.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? config.draft?.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? config.draft?.documentNumber ?? '',
            fromBankAccounts: sourceRecord.fromBankAccounts ?? config.draft?.fromBankAccounts ?? [],
            fromBranches: sourceRecord.fromBranches ?? config.draft?.fromBranches ?? [],
            transferValue: sourceRecord.transferValue ?? config.draft?.transferValue ?? '',
            toBankAccounts: sourceRecord.toBankAccounts ?? config.draft?.toBankAccounts ?? [],
            toBranches: sourceRecord.toBranches ?? config.draft?.toBranches ?? [],
            notes: sourceRecord.notes ?? config.draft?.notes ?? '',
        }),
        [config.draft, sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            entryDate: values.entryDate,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            fromBankAccounts: values.fromBankAccounts,
            fromBranches: values.fromBranches,
            transferValue: values.transferValue,
            toBankAccounts: values.toBankAccounts,
            toBranches: values.toBranches,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.entryDate, value: values.entryDate },
                    {
                        label: config.labels.documentNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                    { label: config.labels.fromBank, type: 'array', value: values.fromBankAccounts },
                    { label: config.labels.fromBranch, type: 'array', value: values.fromBranches },
                    { label: config.labels.transferValue, value: values.transferValue },
                    { label: config.labels.toBank, type: 'array', value: values.toBankAccounts },
                    { label: config.labels.toBranch, type: 'array', value: values.toBranches },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.documentNumber,
            config.labels.entryDate,
            config.labels.fromBank,
            config.labels.fromBranch,
            config.labels.toBank,
            config.labels.toBranch,
            config.labels.transferValue,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.documentNumber,
            values.entryDate,
            values.fromBankAccounts,
            values.fromBranches,
            values.numberingType,
            values.toBankAccounts,
            values.toBranches,
            values.transferValue,
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
            (config.dockActions ?? [])
                .filter((action) => (activeRecordId ? true : !['delete', 'more'].includes(action.id)))
                .map((action) =>
                    action.id === 'save'
                        ? { ...action, tone: values.saveTone, disabled: saveDisabled }
                        : action,
                ),
        [activeRecordId, config.dockActions, saveDisabled, values.saveTone],
    );

    return (
        <TransactionFormLayout
            header={
                <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                    <div className="grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.entryDate} required />
                        <TransactionDateInput
                            value={values.entryDate}
                            onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                            className="max-w-[296px]"
                        />
                    </div>

                    <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <div className="flex items-center justify-start gap-4 sm:justify-end">
                            <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                            {!activeRecordId ? (
                                <TransactionSwitch
                                    checked={values.autoNumber}
                                    onChange={(nextChecked) => setValues((current) => ({ ...current, autoNumber: nextChecked }))}
                                />
                            ) : null}
                        </div>

                        {values.autoNumber ? (
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
                        ) : (
                            <TextInput
                                value={values.documentNumber}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        )}
                    </div>
                </div>
            }
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            footer={<TransferSummaryCards values={values} />}
            dockActions={dockActions}
        >
            {activeSectionId === 'fee' ? (
                <TransferFeeSection config={config} values={values} />
            ) : activeSectionId === 'additional-info' ? (
                <TransferInfoSection config={config} values={values} isDetail={Boolean(activeRecordId)} />
            ) : (
                <TransferMoneySection config={config} values={values} isDetail={Boolean(activeRecordId)} />
            )}
        </TransactionFormLayout>
    );
}

function TransferTableFilterBar({ table, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) => setFilters((current) => ({ ...current, [filter.id]: event.target.value }))}
                    containerClassName="w-auto shrink-0"
                    className="h-[34px] min-w-[126px] rounded-[4px] border-[#cfd6e2]"
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
                className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}

function BankTransferTableView({ config, onCreate, onOpenDetail }) {
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

            return [row.number, row.date, row.fromBank, row.toBank, row.description, row.transferTotal, row.feeTotal].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.filters, config.table.rows, filters, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={<TransferTableFilterBar table={config.table} filters={filters} setFilters={setFilters} />}
                createButton={{ label: config.table.createLabel, onClick: onCreate, icon: <PlusIcon className="h-6 w-6" /> }}
                refreshButton={{ label: config.table.refreshLabel, icon: <LinkIcon className="h-4.5 w-4.5" /> }}
                rightControls={
                    <>
                        <TransactionToolbarSplitButton label={config.table.downloadLabel} icon={<DownloadIcon className="h-4 w-4" />} items={config.table.downloadItems} />
                        <TransactionToolbarIconButton label={config.table.printLabel}>
                            <PrintIcon className="h-4 w-4" />
                        </TransactionToolbarIconButton>
                        <TransactionToolbarSplitButton label={config.table.settingsLabel} icon={<CogIcon className="h-4 w-4" />} items={config.table.settingsItems} />
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
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={filteredRows}
                    emptyLabel="Belum ada data"
                    minWidthClassName="min-w-[1480px]"
                    onRowClick={(row) => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
                    getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-start'}`.trim()}>
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                />
            </div>
        </div>
    );
}

export default function BankTransferView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => ({
            ...page.bankTransfer,
            rowMap: (page.bankTransfer.table?.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [page.bankTransfer],
    );

    return mode === 'table' ? (
        <BankTransferTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <BankTransferFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
