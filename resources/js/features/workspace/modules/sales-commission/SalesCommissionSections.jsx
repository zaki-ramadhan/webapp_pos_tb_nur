import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';

function FormFieldRow({ label, required = false, align = 'center', children }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[440px_minmax(0,1fr)] ${align === 'start' ? 'lg:items-start' : 'lg:items-center'}`.trim()}>
            <label className={`${align === 'start' ? 'pt-2' : ''} text-base leading-[1.35] text-[#1f2436]`.trim()}>
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function RadioOption({ checked, label, onChange }) {
    return (
        <label className="inline-flex items-center gap-3 text-xs sm:text-sm text-[#1f2436]">
            <input
                type="radio"
                checked={checked}
                onChange={onChange}
                className="h-[22px] w-[22px] border-[#cfd6e2] text-[#2353a0] focus:ring-[#2353a0]/20"
            />
            <span>{label}</span>
        </label>
    );
}

export function SalesCommissionCommissionTab({ config, values, setValues }) {
    const setValue = (field, nextValue) =>
        setValues((current) => ({
            ...current,
            [field]: nextValue,
        }));

    const toggleOrderSelection = (optionId, checked) =>
        setValues((current) => ({
            ...current,
            orderSelections: checked
                ? [...new Set([...current.orderSelections, optionId])]
                : current.orderSelections.filter((value) => value !== optionId),
        }));

    return (
        <div className="space-y-3">
            <FormFieldRow label={config.labels.period}>
                <div className="space-y-3">
                    {config.periodOptions.map((option) => (
                        <RadioOption
                            key={option.id}
                            checked={values.periodType === option.id}
                            label={option.label}
                            onChange={() => setValue('periodType', option.id)}
                        />
                    ))}
                </div>
            </FormFieldRow>

            <FormFieldRow label={config.labels.name} required>
                <TextInput
                    value={values.name}
                    onChange={(event) => setValue('name', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
                />
            </FormFieldRow>

            <FormFieldRow label={config.labels.salespeople} required>
                <div className="space-y-3">
                    {config.salespeopleOptions.map((option) => (
                        <RadioOption
                            key={option.id}
                            checked={values.sellerScope === option.id}
                            label={option.label}
                            onChange={() => setValue('sellerScope', option.id)}
                        />
                    ))}
                </div>
            </FormFieldRow>

            <FormFieldRow label={config.labels.order} required align="start">
                <div className="grid gap-3 xl:grid-cols-5">
                    {config.orderOptions.map((option) => (
                        <CheckboxField
                            key={option.id}
                            id={`commission-order-${option.id}`}
                            label={option.label}
                            checked={values.orderSelections.includes(option.id)}
                            onChange={(event) => toggleOrderSelection(option.id, event.target.checked)}
                            align="center"
                            labelClassName="text-base"
                            inputClassName="mt-0 h-[18px] w-[18px]"
                            containerClassName="w-auto"
                        />
                    ))}
                </div>
            </FormFieldRow>

            <FormFieldRow label={config.labels.productScope} required>
                <SelectField
                    value={values.productScope}
                    onChange={(event) => setValue('productScope', event.target.value)}
                    className="h-[40px] max-w-[426px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-xs sm:text-sm text-[#1f2436]"
                >
                    {config.productScopeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </FormFieldRow>

            <FormFieldRow label={config.labels.supplierScope} required>
                <SelectField
                    value={values.supplierScope}
                    onChange={(event) => setValue('supplierScope', event.target.value)}
                    className="h-[40px] max-w-[426px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-xs sm:text-sm text-[#1f2436]"
                >
                    {config.supplierScopeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </FormFieldRow>

            <FormFieldRow label={config.labels.condition} required align="start">
                <div className="space-y-3">
                    <RadioOption
                        checked={values.conditionType === 'none'}
                        label={config.conditionOptions.none}
                        onChange={() => setValue('conditionType', 'none')}
                    />

                    <div className="grid gap-3 xl:grid-cols-[440px_1fr_70px_1fr] xl:items-center">
                        <RadioOption
                            checked={values.conditionType === 'sales-range'}
                            label={config.conditionOptions.salesRange}
                            onChange={() => setValue('conditionType', 'sales-range')}
                        />
                        <TextInput
                            value={values.salesValueFrom}
                            onChange={(event) => setValue('salesValueFrom', event.target.value)}
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                        <div className="text-center text-xs sm:text-sm text-[#1f2436]">s/d</div>
                        <TextInput
                            value={values.salesValueTo}
                            onChange={(event) => setValue('salesValueTo', event.target.value)}
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[440px_1fr_70px_1fr] xl:items-center">
                        <RadioOption
                            checked={values.conditionType === 'quantity-range'}
                            label={config.conditionOptions.quantityRange}
                            onChange={() => setValue('conditionType', 'quantity-range')}
                        />
                        <TextInput
                            value={values.quantityFrom}
                            onChange={(event) => setValue('quantityFrom', event.target.value)}
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                        <div className="text-center text-xs sm:text-sm text-[#1f2436]">s/d</div>
                        <TextInput
                            value={values.quantityTo}
                            onChange={(event) => setValue('quantityTo', event.target.value)}
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[440px_1fr_420px] xl:items-center">
                        <RadioOption
                            checked={values.conditionType === 'quantity-unit'}
                            label={config.conditionOptions.quantityUnit}
                            onChange={() => setValue('conditionType', 'quantity-unit')}
                        />
                        <TextInput
                            value={values.quantityUnit}
                            onChange={(event) => setValue('quantityUnit', event.target.value)}
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                        <div className="text-xs sm:text-sm text-[#1f2436]">{config.conditionUnitLabel}</div>
                    </div>
                </div>
            </FormFieldRow>

            <FormFieldRow label={config.labels.reward} required>
                <div className="grid gap-3 xl:grid-cols-[170px_270px_120px_420px] xl:items-center">
                    <SelectField
                        value={values.rewardType}
                        onChange={(event) => setValue('rewardType', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-xs sm:text-sm text-[#1f2436]"
                    >
                        {config.rewardTypeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>

                    <TextInput
                        value={values.rewardValue}
                        onChange={(event) => setValue('rewardValue', event.target.value)}
                        className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
                    />

                    <div className="text-center text-xs sm:text-sm text-[#1f2436]">{config.rewardMiddleLabel}</div>

                    <SelectField
                        value={values.rewardBase}
                        onChange={(event) => setValue('rewardBase', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-xs sm:text-sm text-[#1f2436]"
                    >
                        {config.rewardBaseOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </div>
            </FormFieldRow>
        </div>
    );
}

export function SalesCommissionOtherTab({ config, values, setValues }) {
    return (
        <div className="space-y-3">
            <FormFieldRow label={config.labels.notes} align="start">
                <TextareaField
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={4}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[80px] text-xs sm:text-sm text-[#1f2436]"
                />
            </FormFieldRow>

            <FormFieldRow label={config.labels.inactive}>
                <CheckboxField
                    id="sales-commission-inactive"
                    label={config.inactiveLabel}
                    checked={values.inactive}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            inactive: event.target.checked,
                        }))
                    }
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </FormFieldRow>
        </div>
    );
}
