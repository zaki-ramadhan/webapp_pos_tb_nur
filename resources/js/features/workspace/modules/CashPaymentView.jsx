import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    buildCurrencyValue,
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionHeaderButton,
    TransactionLineItemsSection,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CloseIcon,
    CogIcon,
    DownloadIcon,
    FunnelIcon,
    LinkIcon,
    PlusIcon,
    PrintIcon,
    SearchIcon,
    SortIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

function buildDetailRecordFromRow(row = {}, config) {
    const amount = row.amount ?? '0';
    const bank = row.cashBankFull ?? row.cashBank ?? '';
    const branch = row.branch ?? 'JAKARTA';

    return {
        bankAccounts: bank ? [bank] : [],
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? '',
        documentNumber: row.number ?? '',
        checkNumber: row.checkNumber ?? '',
        recipient: row.recipient ?? '',
        voided: row.voided ?? false,
        branches: branch ? [branch] : [],
        notes: row.description ?? '',
        lineLookup: '',
        lineItems: row.lineItems ?? [
            {
                id: `${row.id}-line-1`,
                accountCode: row.accountCode ?? '215.000-02',
                accountName: row.accountName ?? row.description ?? '',
                amount,
            },
        ],
        totalValue: buildCurrencyValue(amount),
        saveTone: 'muted',
        kapNumber: row.kapNumber ?? '',
        kjsNumber: row.kjsNumber ?? '',
        ntpn: row.ntpn ?? '',
        reconcileStatus: row.reconcileStatus ?? 'Belum',
        printStatus: row.printStatus ?? 'Belum cetak/email',
    };
}

function buildFormState(source = {}, config) {
    return {
        bankAccounts: [...(source.bankAccounts ?? config.draft?.bankAccounts ?? [])],
        entryDate: source.entryDate ?? config.draft?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.draft?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.draft?.numberingType ?? '',
        documentNumber: source.documentNumber ?? config.draft?.documentNumber ?? '',
        checkNumber: source.checkNumber ?? config.draft?.checkNumber ?? '',
        recipient: source.recipient ?? config.draft?.recipient ?? '',
        voided: source.voided ?? config.draft?.voided ?? false,
        branches: [...(source.branches ?? config.draft?.branches ?? [])],
        notes: source.notes ?? config.draft?.notes ?? '',
        lineLookup: source.lineLookup ?? '',
        lineItems: [...(source.lineItems ?? config.draft?.lineItems ?? [])],
        totalValue: source.totalValue ?? config.draft?.totalValue ?? '0',
        saveTone: source.saveTone ?? config.draft?.saveTone ?? 'primary',
        kapNumber: source.kapNumber ?? config.draft?.kapNumber ?? '',
        kjsNumber: source.kjsNumber ?? config.draft?.kjsNumber ?? '',
        ntpn: source.ntpn ?? config.draft?.ntpn ?? '',
        reconcileStatus: source.reconcileStatus ?? config.draft?.reconcileStatus ?? '',
        printStatus: source.printStatus ?? config.draft?.printStatus ?? '',
    };
}

