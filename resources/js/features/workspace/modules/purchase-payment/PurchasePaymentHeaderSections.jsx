import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    CloseIcon,
    LinkIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function PurchasePaymentAmountField({ values }) {
    return (
        <TextInput
            value={values.paymentAmountDisplay}
            readOnly
            prefix={values.paymentAmountPrefix || undefined}
            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
            prefixClassName="min-w-[42px] justify-center bg-[#f5f6f8] px-0 text-[#9aa3b1]"
            inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
        />
    );
}

export function PurchasePaymentHeaderIconButton({ label, icon, onClick = null }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className="inline-flex h-[36px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
        >
            {icon}
        </button>
    );
}

export function PurchasePaymentHeader({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="grid gap-y-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.payee} required />
                <ChipLookupField
                    values={values.payee}
                    placeholder={config.payeePlaceholder}
                    onRemove={(value) => handlers.onRemovePayee?.(value)}
                    searchLabel="Cari pemasok"
                    onSearch={handlers.onSelectPayee}
                />

                <TransactionFieldLabel label={config.labels.bank} required />
                <ChipLookupField
                    values={values.bankAccounts}
                    placeholder={config.bankPlaceholder}
                    onRemove={(value) => handlers.onRemoveBankAccount?.(value)}
                    searchLabel="Cari bank"
                    onSearch={handlers.onSelectBankAccount}
                />

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

            <div className="grid gap-y-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                {!isDetail && values.currency ? <div /> : null}
                {isDetail && values.currency ? (
                    <>
                        <div />
                        <div className="max-w-[180px]">
                            <TextInput
                                value={values.currency}
                                readOnly
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
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

                <TransactionFieldLabel label={config.labels.entryDate} required className="sm:text-right" />
                <TransactionDateInput
                    value={values.entryDate}
                    onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    className="max-w-[238px]"
                />
            </div>
        </div>
    );
}
