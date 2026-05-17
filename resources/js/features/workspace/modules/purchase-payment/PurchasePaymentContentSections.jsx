import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
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
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

import { PurchasePaymentHeaderIconButton } from './PurchasePaymentHeaderSections';

export function PurchasePaymentDetailsSection({ config, values, isDetail, onOpenInvoice, handlers = {} }) {
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
                            onClick={handlers.onSelectInvoice}
                        />
                    </div>

                    {isDetail ? (
                        <button
                            type="button"
                            className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-5 text-[15px] text-[#21539b]"
                            onClick={handlers.onSelectInvoice}
                        >
                            {config.takeButtonLabel}
                        </button>
                    ) : null}
                </div>

                <div className="flex items-center justify-end gap-3">
                    <PurchasePaymentHeaderIconButton label="Cari faktur" icon={<SearchIcon className="h-5 w-5" />} onClick={handlers.onSelectInvoice} />
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
                            row[column.id] ?? ''
                        )
                    }
                />
            </div>
        </div>
    );
}

export function PurchasePaymentAdditionalInfoSection({ config, values, isDetail, handlers = {} }) {
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
                <ChipLookupField
                    values={values.branches}
                    placeholder="Cari/Pilih..."
                    onRemove={(value) => handlers.onRemoveBranch?.(value)}
                    searchLabel="Cari cabang"
                    heightClassName="h-[34px]"
                    onSearch={handlers.onSelectBranch}
                />

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

export function PurchasePaymentInfoSection({ config, values }) {
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

export function PurchasePaymentTableFilterBar({ table, filters, setFilters }) {
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
