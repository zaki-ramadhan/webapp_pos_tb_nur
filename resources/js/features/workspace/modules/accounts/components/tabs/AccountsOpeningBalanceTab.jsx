import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import { sanitizeNumericInput } from '../../accountsShared';
import { AccountsFormFieldRow } from '../../accountsViewShared';

export function AccountsOpeningBalanceTab({ config, values, onChange }) {
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-normal text-brand-dark">{config.headingLabels.openingBalance}</h3>

            <div className="grid grid-cols-1 gap-y-3.5 max-w-[980px]">
                <AccountsFormFieldRow label={config.labels.openingBalanceValue}>
                    <FormattedAmountInput
                        value={values.openingBalanceValue}
                        onChange={(event) => onChange('openingBalanceValue', sanitizeNumericInput(event.target.value))}
                        prefix="Rp"
                        maxLength={11}
                        className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[200px]"
                        prefixClassName="min-w-[34px] bg-input-prefix-bg-compact px-3 text-text-inactive"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                </AccountsFormFieldRow>

                <AccountsFormFieldRow label={config.labels.openingBalanceDate}>
                    <TransactionDateInput
                        value={values.openingBalanceDate || buildTodayDisplayDate()}
                        onChange={(nextValue) => onChange('openingBalanceDate', nextValue)}
                        className="w-full max-w-[200px]"
                    />
                </AccountsFormFieldRow>
            </div>
        </div>
    );
}
