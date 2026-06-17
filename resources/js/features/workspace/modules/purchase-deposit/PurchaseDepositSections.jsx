import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    DepositAmountField,
    DepositLinkedRowsSection,
    DepositStamp,
    DepositStatusPill,
    ReadonlyTransactionTextarea,
} from '@/features/workspace/modules/shared/DepositWorkspaceShared';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { CloseIcon, PinIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
import CheckboxField from '@/components/ui/CheckboxField';

function PurchaseDepositCheckbox({ checked, label }) {
    return (
        <CheckboxField
            id="deposit-checked"
            label={label}
            checked={checked}
            disabled
            inputClassName="h-[20px] w-[20px] rounded"
            containerClassName="w-auto inline-flex items-center"
        />
    );
}

export function PurchaseDepositProcessButton({ label, disabled = false }) {
    return (
        <button
            type="button"
            disabled={disabled}
            className={`inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border px-4 text-base ${
                disabled
                    ? 'border-[#d8dbe2] bg-[#f3f3f4] text-[#a6adba]'
                    : 'border-[#7aa2d5] bg-white text-[#21539b]'
            }`.trim()}
        >
            <span>{label}</span>
            <ChevronDownIcon className="h-4 w-4" />
        </button>
    );
}

function PurchaseDepositSummaryCard({ title, rows }) {
    return (
        <section className="rounded-[4px] border border-[#d2d8e3] bg-white">
            <div className="border-b border-[#d8dde7] px-4 py-3">
                <TransactionSectionHeading title={title} icon="payment" />
            </div>
            <div className="-mt-3 pb-1 pt-2">
                {rows.map(([label, value]) =>
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
                    ),
                )}
            </div>
        </section>
    );
}

