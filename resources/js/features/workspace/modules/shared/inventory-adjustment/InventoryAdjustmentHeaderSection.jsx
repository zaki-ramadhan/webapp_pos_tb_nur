import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

function InventoryAdjustmentFieldRow({ label, required = false, labelClassName = '', children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className={labelClassName} />
            <div>{children}</div>
        </div>
    );
}

export default function InventoryAdjustmentHeader({ config, values, setValues, isDetail }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
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
                        <InventoryAdjustmentFieldRow label={config.labels.documentNumber} required labelClassName="sm:text-right">
                            <TextInput
                                value={values.documentNumber}
                                readOnly
                                trailing={<span className="text-[22px] font-semibold text-[#1f2436]">x</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </InventoryAdjustmentFieldRow>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start gap-4 sm:justify-end">
                                <TransactionFieldLabel label={config.labels.documentNumber} required />
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

                            <SelectField
                                value={values.numberingType}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        numberingType: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="text-[15px] text-[#1f2436]"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                        >
                            {config.takeButtonLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
