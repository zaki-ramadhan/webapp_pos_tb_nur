import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { CogIcon, IdeaIcon } from '@/features/workspace/shared/Icons';

export default function BankTransferHeader({ config, values, setValues, activeRecordId }) {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            {/* Left Column */}
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required htmlFor="entryDate" />
                    <div className="max-w-[296px] w-full">
                        <TransactionDateInput
                            id="entryDate"
                            value={values.entryDate}
                            onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                        />
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                    <TransactionFieldLabel label={config.labels.documentNumber} required htmlFor="documentNumber" />

                    <div className="flex items-center justify-self-end w-full max-w-[320px]">
                        <div className="min-w-0 flex-1">
                            {!activeRecordId ? (
                                <SelectField
                                    id="documentNumber"
                                    value={values.numberingType}
                                    onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                                    className="h-[40px] rounded-[4px] border-ui-border w-full"
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
                                    onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value, autoNumber: false }))}
                                    onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                    maxLength={120}
                                    className="h-[40px] rounded-[4px] border-ui-border w-full"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