export function PurchaseDepositHeader({ config, values, isDetail, setValues }) {
    return (
        <div className={`grid gap-6 ${isDetail ? 'xl:grid-cols-[minmax(0,1fr)_180px_minmax(0,0.92fr)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]'}`.trim()}>
            <div className="grid gap-y-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.supplier} required />
                <ChipLookupField values={values.supplier} placeholder="Cari/Pilih Pemasok..." onRemove={() => {}} searchLabel="Cari pemasok" />

                <TransactionFieldLabel label={config.labels.entryDate} required />
                <TransactionDateInput value={values.entryDate} />
            </div>

            {isDetail ? (
                <div className="max-w-[180px]">
                    <TextInput
                        value={values.currency}
                        readOnly
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>
            ) : null}

            <div className="grid gap-y-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <div className="flex items-center justify-start gap-4 sm:justify-end">
                    <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                    {!isDetail ? (
                        <TransactionSwitch
                            checked={values.autoNumber}
                            onChange={(nextValue) =>
                                setValues((current) => ({
                                    ...current,
                                    autoNumber: nextValue,
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
                        selectClassName="text-xs sm:text-sm text-[#1f2436]"
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
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        trailingClassName="px-3"
                    />
                )}

                <div />
                <div className="flex justify-end">
                    <PurchaseDepositProcessButton label={values.processButtonLabel} disabled={values.processDisabled} />
                </div>
            </div>
        </div>
    );
}

export function PurchaseDepositMainSection({ config, values, isDetail }) {
    return (
        <div className="relative">
            {isDetail && values.statusStamp ? (
                <DepositStamp label={values.statusStamp} tone={values.statusTone} className="hidden xl:flex xl:left-[48%] xl:top-[40%]" />
            ) : null}

            <div className={`grid gap-8 ${isDetail ? 'xl:grid-cols-[minmax(0,0.95fr)_minmax(0,0.9fr)]' : ''}`.trim()}>
                <section>
                    <TransactionSectionHeading title={config.depositTitle} icon="payment" />

                    <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.purchaseOrderNumber} />
                        <TextInput
                            value={values.purchaseOrderNumber}
                            readOnly
                            className="h-[34px] rounded-[4px] border-[#9ce04f] bg-[#eef8e7]"
                            inputClassName="text-xs sm:text-sm text-[#4d9b1f]"
                        />

                        <TransactionFieldLabel label={config.labels.orderTotal} />
                        <TextInput
                            value={values.orderTotal}
                            readOnly
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-right text-xs sm:text-sm text-[#6b7280]"
                        />

                        <TransactionFieldLabel label={config.labels.depositAmount} required />
                        <DepositAmountField value={values.depositAmount} />

                        <TransactionFieldLabel label={config.labels.tax} />
                        <div className="flex flex-wrap gap-8">
                            <PurchaseDepositCheckbox checked={values.taxEnabled} label="Kena Pajak" />
                            <PurchaseDepositCheckbox checked={values.taxIncluded} label="Total termasuk Pajak" />
                        </div>

                        <TransactionFieldLabel label={config.labels.paymentTerms} />
                        <ChipLookupField values={values.paymentTerms} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari syarat pembayaran" heightClassName="h-[34px]" />
                    </div>
                </section>

                {isDetail ? (
                    <section>
                        <TransactionSectionHeading title={config.taxInfoTitle} icon="tax" />

                        <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.taxInvoiceDate} />
                            <TransactionDateInput value={values.taxInvoiceDate} className="max-w-none" />

                            <TransactionFieldLabel label={config.labels.taxTransactionType} />
                            <SelectField value={values.taxTransactionType} onChange={() => {}} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                                <option value={values.taxTransactionType}>{values.taxTransactionType}</option>
                            </SelectField>

                            <TransactionFieldLabel label={config.labels.taxTransactionDetail} />
                            <SelectField value={values.taxTransactionDetail} onChange={() => {}} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                                <option value={values.taxTransactionDetail}>{values.taxTransactionDetail}</option>
                            </SelectField>

                            <TransactionFieldLabel label={config.labels.taxInvoiceNumber} />
                            <TextInput
                                value={values.taxInvoiceNumber}
                                readOnly
                                trailing={<CloseIcon className="h-4 w-4 text-[#1f2436]" />}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}

export function PurchaseDepositAdditionalInfoSection({ config, values, isDetail }) {
    return (
        <div className="relative">
            {isDetail && values.statusStamp ? (
                <DepositStamp label={values.statusStamp} tone={values.statusTone} className="hidden xl:flex xl:left-[48%] xl:top-[40%]" />
            ) : null}

            <section className="max-w-[860px]">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                    {isDetail ? (
                        <>
                            <TransactionFieldLabel label={config.labels.supplierInvoiceNumber} required />
                            <TextInput
                                value={values.supplierInvoiceNumber}
                                readOnly
                                trailing={<CloseIcon className="h-4 w-4 text-[#1f2436]" />}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </>
                    ) : null}

                    <TransactionFieldLabel label={config.labels.bankAccount} />
                    <ChipLookupField values={values.bankAccounts} placeholder="Rekening Bank" onRemove={() => {}} searchLabel="Cari rekening bank" heightClassName="h-[34px]" />

                    <TransactionFieldLabel label={config.labels.address} />
                    <div className="flex items-start gap-4">
                        <button
                            type="button"
                            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#21539b]"
                            aria-label="Lihat alamat"
                        >
                            <PinIcon className="h-[18px] w-[18px] text-[#21539b]" />
                        </button>
                        <ReadonlyTransactionTextarea value={values.address} rows={4} className="min-h-[112px] flex-1" />
                    </div>

                    <TransactionFieldLabel label={config.labels.branch} required />
                    <ChipLookupField values={values.branches} placeholder="Cari/Pilih..." onRemove={() => {}} searchLabel="Cari cabang" heightClassName="h-[34px]" />

                    <TransactionFieldLabel label={config.labels.notes} />
                    <ReadonlyTransactionTextarea value={values.notes} rows={3} className="min-h-[70px]" />
                </div>
            </section>
        </div>
    );
}

export function PurchaseDepositInvoiceInfoSection({ config, values, isDetail }) {
    return (
        <div className="relative">
            {isDetail && values.statusStamp ? (
                <DepositStamp label={values.statusStamp} tone={values.statusTone} className="hidden xl:flex xl:left-[48%] xl:top-[42%]" />
            ) : null}

            <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
                <PurchaseDepositSummaryCard title={config.invoiceInfoTitle} rows={values.summary} />

                <div className="space-y-4">
                    <DepositLinkedRowsSection title={config.paymentHistoryTitle} icon="payment" rows={values.paymentHistoryRows} />
                    <DepositLinkedRowsSection title={config.usedDepositTitle} icon="receipt" rows={values.usedDepositRows} />
                </div>
            </div>
        </div>
    );
}