function PaymentLineItemsSection({ config, values }) {
    const detailTitle = values.lineItems.length
        ? `${values.lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    return (
        <TransactionLineItemsSection
            searchValue={values.lineLookup}
            onSearchChange={() => {}}
            searchReadOnly
            searchPlaceholder={config.lineSearchPlaceholder}
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            spacerCellContent={
                <span className="inline-flex items-center justify-center text-[#a8afbe]">
                    <TableActionIcon className="h-4 w-4" />
                </span>
            }
            emptyLeadingCellContent={
                <span className="inline-flex items-center justify-center">
                    <TableActionIcon className="h-4 w-4" />
                </span>
            }
        />
    );
}

function PaymentInfoSection({ config, values, isDetail }) {
    return (
        <div className="min-h-[540px]">
            <div className={`grid gap-8 ${isDetail ? 'xl:grid-cols-2' : ''}`.trim()}>
                <section className="min-w-0">
                    <TransactionSectionHeading title={config.infoTitle} icon="document" />

                    <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.checkNumber} />
                        <div className="max-w-[276px]">
                            <TextInput
                                value={values.checkNumber}
                                readOnly
                                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </div>

                        <TransactionFieldLabel label={config.labels.recipient} />
                        <TransactionReadonlyTextarea value={values.recipient} className="min-h-[56px]" />

                        {isDetail ? (
                            <>
                                <TransactionFieldLabel label={config.labels.voided} />
                                <label className="inline-flex h-[34px] items-center gap-2 text-[17px] text-[#1f2436]">
                                    <input
                                        type="checkbox"
                                        checked={values.voided}
                                        readOnly
                                        className="h-[24px] w-[24px] rounded-[4px] border border-[#cfd6e2]"
                                    />
                                    <span>Ya</span>
                                </label>
                            </>
                        ) : null}

                        <TransactionFieldLabel label={config.labels.branch} required />
                        <ChipLookupField
                            values={values.branches}
                            placeholder={config.branchPlaceholder}
                            onRemove={() => {}}
                            searchLabel="Cari cabang"
                        />

                        <TransactionFieldLabel label={config.labels.notes} />
                        <TransactionReadonlyTextarea value={values.notes} rows={4} className="min-h-[70px]" />

                        {isDetail ? (
                            <>
                                <TransactionFieldLabel label={config.labels.reconcileStatus} />
                                <div className="pt-1 text-[17px] italic text-[#1f2436]">{values.reconcileStatus}</div>

                                <TransactionFieldLabel label={config.labels.printStatus} />
                                <TextInput
                                    value={values.printStatus}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#5f6779]"
                                />
                            </>
                        ) : null}
                    </div>
                </section>

                {isDetail ? (
                    <section className="min-w-0">
                        <TransactionSectionHeading title={config.additionalInfoTitle} icon="payment" />

                        <div className="mt-4 grid gap-y-4 sm:grid-cols-[250px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.kapKjs} />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextInput
                                    value={values.kapNumber}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />
                                <TextInput
                                    value={values.kjsNumber}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />
                            </div>

                            <TransactionFieldLabel label={config.labels.ntpn} />
                            <TextInput
                                value={values.ntpn}
                                readOnly
                                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                            />
                        </div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}

function CashPaymentFormView({ config, activeLevel2Tab }) {
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
                <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                    <div className="grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.cashBank} required />
                        <ChipLookupField
                            values={values.bankAccounts}
                            placeholder={config.cashBankPlaceholder}
                            onRemove={() => {}}
                            searchLabel="Cari kas atau bank"
                        />

                        <TransactionFieldLabel label={config.labels.entryDate} required />
                        <TransactionDateInput value={values.entryDate} className="w-full max-w-[238px]" />
                    </div>

                    <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <div className="flex items-center justify-start gap-4 sm:justify-end">
                            <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
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

                        <div />
                        <div className="flex justify-end">
                            <TransactionHeaderButton label={config.takeButtonLabel} trailingChevron />
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
                <PaymentInfoSection config={config} values={values} isDetail={Boolean(activeRecordId)} />
            ) : (
                <PaymentLineItemsSection config={config} values={values} />
            )}
        </TransactionFormLayout>
    );
}

function PaymentTableFilterBar({ table, filters, setFilters }) {
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

function CashPaymentTableView({ config, onCreate, onOpenDetail }) {
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

            return [row.number, row.date, row.cashBank, row.checkNumber, row.description, row.amount].some((value) =>
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
                filters={<PaymentTableFilterBar table={config.table} filters={filters} setFilters={setFilters} />}
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
                            label={config.table.downloadLabel}
                            icon={<DownloadIcon className="h-4 w-4" />}
                            items={config.table.downloadItems}
                        />
                        <TransactionToolbarIconButton label={config.table.printLabel}>
                            <PrintIcon className="h-4 w-4" />
                        </TransactionToolbarIconButton>
                        <TransactionToolbarSplitButton
                            label={config.table.settingsLabel}
                            icon={<CogIcon className="h-4 w-4" />}
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
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={filteredRows}
                    emptyLabel="Belum ada data"
                    minWidthClassName="min-w-[1380px]"
                    onRowClick={(row) =>
                        onOpenDetail?.({
                            recordId: row.id,
                            label: row.number,
                            tabLabel: row.number,
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
                />
            </div>
        </div>
    );
}

export default function CashPaymentView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => ({
            ...page.cashPayment,
            rowMap: (page.cashPayment.table?.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [page.cashPayment],
    );

    return mode === 'table' ? (
        <CashPaymentTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <CashPaymentFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
