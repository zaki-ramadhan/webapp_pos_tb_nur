import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    DepositAmountField,
    DepositLinkedRowsSection,
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
    return (
        <TransactionDualTotalCard
            items={[
                { label: 'Sub Total', value: values.subtotal },
                { label: 'Total', value: values.total },
            ]}
        />
    );
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
                            className="border-ui-border"
                            textareaClassName="min-h-[84px] text-xs sm:text-sm text-brand-dark"
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
                            className="border-ui-border"
                            textareaClassName="min-h-[84px] text-xs sm:text-sm text-brand-dark"
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
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
            <section className="rounded-[4px] border border-table-cell-border bg-white">
                <div className="border-b border-ui-border-medium px-4 py-3">
                    <TransactionSectionHeading title={config.summaryTitle} icon="payment" />
                </div>
                <div className="-mt-3 pb-1 pt-2">
                    {values.summary.map(([label, value]) => (
                        label === 'Status' ? (
                            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border-ui-border-lightest px-4 py-2.5">
                                <span className="text-xs sm:text-sm text-brand-dark">{label}</span>
                                <DepositStatusPill value={value} />
                            </div>
                        ) : (
                            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border-ui-border-lightest px-4 py-2.5 last:border-b-0">
                                <span className="text-xs sm:text-sm text-brand-dark">{label}</span>
                                <span className={`text-right text-base ${label === 'Dicetak/email' ? 'font-semibold text-text-darkest' : 'text-text-darkest'}`.trim()}>
                                    {value}
                                </span>
                            </div>
                        )
                    ))}
                </div>
            </section>

            <DepositLinkedRowsSection
                title={config.usedDepositTitle}
                icon="payment"
                rows={values.usedDepositRows}
            />
        </div>
    );
}

export function SalesDepositHeader({ config, values, setValues, isDetail }) {
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

                {isDetail && values.processButtonLabel ? (
                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                        <div />
                        <div className="flex justify-end w-full max-w-[320px] justify-self-end">
                            <button
                                type="button"
                                className="inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-4 text-xs sm:text-sm text-brand-blue-accent"
                            >
                                <span>{values.processButtonLabel}</span>
                                <ChevronDownIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export function SalesDepositSettingsIcon() {
    return <NavigationIcon type="settings" className="h-4 w-4" />;
}
