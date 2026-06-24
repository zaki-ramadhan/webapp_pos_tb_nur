import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function BankTransferHeader({ config, values, setValues, activeRecordId }) {
    return (
        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="grid gap-y-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.entryDate} required />
                <TransactionDateInput
                    value={values.entryDate}
                    onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    className="max-w-[296px]"
                />
            </div>

            <div className="grid gap-y-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <div className="flex items-center justify-start gap-4 sm:justify-end">
                    <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                    {!activeRecordId ? (
                        <TransactionSwitch
                            checked={values.autoNumber}
                            onChange={(nextChecked) => setValues((current) => ({ ...current, autoNumber: nextChecked }))}
                        />
                    ) : null}
                </div>

                {values.autoNumber ? (
                    <SelectField
                        value={values.numberingType}
                        onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
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
                        onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))}
                        onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                        maxLength={120}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                )}
            </div>
        </div>
    );
}
