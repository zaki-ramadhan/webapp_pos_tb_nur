import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { sanitizeNumericInput } from './accountsShared';
import {
    AccountsFormFieldRow,
    AccountsReadonlyTrailingIcon,
} from './accountsViewShared';

export function AccountsGeneralTab({ config, values, isDetail, onChange }) {
    return (
        <div className="space-y-4">
            <AccountsFormFieldRow label={config.labels.type}>
                {isDetail ? (
                    <TextInput
                        value={values.type}
                        readOnly
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                ) : (
                    <SelectField
                        value={values.type}
                        onChange={(event) => onChange('type', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {config.typeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                )}
            </AccountsFormFieldRow>

            <div className="lg:pl-[280px]">
                <CheckboxField
                    id="accounts-sub-account"
                    label={config.labels.isSubAccount}
                    checked={Boolean(values.isSubAccount)}
                    onChange={(event) => onChange('isSubAccount', event.target.checked)}
                    align="center"
                    labelClassName="text-[17px]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </div>

            <AccountsFormFieldRow label={config.labels.code} required>
                <TextInput
                    value={values.code}
                    onChange={(event) => onChange('code', event.target.value)}
                    readOnly={isDetail}
                    trailing={isDetail ? <AccountsReadonlyTrailingIcon /> : null}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName={isDetail ? 'px-3' : ''}
                />
            </AccountsFormFieldRow>

            <AccountsFormFieldRow label={config.labels.name} required>
                <TextInput
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    readOnly={isDetail}
                    trailing={isDetail ? <AccountsReadonlyTrailingIcon /> : null}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName={isDetail ? 'px-3' : ''}
                />
                <p className="mt-2 pl-4 text-[14px] italic text-[#8a91a8]">{config.helperText.nameExample}</p>
            </AccountsFormFieldRow>

            <AccountsFormFieldRow label={config.labels.currency}>
                {isDetail ? (
                    <TextInput
                        value={values.currencyLabel}
                        readOnly
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#8a91a8]"
                    />
                ) : (
                    <ChipLookupField
                        values={values.currency}
                        placeholder={config.placeholders.currency}
                        onRemove={() => {}}
                        searchLabel="Cari mata uang"
                    />
                )}
            </AccountsFormFieldRow>

            {isDetail ? (
                <AccountsFormFieldRow label={config.labels.balance}>
                    <div className="pt-1 text-[18px] text-[#1f2436]">{values.balanceLabel}</div>
                </AccountsFormFieldRow>
            ) : null}
        </div>
    );
}

export function AccountsOpeningBalanceTab({ config, values, onChange }) {
    return (
        <div className="space-y-6">
            <h3 className="text-[24px] font-normal text-[#1f2436]">{config.headingLabels.openingBalance}</h3>

            <AccountsFormFieldRow label={config.labels.branch}>
                <ChipLookupField
                    values={values.branch}
                    placeholder={config.placeholders.branch}
                    onRemove={() => {}}
                    searchLabel="Cari cabang"
                />
            </AccountsFormFieldRow>

            <AccountsFormFieldRow label={config.labels.openingBalanceValue}>
                <FormattedAmountInput
                    value={values.openingBalanceValue}
                    onChange={(event) => onChange('openingBalanceValue', sanitizeNumericInput(event.target.value))}
                    prefix="Rp"
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    prefixClassName="min-w-[34px] bg-[#f5f6f8] px-3 text-[#9aa3b1]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </AccountsFormFieldRow>

            <AccountsFormFieldRow label={config.labels.openingBalanceDate}>
                <TransactionDateInput
                    value={values.openingBalanceDate}
                    onChange={(nextValue) => onChange('openingBalanceDate', nextValue)}
                    className="max-w-[430px]"
                />
            </AccountsFormFieldRow>
        </div>
    );
}

export function AccountsOthersTab({ config, values, isDetail, onChange }) {
    return (
        <div className="space-y-6">
            <AccountsFormFieldRow label={config.labels.notes} className="lg:grid-cols-[280px_minmax(0,570px)]">
                <TextareaField
                    value={values.notes}
                    onChange={(event) => onChange('notes', event.target.value)}
                    rows={3}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[68px] text-[15px] text-[#1f2436]"
                />
            </AccountsFormFieldRow>

            {isDetail ? (
                <AccountsFormFieldRow label={config.labels.cashBankReference}>
                    <TextInput
                        value={values.cashBankReference}
                        readOnly
                        className="h-[40px] rounded-[4px] border-[#9ce04f] bg-[#eef8e7]"
                        inputClassName="text-[15px] text-[#4d9b1f]"
                    />
                </AccountsFormFieldRow>
            ) : null}

            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-[18px] font-medium text-[#1f2436]">{config.headingLabels.userAccess}</h3>
            </div>

            <CheckboxField
                id="accounts-all-users"
                label={config.labels.allUsers}
                checked={Boolean(values.allUsers)}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-[17px]"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName="w-auto"
            />
        </div>
    );
}

export function AccountsChildrenTab({ values }) {
    return (
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_310px]">
            <div className="space-y-1.5">
                {values.childAccounts.map((item) => (
                    <div
                        key={`${item.id}-name`}
                        className="rounded-[3px] bg-[#cbcbcb] px-4 py-2.5 text-[17px] text-[#1f2436]"
                        style={{ paddingLeft: `${16 + item.level * 18}px` }}
                    >
                        {item.name}
                    </div>
                ))}
            </div>

            <div className="space-y-1.5">
                {values.childAccounts.map((item) => (
                    <div key={`${item.id}-code`} className="rounded-[3px] bg-[#cbcbcb] px-4 py-2.5 text-[17px] text-[#1f2436]">
                        {item.code}
                    </div>
                ))}
            </div>
        </div>
    );
}
