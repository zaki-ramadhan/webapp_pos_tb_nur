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
            <TransactionSectionHeading title={config.infoTitle} icon="info" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.paymentTerms} />
                <ChipLookupField
                    values={values.paymentTerms}
                    placeholder="Cari/Pilih..."
                    onRemove={(value) => handlers.onRemovePaymentTerm?.(value)}
                    searchLabel="Cari syarat pembayaran"
                    onSearch={handlers.onSelectPaymentTerm}
                    heightClassName="h-[34px]"
                />

                <TransactionFieldLabel label={config.labels.address} />
                {isDetail ? (
                    <div className="flex items-start gap-4">
                        <button
                            type="button"
                            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#21539b]"
                            aria-label="Lihat alamat"
                        >
                            <PinIcon className="h-[18px] w-[18px] text-[#21539b]" />
                        </button>
                        <ReadonlyTransactionTextarea value={values.address} className="min-h-[86px] flex-1" />
                    </div>
                ) : (
                    <ReadonlyTransactionTextarea value={values.address} className="min-h-[84px]" />
                )}

                <TransactionFieldLabel label={config.labels.branch} required />
                <ChipLookupField
                    values={values.branches}
                    placeholder="Cari/Pilih..."
                    onRemove={(value) => handlers.onRemoveBranch?.(value)}
                    searchLabel="Cari cabang"
                    onSearch={handlers.onSelectBranch}
                    heightClassName="h-[34px]"
                />

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
                    className="border-[#cfd6e2]"
                    textareaClassName="min-h-[72px] text-xs sm:text-sm text-[#1f2436]"
                />
            </div>
        </section>
    );
}

export function DepositSmartlinkSection({ config }) {
    return (
        <section>
            <TransactionSectionHeading title={config.smartlinkTitle} icon="smartlink" />
            <div className="mt-4 flex items-start gap-4 text-base leading-8 text-[#1f2436]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#1f2436]">
                    i
                </span>
                <p className="max-w-[720px] italic">
                    Sekarang Anda dapat menerima pembayaran tagihan ini melalui partner Payment Gateway
                    <br />
                    kami. <span className="text-[#1564d7]">Klik Disini</span>
                </p>
            </div>
        </section>
    );
}

export function DepositSummarySection({ config, values }) {
    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
            <section className="rounded-[4px] border border-[#d2d8e3] bg-white">
                <div className="border-b border-[#d8dde7] px-4 py-3">
                    <TransactionSectionHeading title={config.summaryTitle} icon="payment" />
                </div>
                <div className="-mt-3 pb-1 pt-2">
                    {values.summary.map(([label, value]) => (
                        label === 'Status' ? (
                            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e6ebf2] px-4 py-2.5">
                                <span className="text-xs sm:text-sm text-[#1f2436]">{label}</span>
                                <DepositStatusPill value={value} />
                            </div>
                        ) : (
                            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e6ebf2] px-4 py-2.5 last:border-b-0">
                                <span className="text-xs sm:text-sm text-[#1f2436]">{label}</span>
                                <span className={`text-right text-base ${label === 'Dicetak/email' ? 'font-semibold text-[#111827]' : 'text-[#111827]'}`.trim()}>
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
            <div className={`grid gap-y-3 ${isDetail ? 'sm:grid-cols-[130px_minmax(0,1fr)_180px]' : 'sm:grid-cols-[130px_minmax(0,1fr)]'} sm:items-center sm:gap-x-4`.trim()}>
                <TransactionFieldLabel label={config.labels.customer} required />
                <ChipLookupField
                    values={values.customer}
                    placeholder="Cari/Pilih Pelanggan..."
                    onRemove={handlers.onRemoveCustomer}
                    searchLabel="Cari pelanggan"
                    onSearch={handlers.onSelectCustomer}
                />
                {isDetail ? (
                    <div className="max-w-[180px]">
                        <TextInput value={values.currency} readOnly className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                    </div>
                ) : null}

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
                    <SelectField value={values.numberingType} onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
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
                        readOnly={Boolean(isDetail)}
                        trailing={<span className="text-lg font-semibold text-[#1f2436]">x</span>}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        trailingClassName="px-3"
                    />
                )}

                <div />
                {isDetail && values.processButtonLabel ? (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-base text-[#21539b]"
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
