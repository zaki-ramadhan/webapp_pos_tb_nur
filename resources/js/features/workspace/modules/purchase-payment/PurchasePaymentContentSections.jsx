import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { buildLookupLabel } from '@/features/workspace/shared/transactionFormatters';
import {
    FunnelIcon,
    SearchIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
    TransactionLineItemsSection,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

import { PurchasePaymentHeaderIconButton } from './PurchasePaymentHeaderSections';

const EMPTY_SELECTED_INVOICES = [];

export function PurchasePaymentDetailsSection({ config, values, isDetail, onOpenInvoice, handlers = {} }) {
    return (
        <TransactionLineItemsSection
            title={
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handlers.onSelectInvoice}
                        className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[4px] border border-ui-border bg-white text-brand-blue-accent hover:bg-brand-blue-light transition"
                        aria-label="Cari faktur"
                    >
                        <SearchIcon className="h-5 w-5" />
                    </button>
                    <span className="text-right text-2xl font-normal text-brand-dark">{values.invoiceTitle}</span>
                </div>
            }
            titleRequired={true}
            searchInput={
                <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <BackendLookupField
                            resource="purchase-invoices"
                            values={EMPTY_SELECTED_INVOICES}
                            placeholder={config.invoiceSearchPlaceholder}
                            searchLabel="Cari faktur pembelian"
                            getOptionLabel={(record) => buildLookupLabel(record, 'document_number')}
                            getOptionSearchText={(record) =>
                                [
                                    record?.document_number,
                                    record?.reference_number,
                                    record?.supplier?.name,
                                    record?.notes,
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                            }
                            onSelect={handlers.onSelectInvoiceRecord}
                            emptyTitle="Faktur tidak ditemukan"
                            emptyDescription="Coba nomor faktur atau nama pemasok lain."
                        />
                    </div>

                    {isDetail ? (
                        <button
                            type="button"
                            className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white px-5 text-base text-brand-blue-accent shrink-0"
                            onClick={handlers.onSelectInvoice}
                        >
                            {config.takeButtonLabel}
                        </button>
                    ) : null}
                </div>
            }
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
            getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
            spacerHeaderContent=""
            spacerCellContent={() => (
                <span className="inline-flex items-center justify-center text-text-workspace-inactive">
                    <TableActionIcon className="h-4 w-4" />
                </span>
            )}
            cellClassName="!py-1.5"
        />
    );
}

export function PurchasePaymentAdditionalInfoSection({ config, values, isDetail, handlers = {} }) {
    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle} icon="document" />

                <div className="mt-4 grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.paymentMethod} />
                    <div className="max-w-[276px]">
                        <SelectField value={values.paymentMethod} onChange={() => {}} className="h-[40px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
                            <option value={values.paymentMethod}>{values.paymentMethod || 'Tunai'}</option>
                        </SelectField>
                    </div>

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.dueDatePph} />
                            <div className="max-w-[276px]">
                                <TextInput
                                    value={values.dueDatePph}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                />
                            </div>

                            <TransactionFieldLabel label={config.labels.voided} />
                            <CheckboxField
                                id="voided"
                                label="Ya"
                                checked={values.voided}
                                disabled
                                align="center"
                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                containerClassName="w-auto inline-flex"
                            />
                        </>
                    ) : null}

                    <TransactionFieldLabel label={config.labels.notes} />
                    <TransactionReadonlyTextarea value={values.notes} rows={4} className="min-h-[70px]" />

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.printStatus} />
                            <TextInput
                                value={values.printStatus}
                                readOnly
                                className="h-[34px] max-w-[262px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-text-workspace-muted"
                            />
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export function PurchasePaymentInfoSection({ config, values }) {
    return (
        <div className="flex-1 flex flex-col min-h-0">
            <TransactionSectionHeading title={config.paymentInfoTitle} icon="payment" />

            <div className="mt-4 grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-x-4">
                <TransactionFieldLabel label="Dibayar dengan" />
                <div className="text-xs sm:text-sm text-brand-dark">{values.paidWith || '-'}</div>

                <TransactionFieldLabel label="Tanggal dan Jam" />
                <div className="text-xs sm:text-sm text-brand-dark">{values.paidAt || '-'}</div>
            </div>
        </div>
    );
}

export function PurchasePaymentTableFilterBar({ table, filters, setFilters }) {
    const renderFilter = (filter) => (
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
            className="h-[34px] min-w-[126px] rounded-[4px] border-ui-border"
            selectClassName="px-3 text-xs sm:text-sm text-filter-select-text"
            iconClassName="mr-2 text-filter-icon"
        >
            {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </SelectField>
    );

    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
                {table.filters.slice(0, 3).map(renderFilter)}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {table.filters.slice(3).map(renderFilter)}

                <button
                    type="button"
                    className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-action-btn-active-bg text-brand-blue hover:bg-bg-action-btn-hover transition"
                    aria-label={table.filterButtonLabel}
                >
                    <FunnelIcon className="h-4.5 w-4.5" />
                </button>
            </div>
        </div>
    );
}
