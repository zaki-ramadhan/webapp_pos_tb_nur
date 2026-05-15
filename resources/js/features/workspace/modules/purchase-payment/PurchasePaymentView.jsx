import { useEffect, useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { buildPurchasePaymentConfig, buildPurchasePaymentRecord } from './purchasePaymentConfig';
import PurchasePaymentInvoiceModal from '@/features/workspace/modules/shared/PurchasePaymentInvoiceModal';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionDualTotalCard,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
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

function buildFormState(source = {}, config) {
    return {
        payee: [...(source.payee ?? config.draft?.payee ?? [])],
        bankAccounts: [...(source.bankAccounts ?? config.draft?.bankAccounts ?? [])],
        paymentAmount: source.paymentAmount ?? config.draft?.paymentAmount ?? '',
        paymentAmountPrefix: source.paymentAmountPrefix ?? config.draft?.paymentAmountPrefix ?? '',
        paymentAmountDisplay: source.paymentAmountDisplay ?? config.draft?.paymentAmountDisplay ?? '0',
        entryDate: source.entryDate ?? config.draft?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.draft?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.draft?.numberingType ?? '',
        documentNumber: source.documentNumber ?? config.draft?.documentNumber ?? '',
        currency: source.currency ?? config.draft?.currency ?? '',
        invoiceSearch: source.invoiceSearch ?? config.draft?.invoiceSearch ?? '',
        invoices: [...(source.invoices ?? config.draft?.invoices ?? [])],
        invoiceTitle: source.invoiceTitle ?? config.draft?.invoiceTitle ?? 'Faktur',
        paymentMethod: source.paymentMethod ?? config.draft?.paymentMethod ?? 'Tunai',
        dueDatePph: source.dueDatePph ?? config.draft?.dueDatePph ?? '',
        notes: source.notes ?? config.draft?.notes ?? '',
        voided: source.voided ?? config.draft?.voided ?? false,
        branches: [...(source.branches ?? config.draft?.branches ?? [])],
        reconcileStatus: source.reconcileStatus ?? config.draft?.reconcileStatus ?? '',
        printStatus: source.printStatus ?? config.draft?.printStatus ?? '',
        paidWith: source.paidWith ?? config.draft?.paidWith ?? '',
        paidAt: source.paidAt ?? config.draft?.paidAt ?? '',
        footerPaymentValue: source.footerPaymentValue ?? config.draft?.footerPaymentValue ?? '0',
        footerInvoiceValue: source.footerInvoiceValue ?? config.draft?.footerInvoiceValue ?? '0',
        showSecondaryAmountButton: source.showSecondaryAmountButton ?? config.draft?.showSecondaryAmountButton ?? true,
        modal: source.modal ?? config.draft?.modal ?? null,
        dockActions: source.dockActions ?? config.draft?.dockActions ?? [],
    };
}

function PurchasePaymentAmountField({ values }) {
    return (
        <TextInput
            value={values.paymentAmountDisplay}
            readOnly
            prefix={values.paymentAmountPrefix || undefined}
            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
            prefixClassName="min-w-[42px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
            inputClassName="text-right text-[15px] text-[#1f2436]"
        />
    );
}

function PurchasePaymentHeaderIconButton({ label, icon }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className="inline-flex h-[36px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
        >
            {icon}
        </button>
    );
}

