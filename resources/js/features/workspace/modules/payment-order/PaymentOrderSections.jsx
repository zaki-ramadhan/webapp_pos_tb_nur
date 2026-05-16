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
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';

function PaymentOrderFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
            <TransactionFieldLabel label={label} required={required} />
            <div>{children}</div>
        </div>
    );
}

function PaymentOrderInvoiceTable({ config }) {
    return (
        <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
            <div className="min-w-[1180px]">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.invoiceTable.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${
                                        column.align === 'right'
                                            ? 'text-right'
                                            : column.align === 'center'
                                              ? 'text-center'
                                              : 'text-left'
                                    }`.trim()}
                                >
                                    <span
                                        className={`flex items-center gap-2 ${
                                            column.align === 'right'
                                                ? 'justify-end'
                                                : column.align === 'center'
                                                  ? 'justify-center'
                                                  : 'justify-start'
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
                        <DataTableRow className="bg-white">
                            <DataTableCell
                                colSpan={config.invoiceTable.columns.length}
                                className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                            >
                                {config.invoiceTable.emptyLabel}
                            </DataTableCell>
                        </DataTableRow>
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export function PaymentOrderHeader({ config, values, setValues }) {
    return (
        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
            <div className="space-y-3">
                <PaymentOrderFieldRow label={config.labels.transferDueDate} required>
                    <TransactionDateInput value={values.transferDueDate} className="max-w-[280px]" />
                </PaymentOrderFieldRow>

                <PaymentOrderFieldRow label={config.labels.paymentMethod}>
                    <div className="max-w-[280px]">
                        <SelectField
                            value={values.paymentMethod}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    paymentMethod: event.target.value,
                                }))
                            }
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {config.paymentMethodOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                </PaymentOrderFieldRow>
            </div>

            <div className="space-y-3">
                <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
                    <div className="flex items-center justify-start gap-4 lg:justify-end">
                        <TransactionFieldLabel label={config.labels.documentNumber} required />
                        <TransactionSwitch
                            checked={values.autoNumber}
                            onChange={(nextValue) =>
                                setValues((current) => ({
                                    ...current,
                                    autoNumber: nextValue,
                                }))
                            }
                        />
                    </div>

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
                </div>
            </div>
        </div>
    );
}

export function PaymentOrderDetailsSection({ config, values, setValues }) {
    return (
        <div className="flex min-h-[560px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1 sm:max-w-[720px]">
                        <TextInput
                            value={values.invoiceSearch}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    invoiceSearch: event.target.value,
                                }))
                            }
                            placeholder={config.invoiceSearchPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                    >
                        {config.takeButtonLabel}
                    </button>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <TransactionToolbarIconButton label="Cari faktur">
                        <SearchIcon className="h-5 w-5" />
                    </TransactionToolbarIconButton>
                    <div className="text-right text-[22px] font-normal text-[#1f2436]">
                        {config.invoiceSectionTitle} <span className="text-[#ED3969]">*</span>
                    </div>
                </div>
            </div>

            <PaymentOrderInvoiceTable config={config} />
        </div>
    );
}

export function PaymentOrderInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[560px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.notes} />
                <div className="max-w-[568px]">
                    <TextareaField
                        value={values.notes}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        rows={4}
                        className="rounded-[4px] border-[#cfd6e2]"
                        textareaClassName="min-h-[70px] text-[15px] text-[#1f2436]"
                    />
                </div>

                <TransactionFieldLabel label={config.labels.branch} required />
                <div className="max-w-[568px]">
                    <ChipLookupField
                        values={values.branches}
                        placeholder={config.branchPlaceholder}
                        searchLabel="Cari cabang"
                        heightClassName="h-[34px]"
                    />
                </div>
            </div>
        </div>
    );
}

export function PaymentOrderFooter({ config, values }) {
    return (
        <div className="flex justify-end">
            <TransactionTotalCard label={config.footerLabel} value={formatTableTextValue(values.footerValue)} />
        </div>
    );
}
