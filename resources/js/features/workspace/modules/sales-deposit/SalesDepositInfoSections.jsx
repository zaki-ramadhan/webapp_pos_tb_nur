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
import { PinIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
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

export function DepositInfoSection({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <section>
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle} icon="info" />

                <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    <TransactionFieldLabel label={config.labels.address} />
                    {isDetail ? (
                        <div className="flex items-start gap-4">
                            <button
                                type="button"
                                className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue-accent"
                                aria-label="Lihat alamat"
                            >
                                <PinIcon className="h-[18px] w-[18px] text-brand-blue-accent" />
                            </button>
                            <ReadonlyTransactionTextarea value={values.address} className="min-h-[86px] flex-1" />
                        </div>
                    ) : (
                        <ReadonlyTransactionTextarea value={values.address} className="min-h-[84px]" />
                    )}



                    <TransactionFieldLabel label={config.labels.notes} />
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
                        textareaClassName="min-h-[72px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </div>
        </section>
    );
}

export function DepositSmartlinkSection({ config }) {
    return (
        <section>
            <TransactionSectionHeading title={config.smartlinkTitle} icon="smartlink" />
            <div className="mt-4 flex items-start gap-4 text-base leading-8 text-brand-dark">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-brand-dark">
                    i
                </span>
                <p className="max-w-[720px] italic">
                    Sekarang Anda dapat menerima pembayaran tagihan ini melalui partner Payment Gateway
                    <br />
                    kami. <span className="text-blue-1564d7">Klik Disini</span>
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

export function SalesDepositHeader({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className={`grid gap-x-8 gap-y-3 ${isDetail ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]'}`.trim()}>
            <div className="grid gap-y-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.customer} required />
                <ChipLookupField
                    values={values.customer}
                    placeholder="Cari/Pilih Pelanggan..."
                    onRemove={handlers.onRemoveCustomer}
                    searchLabel="Cari pelanggan"
                    onSearch={handlers.onSelectCustomer}
                />

                <TransactionFieldLabel label={config.labels.entryDate} required />
                <TransactionDateInput
                    value={values.entryDate}
                    onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                />
            </div>

            <div className="grid gap-y-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <div className="flex items-center justify-start gap-4 sm:justify-end">
                    <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                    {!isDetail ? (
                        <TransactionSwitch checked={values.autoNumber} onChange={(nextValue) => setValues((current) => ({ ...current, autoNumber: nextValue }))} />
                    ) : null}
                </div>

                {!isDetail && values.autoNumber ? (
                    <SelectField value={values.numberingType} onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))} className="h-[40px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
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
                        readOnly={Boolean(isDetail)}
                        trailing={<span className="text-lg font-semibold text-brand-dark">x</span>}
                        className="h-[40px] rounded-[4px] border-ui-border"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                        trailingClassName="px-3"
                    />
                )}

                <div />
                {isDetail && values.processButtonLabel ? (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-4 text-base text-brand-blue-accent"
                        >
                            <span>{values.processButtonLabel}</span>
                            <ChevronDownIcon className="h-4 w-4" />
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export function SalesDepositSettingsIcon() {
    return <NavigationIcon type="settings" className="h-4 w-4" />;
}
