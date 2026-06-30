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

import BackendLookupField from '@/features/workspace/shared/BackendLookupField';

export default function InventoryAdjustmentHeader({ config, values, setValues, isDetail, pageId }) {
    const isPriceAdjustment = pageId === 'price-adjustment';

    if (isPriceAdjustment) {
        return (
            <div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
                    {/* Left Column */}
                    <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                            <TransactionFieldLabel label={config.labels.salesCategory} required />
                            <div className="max-w-[282px] w-full">
                                <BackendLookupField
                                    resource="sales-categories"
                                    values={(values.salesCategory || []).map((name) => typeof name === 'string' ? { name } : name)}
                                    placeholder={config.salesCategoryPlaceholder || 'Cari/Pilih...'}
                                    searchLabel="Cari kategori penjualan"
                                    disabled={isDetail}
                                    getOptionLabel={(option) => {
                                        if (option.code) {
                                            return `[${option.code}] ${option.name}`;
                                        }
                                        return option.name ?? '';
                                    }}
                                    onSelect={(option) => {
                                        setValues((current) => ({
                                            ...current,
                                            salesCategory: [`[${option.code}] ${option.name}`],
                                            __salesCategoryId: option.id,
                                        }));
                                    }}
                                    onRemove={() => {
                                        setValues((current) => ({
                                            ...current,
                                            salesCategory: [],
                                            __salesCategoryId: null,
                                        }));
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                            <TransactionFieldLabel label={config.labels.adjustmentType} />
                            <div className="max-w-[282px] w-full">
                                <SelectField
                                    value={values.adjustmentType}
                                    disabled={isDetail}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            adjustmentType: event.target.value,
                                        }))
                                    }
                                    className="h-[40px] rounded-[4px] border-ui-border w-full"
                                    selectClassName="text-xs sm:text-sm text-brand-dark"
                                >
                                    {config.adjustmentTypeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>
                        </div>

                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                            <TransactionFieldLabel label={config.labels.effectiveDate} required />
                            <div className="max-w-[282px] w-full">
                                <TransactionDateInput
                                    value={values.effectiveDate}
                                    disabled={isDetail}
                                    onChange={(nextDisplayValue) =>
                                        setValues((current) => ({
                                            ...current,
                                            effectiveDate: nextDisplayValue,
                                        }))
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px] md:pl-12 lg:pl-16 xl:pl-20 2xl:pl-28">
                        <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                            <div className="flex items-center justify-start gap-4">
                                <TransactionFieldLabel label={config.labels.documentNumber} required />
                            </div>

                            <div className="max-w-[282px] w-full justify-self-end">
                                {isDetail ? (
                                    <TextInput
                                        value={values.documentNumber}
                                        readOnly
                                        trailing={<span className="text-2xl font-semibold text-brand-dark">×</span>}
                                        className="h-[40px] rounded-[4px] border-ui-border w-full"
                                        inputClassName="text-xs sm:text-sm text-brand-dark"
                                        trailingClassName="px-3"
                                    />
                                ) : (
                                    <SelectField
                                        value={values.numberingType}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                numberingType: event.target.value,
                                            }))
                                        }
                                        className="h-[40px] rounded-[4px] border-ui-border w-full"
                                        selectClassName="text-xs sm:text-sm text-brand-dark"
                                    >
                                        {config.numberingOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </SelectField>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
                {/* Left Column */}
                <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.date} required />
                        <div className="max-w-[282px] w-full">
                            <TransactionDateInput
                                value={values.date}
                                onChange={(nextDisplayValue) =>
                                    setValues((current) => ({
                                        ...current,
                                        date: nextDisplayValue,
                                    }))
                                }
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px] md:pl-12 lg:pl-16 xl:pl-20 2xl:pl-28">
                    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                        <div className="flex items-center justify-start gap-4">
                            <TransactionFieldLabel label={config.labels.documentNumber} required />
                            {!isDetail && (
                                <TransactionSwitch
                                    checked={values.autoNumber}
                                    onChange={(nextValue) =>
                                        setValues((current) => ({
                                            ...current,
                                            autoNumber: nextValue,
                                        }))
                                    }
                                />
                            )}
                        </div>

                        <div className="max-w-[282px] w-full justify-self-end">
                            {isDetail ? (
                                <TextInput
                                    value={values.documentNumber}
                                    readOnly
                                    trailing={<span className="text-2xl font-semibold text-brand-dark">×</span>}
                                    className="h-[40px] rounded-[4px] border-ui-border w-full"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                    trailingClassName="px-3"
                                />
                            ) : values.autoNumber ? (
                                <SelectField
                                    value={values.numberingType}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            numberingType: event.target.value,
                                        }))
                                    }
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
                                    value={values.documentNumber}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            documentNumber: event.target.value,
                                        }))
                                    }
                                    onBlur={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            documentNumber: event.target.value.trim(),
                                        }))
                                    }
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