function PurchasePaymentDetailsSection({ config, values, isDetail, onOpenInvoice }) {
    return (
        <div className="flex min-h-[540px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1 sm:max-w-[560px]">
                        <TextInput
                            value={values.invoiceSearch}
                            readOnly
                            placeholder={config.invoiceSearchPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>

                    {isDetail ? (
                        <button
                            type="button"
                            className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-5 text-[15px] text-[#21539b]"
                        >
                            {config.takeButtonLabel}
                        </button>
                    ) : null}
                </div>

                <div className="flex items-center justify-end gap-3">
                    <PurchasePaymentHeaderIconButton label="Cari faktur" icon={<SearchIcon className="h-5 w-5" />} />
                    <div className="text-right text-[24px] font-normal text-[#1f2436]">
                        {values.invoiceTitle} <span className="text-[#ED3969]">*</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.invoiceTable.columns}
                    rows={values.invoices}
                    emptyLabel={config.invoiceTable.emptyLabel}
                    minWidthClassName={config.invoiceTable.minWidthClassName ?? 'min-w-[1080px]'}
                    emptyLeadingCellContent={
                        <span className="inline-flex items-center justify-center">
                            <TableActionIcon className="h-4 w-4" />
                        </span>
                    }
                    onRowClick={onOpenInvoice}
                    getRowClassName={() => 'cursor-pointer transition hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) => (column.kind === 'spacer' ? '' : column.label)}
                    renderCell={({ row, column }) =>
                        column.kind === 'spacer' ? (
                            <span className="inline-flex items-center justify-center text-[#a8afbe]">
                                <TableActionIcon className="h-4 w-4" />
                            </span>
                        ) : (
                            formatTableTextValue(row[column.id])
                        )
                    }
                />
            </div>
        </div>
    );
}

function PurchasePaymentAdditionalInfoSection({ config, values, isDetail }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.infoTitle} icon="document" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.paymentMethod} />
                <div className="max-w-[276px]">
                    <SelectField value={values.paymentMethod} onChange={() => {}} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                        <option value={values.paymentMethod}>{values.paymentMethod || 'Tunai'}</option>
                    </SelectField>
                </div>

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.dueDatePph} />
                        <TransactionDateInput value={values.dueDatePph} className="max-w-[276px]" />
                    </>
                ) : null}

                <TransactionFieldLabel label={config.labels.notes} />
                <TransactionReadonlyTextarea value={values.notes} rows={3} className="min-h-[70px]" />

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
                <ChipLookupField values={values.branches} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari cabang" heightClassName="h-[34px]" />

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.reconcileStatus} />
                        <div className="pt-1 text-[17px] italic text-[#1f2436]">{values.reconcileStatus}</div>

                        <TransactionFieldLabel label={config.labels.printStatus} />
                        <TextInput
                            value={values.printStatus}
                            readOnly
                            className="h-[34px] max-w-[262px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#5f6779]"
                        />
                    </>
                ) : null}
            </div>
        </div>
    );
}

function PurchasePaymentInfoSection({ config, values }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.paymentInfoTitle} icon="payment" />

            <div className="mt-4 grid gap-y-3 sm:grid-cols-[260px_minmax(0,1fr)] sm:gap-x-4">
                <TransactionFieldLabel label="Dibayar dengan" />
                <div className="text-[17px] text-[#1f2436]">{values.paidWith || '-'}</div>

                <TransactionFieldLabel label="Tanggal dan Jam" />
                <div className="text-[17px] text-[#1f2436]">{values.paidAt || '-'}</div>
            </div>
        </div>
    );
}

