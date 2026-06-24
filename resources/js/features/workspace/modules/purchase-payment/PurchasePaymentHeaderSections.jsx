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
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-3 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.payee} required />
                    <ChipLookupField
                        values={values.payee}
                        placeholder={config.payeePlaceholder}
                        onRemove={(value) => handlers.onRemovePayee?.(value)}
                        searchLabel="Cari pemasok"
                        onSearch={handlers.onSelectPayee}
                    />
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.bank} required />
                    <ChipLookupField
                        values={values.bankAccounts}
                        placeholder={config.bankPlaceholder}
                        onRemove={(value) => handlers.onRemoveBankAccount?.(value)}
                        searchLabel="Cari bank"
                        onSearch={handlers.onSelectBankAccount}
                    />
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.paymentAmount} />
                    <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <PurchasePaymentAmountField values={values} />
                        </div>
                        <PurchasePaymentHeaderIconButton label="Hitung ulang" icon={<LinkIcon className="h-4.5 w-4.5" />} />
                        {values.showSecondaryAmountButton ? (
                            <PurchasePaymentHeaderIconButton label="Lihat ringkasan" icon={<TableActionIcon className="h-4.5 w-4.5" />} />
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-y-3 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required />
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
                    <div className="max-w-[320px] w-full justify-self-end">
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
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <TransactionFieldLabel label={config.labels.entryDate} required />
                    <div className="max-w-[320px] w-full justify-self-end">
                        <TransactionDateInput
                            value={values.entryDate}
                            onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
