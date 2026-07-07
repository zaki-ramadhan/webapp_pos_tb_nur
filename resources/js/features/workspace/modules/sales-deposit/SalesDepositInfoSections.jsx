import { useRef, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import {
    DepositAmountField,
    DepositStamp,
    DepositStatusPill,
    ReadonlyTransactionTextarea,
} from '@/features/workspace/modules/shared/DepositWorkspaceShared';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import {
    TransactionDateInput,
    TransactionDualTotalCard,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';
import TextareaField from '@/components/ui/TextareaField';

export { DepositAmountField, DepositStamp };

export function DepositFooter({ values }) {
    const items = [
        { label: 'Sub Total', value: values.subtotal },
    ];

    if (values.taxEnabled && values.__taxId) {
        const rateLabel = values.taxRate ? ` (${values.taxRate}%)` : '';
        items.push({
            label: `PPN${rateLabel}`,
            value: values.taxTotalFormatted || 'Rp 0',
        });
    }

    items.push({ label: 'Total', value: values.total });

    return <TransactionDualTotalCard items={items} />;
}

export function DepositInfoSection({ config, values, setValues, isDetail }) {
    return (
        <section>
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle} icon="info" />

                <div className="mt-4 grid gap-y-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4 pl-3 sm:pl-5">
                    <TransactionFieldLabel label={config.labels.paymentTerms} />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupTextInput
                            id="paymentTerm"
                            resource="payment-terms"
                            value={values.paymentTermName || ''}
                            placeholder="Cari/Pilih Syarat Pembayaran..."
                            searchLabel="Cari syarat pembayaran"
                            onSelectAccount={(record, label) => {
                                setValues((current) => ({
                                    ...current,
                                    __paymentTermId: record ? record.id : null,
                                    paymentTermName: label || '',
                                }));
                            }}
                            className="h-[40px] rounded-[4px] border-slate-400 bg-slate-50"
                            inputClassName="text-xs sm:text-sm text-brand-dark bg-transparent"
                        />
                    </div>

                    <TransactionFieldLabel label={config.labels.address} />
                    <div className="max-w-[480px] w-full">
                        <TextareaField
                            value={values.address || ''}
                            onChange={isDetail ? undefined : (event) =>
                                setValues((current) => ({
                                    ...current,
                                    address: event.target.value,
                                }))
                            }
                            readOnly={isDetail}
                            rows={4}
                            className="border-ui-border bg-slate-50"
                            textareaClassName="min-h-[84px] text-xs sm:text-sm text-brand-dark bg-transparent"
                        />
                    </div>

                    <TransactionFieldLabel label={config.labels.notes} />
                    <div className="max-w-[480px] w-full">
                        <TextareaField
                            value={values.notes}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    notes: event.target.value,
                                }))
                            }
                            rows={4}
                            className="border-ui-border bg-slate-50"
                            textareaClassName="min-h-[84px] text-xs sm:text-sm text-brand-dark bg-transparent"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function DepositSmartlinkSection({ config }) {
    return (
        <section>
            <TransactionSectionHeading title={config.smartlinkTitle} icon="smartlink" />
            <div className="mt-4 flex items-start gap-4 text-base leading-8 text-brand-dark pl-3 sm:pl-5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-brand-dark">
                    i
                </span>
                <p className="max-w-[720px] italic">
                    Sekarang Anda dapat menerima pembayaran tagihan ini melalui partner Payment Gateway
                    <br />
                    kami. <span className="text-input-brand">Klik Disini</span>
                </p>
            </div>
        </section>
    );
}

export function DepositSummarySection({ config, values }) {
    return (
        <div className="w-full max-w-[540px]">
            <TransactionSectionHeading title={config.summaryTitle} icon="payment" />
            <section className="mt-4 rounded-[4px] border border-ui-border bg-white">
                <div className="py-1">
                    {values.summary.map(([label, value]) => (
                        label === 'Status' ? (
                            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-ui-border-lightest px-4 py-2">
                                <span className="text-xs sm:text-sm text-brand-dark font-normal">{label}</span>
                                <DepositStatusPill value={value} />
                            </div>
                        ) : (
                            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-ui-border-lightest px-4 py-2 last:border-b-0">
                                <span className="text-xs sm:text-sm text-brand-dark font-normal">{label}</span>
                                <span className="text-right text-xs sm:text-sm font-semibold text-text-darkest">
                                    {value}
                                </span>
                            </div>
                        )
                    ))}
                </div>
            </section>
        </div>
    );
}

export function SalesDepositHeader({ config, values, setValues, isDetail, handlers }) {
    const processAnchorRef = useRef(null);
    const [processOpen, setProcessOpen] = useState(false);

    const handleProcessPembayaran = () => {
        setProcessOpen(false);
        if (handlers?.onProcessPembayaran) {
            handlers.onProcessPembayaran(values);
        } else {
            if (!values.__backendRecordId) return;
            window.__pendingImportSalesDeposit = { id: values.__backendRecordId };
            window.dispatchEvent(
                new CustomEvent('workspace:open-page', {
                    detail: {
                        pageId: 'sales-receipt',
                        targetTabId: 'sales-receipt-create',
                    },
                })
            );
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            {/* Left Column */}
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.customer} required />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupTextInput
                            id="customer"
                            resource="customers"
                            value={values.customer?.[0] ?? ''}
                            placeholder="Cari/Pilih Pelanggan..."
                            searchLabel="Cari pelanggan"
                            onSelectAccount={(record, label) => {
                                setValues((current) => ({
                                    ...current,
                                    __customerId: record ? record.id : null,
                                    customer: label ? [label] : [],
                                    __salesOrderId: null,
                                    salesOrderNumber: '',
                                }));
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required />
                    <TransactionDateInput
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    />
                </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px] md:pl-12 lg:pl-16 xl:pl-20 2xl:pl-28">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required />
                    </div>

                    <div className="max-w-[320px] w-full justify-self-end">
                        {!isDetail && values.autoNumber ? (
                            <SelectField
                                value={values.numberingType}
                                onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                selectClassName="text-xs sm:text-sm text-brand-dark"
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
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        documentNumber: event.target.value,
                                    }))
                                }
                                onBlur={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        documentNumber: event.target.value.trim(),
                                    }))
                                }
                                maxLength={120}
                                trailing={<span className="text-lg font-semibold text-brand-dark">x</span>}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                trailingClassName="px-3"
                            />
                        )}
                    </div>
                </div>

                {((isDetail && values.processButtonLabel) || !isDetail) && (
                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                        <div />
                        <div className="flex justify-end w-full max-w-[320px] justify-self-end relative">
                            <button
                                ref={processAnchorRef}
                                type="button"
                                disabled={!isDetail}
                                onClick={() => setProcessOpen((prev) => !prev)}
                                className="inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-4 text-xs sm:text-sm text-brand-blue-accent transition hover:bg-brand-blue-lightest disabled:opacity-50 disabled:bg-zinc-50 disabled:border-slate-350 disabled:text-tab-inactive-border-l disabled:cursor-not-allowed"
                            >
                                <span>{values.processButtonLabel || 'Proses'}</span>
                                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${processOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDetail && (
                                <DropdownMenu
                                    open={processOpen}
                                    onClose={() => setProcessOpen(false)}
                                    anchorRef={processAnchorRef}
                                    align="end"
                                    widthClassName="w-[140px]"
                                >
                                    <DropdownMenuItem onClick={handleProcessPembayaran}>
                                        Penerimaan
                                    </DropdownMenuItem>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function SalesDepositSettingsIcon() {
    return <NavigationIcon type="settings" className="h-4 w-4" />;
}
