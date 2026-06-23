import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

function InventoryAdjustmentFieldRow({ label, required = false, labelClassName = '', children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className={labelClassName} />
            <div>{children}</div>
        </div>
    );
}

export default function InventoryAdjustmentHeader({ config, values, setValues, isDetail }) {
    return (
        <div className="px-4 pt-4 pb-0">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:items-start">
                <div className="space-y-3">
                    <InventoryAdjustmentFieldRow label={config.labels.date} required>
                        <TransactionDateInput
                            value={values.date}
                            onChange={(nextDisplayValue) =>
                                setValues((current) => ({
                                    ...current,
                                    date: nextDisplayValue,
                                }))
                            }
                            className="max-w-[282px]"
                        />
                    </InventoryAdjustmentFieldRow>
                </div>

                <div className="space-y-3">
                    {isDetail ? (
                        <div className="grid gap-3 sm:grid-cols-[230px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start sm:justify-end">
                                <TransactionFieldLabel label={config.labels.documentNumber} required className="whitespace-nowrap sm:text-right" />
                            </div>
                            <div className="flex sm:justify-end">
                                <TextInput
                                    value={values.documentNumber}
                                    readOnly
                                    trailing={<span className="text-2xl font-semibold text-[#1f2436]">x</span>}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2] max-w-[282px] w-full"
                                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                    trailingClassName="px-3"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[230px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start gap-4 sm:justify-end">
                                <TransactionFieldLabel label={config.labels.documentNumber} required className="whitespace-nowrap" />
                                <TransactionSwitch
                                    checked={values.autoNumber}
                                    onChange={(nextValue) =>
                                        setValues((current) => ({
                                            ...current,
                                            autoNumber: nextValue,
                                        }))
                                    }
                                />
                            </div>

                            <div className="flex sm:justify-end">
                                {values.autoNumber ? (
                                    <SelectField
                                        value={values.numberingType}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                numberingType: event.target.value,
                                            }))
                                        }
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2] max-w-[282px] w-full"
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
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                documentNumber: event.target.value,
                                            }))
                                        }
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2] max-w-[282px] w-full"
                                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
