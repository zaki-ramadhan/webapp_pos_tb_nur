import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionFieldLabel,
    TransactionDateInput,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function CashReceiptHeader({ config, values, setValues, handlers = {} }) {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.cashBank} required htmlFor="cashBank" />
                    <div className="max-w-[320px] w-full">
                        <AccountLookupField
                            id="cashBank"
                            value={values.bankAccounts?.[0] ?? ''}
                            placeholder={config.cashBankPlaceholder}
                            searchLabel="Cari kas atau bank"
                            queryParams={{ account_type: 'Cash/Bank' }}
                            onRemove={() =>
                                setValues((current) => ({
                                    ...current,
                                    __primaryAccountId: null,
                                    bankAccounts: [],
                                }))
                            }
                            onSelectAccount={(record, label) =>
                                setValues((current) => ({
                                    ...current,
                                    __primaryAccountId: record?.id ?? null,
                                    bankAccounts: record ? [label] : [],
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required htmlFor="entryDate" />
                    <TransactionDateInput
                        id="entryDate"
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <div className="flex items-center justify-start gap-4">
                        <TransactionFieldLabel label={config.labels.documentNumber} required htmlFor="documentNumber" />
                    </div>

                    <div className="max-w-[240px] w-full justify-self-end">
                        {values.autoNumber ? (
                            <SelectField
                                id="documentNumber"
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
                                id="documentNumber"
                                value={values.documentNumber}
                                onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))}
                                onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                maxLength={120}
                                readOnly={isDetail}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark font-normal"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
