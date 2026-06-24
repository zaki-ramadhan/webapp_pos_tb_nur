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
    TransactionSectionHeading,
    TransactionToolbarIconButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    SearchIcon,
    SortIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';
import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import {
    buildInvoiceSectionTitle,
    ReadonlyTextarea,
} from '@/features/workspace/modules/sales-receipt/salesReceiptViewShared';

export function SalesReceiptInvoicesSection({ config, values, setValues, isDetail, onOpenInvoiceModal, handlers = {} }) {
    const [keyword, setKeyword] = useState(values.invoiceSearch ?? '');

    useEffect(() => {
        setKeyword(values.invoiceSearch ?? '');
    }, [values.invoiceSearch]);

    const filteredInvoices = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return values.invoices;
        }

        return values.invoices.filter((invoice) =>
            [
                invoice.invoiceNumber,
                invoice.invoiceDate,
                invoice.invoiceTotal,
                invoice.outstanding,
                invoice.paid,
                invoice.discount,
                invoice.payment,
            ].some((fieldValue) =>
                String(fieldValue ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            ),
        );
    }, [keyword, values.invoices]);

    return (
        <section className="min-h-[540px]">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1 sm:max-w-[560px]">
                        <TextInput
                            value={keyword}
                            onChange={(event) => {
                                setKeyword(event.target.value);
                                setValues((current) => ({
                                    ...current,
                                    invoiceSearch: event.target.value,
                                }));
                            }}
                            placeholder="Cari/Pilih..."
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    </div>

                    {isDetail ? (
                        <button
                            type="button"
                            className="inline-flex h-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-base text-[#21539b]"
                            onClick={handlers.onSelectInvoice}
                        >
                            Ambil
                        </button>
                    ) : null}
                </div>

                <div className="flex items-center justify-end gap-3">
                    <TransactionToolbarIconButton label="Cari faktur" className="h-[40px] w-[40px]" onClick={handlers.onSelectInvoice}>
                        <SearchIcon className="h-5 w-5 text-[#2353a0]" />
                    </TransactionToolbarIconButton>
                    <div className="text-right text-2xl font-normal text-[#1f2436]">
                        {buildInvoiceSectionTitle(
                            config.sectionTabs?.find((tab) => tab.id === 'details')?.label ?? 'Faktur',
                            values.invoices.length,
                        )}
                        <span className="text-[#ED3969]"> *</span>
                    </div>
                </div>
            </div>

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1020px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.invoiceTable.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-base font-medium text-white ${
                                        column.align === 'right'
                                            ? 'text-right'
                                            : column.align === 'center'
                                              ? 'text-center'
                                              : 'text-left'
                                    }`.trim()}
                                >
                                    {column.label ? (
                                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`.trim()}>
                                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                            <span>{column.label}</span>
                                        </span>
                                    ) : null}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredInvoices.length ? (
                            filteredInvoices.map((invoice, index) => (
                                <DataTableRow
                                    key={invoice.id}
                                    className={`border-[#dde1e8] transition ${invoice.modal ? 'cursor-pointer hover:bg-[#eef3fb]' : ''} ${
                                        index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'
                                    }`.trim()}
                                    onClick={() => {
                                        if (invoice.modal) {
                                            onOpenInvoiceModal?.(invoice.modal);
                                        }
                                    }}
                                >
                                    {config.invoiceTable.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'} px-2.5 text-base text-[#131a28]`.trim()}
                                        >
                                            {column.id === 'spacer' ? (
                                                <span className="inline-flex items-center justify-center text-[#a8afbe]">
                                                    <TableActionIcon className="h-4 w-4" />
                                                </span>
                                            ) : (
                                                <span className="block truncate">{formatTableTextValue(invoice[column.id])}</span>
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-[#dde1e8] bg-white">
                                <DataTableCell className="px-2.5 text-center text-[#a8afbe]">
                                    <span className="inline-flex items-center justify-center">
                                        <TableActionIcon className="h-4 w-4" />
                                    </span>
                                </DataTableCell>
                                <DataTableCell
                                    colSpan={config.invoiceTable.columns.length - 1}
                                    className="px-2.5 py-6 text-center text-base text-[#7d879a]"
                                >
                                    {config.invoiceTable.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </section>
    );
}

export function SalesReceiptAdditionalInfoSection({ config, values, setValues, isDetail, handlers = {} }) {
    const isCheckPayment = values.paymentMethod === 'Cek/Giro';

    return (
        <section className="min-h-[540px]">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.sectionTabs?.find((tab) => tab.id === 'additional-info')?.label ?? 'Info lainnya'} icon="info" />

                <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.paymentMethod} />
                    <div className={`grid gap-4 ${isCheckPayment ? 'lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]' : ''}`.trim()}>
                        <SelectField
                            value={values.paymentMethod}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    paymentMethod: event.target.value,
                                }))
                            }
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {['Tunai', 'Cek/Giro'].map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>

                        {isCheckPayment ? (
                            <TextInput
                                value={values.checkNumber}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        checkNumber: event.target.value,
                                    }))
                                }
                                trailing={isDetail ? <span className="text-lg font-semibold text-[#1f2436]">×</span> : null}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        ) : null}
                    </div>

                    {isCheckPayment ? (
                        <>
                            <TransactionFieldLabel label={config.labels.checkDate} required />
                            <div className="max-w-[276px]">
                                <TransactionDateInput value={values.checkDate} className="max-w-none" />
                            </div>
                        </>
                    ) : null}

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.voided} />
                            <CheckboxField
                                id="voided"
                                label="Ya"
                                checked={values.voided}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        voided: event.target.checked,
                                    }))
                                }
                                align="center"
                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                containerClassName="w-auto inline-flex h-[34px]"
                            />
                        </>
                    ) : null}



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
                        className="min-h-[72px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none"
                    />

                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.reconcileStatus} />
                            <div className="pt-1 text-base italic text-[#1f2436]">{values.reconcileStatus || 'Belum'}</div>

                            <TransactionFieldLabel label={config.labels.printStatus} />
                            <TextInput
                                value={values.printStatus}
                                readOnly
                                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-xs sm:text-sm text-[#5f6779]"
                            />
                        </>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