function PurchasePaymentFormView({ pageId, config, activeLevel2Tab }) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.draft;
        }

        return buildPurchasePaymentRecord(config.rowMap?.[activeRecordId] ?? { id: activeRecordId }, config);
    }, [activeRecordId, config]);
    const isDetail = Boolean(activeRecordId);
    const sectionTabs = isDetail ? config.detailSectionTabs : config.sectionTabs;
    const [activeSectionId, setActiveSectionId] = useState(sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildFormState(sourceRecord, config));
    const [activeInvoice, setActiveInvoice] = useState(null);

    useEffect(() => {
        setActiveSectionId((isDetail ? config.detailSectionTabs : config.sectionTabs)?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord, config));
        setActiveInvoice(null);
    }, [config, isDetail, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            payee: sourceRecord.payee ?? config.draft?.payee ?? [],
            bankAccounts: sourceRecord.bankAccounts ?? config.draft?.bankAccounts ?? [],
            entryDate: sourceRecord.entryDate ?? config.draft?.entryDate ?? '',
            autoNumber: sourceRecord.autoNumber ?? config.draft?.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? config.draft?.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? config.draft?.documentNumber ?? '',
            invoices: sourceRecord.invoices ?? config.draft?.invoices ?? [],
            branches: sourceRecord.branches ?? config.draft?.branches ?? [],
            notes: sourceRecord.notes ?? config.draft?.notes ?? '',
        }),
        [config.draft, sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            payee: values.payee,
            bankAccounts: values.bankAccounts,
            entryDate: values.entryDate,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            invoices: values.invoices,
            branches: values.branches,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.payee, type: 'array', value: values.payee },
                    { label: config.labels.bank, type: 'array', value: values.bankAccounts },
                    {
                        label: config.labels.documentNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                    { label: config.labels.entryDate, value: values.entryDate },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.bank,
            config.labels.branch,
            config.labels.documentNumber,
            config.labels.entryDate,
            config.labels.payee,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.bankAccounts,
            values.branches,
            values.documentNumber,
            values.entryDate,
            values.numberingType,
            values.payee,
        ],
    );

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? config.draft?.dockActions ?? [])
                .filter((action) => (isDetail ? true : action.id !== 'delete'))
                .map((action) =>
                    action.id === 'save' && !isDetail
                        ? { ...action, tone: 'primary', disabled: saveDisabled }
                        : action,
                ),
        [config.draft?.dockActions, isDetail, saveDisabled, values.dockActions],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    return (
        <>
            <TransactionFormLayout
                header={
                    <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                        <div className="grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.payee} required />
                            <ChipLookupField values={values.payee} placeholder={config.payeePlaceholder} onRemove={() => {}} searchLabel="Cari pemasok" />

                            <TransactionFieldLabel label={config.labels.bank} required />
                            <ChipLookupField values={values.bankAccounts} placeholder={config.bankPlaceholder} onRemove={() => {}} searchLabel="Cari bank" />

                            <TransactionFieldLabel label={config.labels.paymentAmount} />
                            <div className="flex max-w-[390px] items-center gap-3">
                                <div className="min-w-0 flex-1">
                                    <PurchasePaymentAmountField values={values} />
                                </div>
                                <PurchasePaymentHeaderIconButton label="Hitung ulang" icon={<LinkIcon className="h-4.5 w-4.5" />} />
                                {values.showSecondaryAmountButton ? (
                                    <PurchasePaymentHeaderIconButton label="Lihat ringkasan" icon={<TableActionIcon className="h-4.5 w-4.5" />} />
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            {!isDetail && values.currency ? <div /> : null}
                            {isDetail && values.currency ? (
                                <>
                                    <div />
                                    <div className="max-w-[180px]">
                                        <TextInput
                                            value={values.currency}
                                            readOnly
                                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                            inputClassName="text-[15px] text-[#1f2436]"
                                        />
                                    </div>
                                </>
                            ) : null}

                            <div className="flex items-center justify-start gap-4 sm:justify-end">
                                <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                                {!isDetail ? (
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

                            {!isDetail && values.autoNumber ? (
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

                            <TransactionFieldLabel label={config.labels.entryDate} required className="sm:text-right" />
                            <TransactionDateInput
                                value={values.entryDate}
                                onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                                className="max-w-[238px]"
                            />
                        </div>
                    </div>
                }
                sectionTabs={sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={
                    <TransactionDualTotalCard
                        items={[
                            { label: 'Nilai Pembayaran', value: values.footerPaymentValue },
                            { label: 'Faktur Dibayar', value: values.footerInvoiceValue },
                        ]}
                    />
                }
                dockActions={dockActions}
            >
                {activeSectionId === 'additional-info' ? (
                    <PurchasePaymentAdditionalInfoSection config={config} values={values} isDetail={isDetail} />
                ) : activeSectionId === 'payment-info' ? (
                    <PurchasePaymentInfoSection config={config} values={values} />
                ) : (
                    <PurchasePaymentDetailsSection
                        config={config}
                        values={values}
                        isDetail={isDetail}
                        onOpenInvoice={setActiveInvoice}
                    />
                )}
            </TransactionFormLayout>

            <PurchasePaymentInvoiceModal
                open={Boolean(activeInvoice)}
                onClose={() => setActiveInvoice(null)}
                modal={values.modal}
                invoice={activeInvoice}
            />
        </>
    );
}

function PurchasePaymentTableFilterBar({ table, filters, setFilters }) {
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

function PurchasePaymentTableView({ config, onCreate, onOpenDetail }) {
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

            return [
                row.number,
                row.date,
                row.checkNumber,
                row.checkDate,
                row.supplier,
                row.bank,
                row.notes,
                row.paymentAmount,
            ].some((value) =>
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
                filters={<PurchasePaymentTableFilterBar table={config.table} filters={filters} setFilters={setFilters} />}
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
                            label="Unduh"
                            icon={<DownloadIcon className="h-4 w-4" />}
                            items={config.table.downloadItems}
                        />
                        <TransactionToolbarIconButton label="Cetak">
                            <PrintIcon className="h-4 w-4" />
                        </TransactionToolbarIconButton>
                        <TransactionToolbarSplitButton
                            label="Pengaturan tabel"
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
                    minWidthClassName="min-w-[1440px]"
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

export default function PurchasePaymentView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = useMemo(
        () => ({
            ...buildPurchasePaymentConfig(page.purchasePayment),
            rowMap: (page.purchasePayment?.table?.rows ?? []).reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        }),
        [page.purchasePayment],
    );

    return mode === 'table' ? (
        <PurchasePaymentTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <PurchasePaymentFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
