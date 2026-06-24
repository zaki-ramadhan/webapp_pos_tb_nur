import React from 'react';
import CheckboxField from '@/components/ui/CheckboxField';
import RadioField from '@/components/ui/RadioField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import PreferenceLookupAutocomplete from './PreferenceLookupAutocomplete';
import { LIMITATIONS_USER_OPTIONS } from './LimitationsRadioGroup';

export function LimitationsTimingRule({ block, rowId, optionValue, onToggle, onChangeBlock }) {
    return (
        <div className="flex flex-wrap items-center gap-2.5">
            <CheckboxField
                id={`${rowId}-${optionValue}-${block.id}`}
                checked={Boolean(block.option?.checked)}
                disabled={Boolean(block.option?.disabled)}
                size="sm"
                align="center"
                label={<span className="text-xs sm:text-sm">{block.label}</span>}
                className="gap-2"
                labelClassName="text-xs sm:text-sm leading-6"
                inputClassName="rounded-[5px] border-tab-active-border-x"
                containerClassName="w-auto shrink-0"
                onChange={(event) =>
                    onToggle(rowId, optionValue, block.id, event.target.checked)
                }
            />

            <TextInput
                id={`${block.id}-before-value`}
                value={block.beforeValue ?? ''}
                containerClassName="w-[85px]"
                className="h-[38px] w-[85px] rounded-[6px] border-ui-border"
                inputClassName="px-3 text-left text-xs sm:text-sm text-text-darkest"
                maxLength={3}
                clearable={false}
                onChange={(event) =>
                    onChangeBlock(rowId, optionValue, block.id, 'beforeValue', event.target.value)
                }
            />

            <SelectField
                id={`${block.id}-before-unit`}
                value={block.beforeUnit ?? ''}
                containerClassName="w-[90px]"
                className="h-[38px] w-[90px] rounded-[6px] border-ui-border"
                selectClassName="text-xs sm:text-sm text-text-darkest"
                onChange={(event) =>
                    onChangeBlock(rowId, optionValue, block.id, 'beforeUnit', event.target.value)
                }
            >
                {(block.unitOptions ?? []).map((unit) => (
                    <option key={unit} value={unit}>
                        {unit}
                    </option>
                ))}
            </SelectField>

            <span className="text-xs sm:text-sm leading-6 text-text-darkest">sebelum atau</span>

            <TextInput
                id={`${block.id}-after-value`}
                value={block.afterValue ?? ''}
                containerClassName="w-[85px]"
                className="h-[38px] w-[85px] rounded-[6px] border-ui-border"
                inputClassName="px-3 text-left text-xs sm:text-sm text-text-darkest"
                maxLength={3}
                clearable={false}
                onChange={(event) =>
                    onChangeBlock(rowId, optionValue, block.id, 'afterValue', event.target.value)
                }
            />

            <SelectField
                id={`${block.id}-after-unit`}
                value={block.afterUnit ?? ''}
                containerClassName="w-[90px]"
                className="h-[38px] w-[90px] rounded-[6px] border-ui-border"
                selectClassName="text-xs sm:text-sm text-text-darkest"
                onChange={(event) =>
                    onChangeBlock(rowId, optionValue, block.id, 'afterUnit', event.target.value)
                }
            >
                {(block.unitOptions ?? []).map((unit) => (
                    <option key={unit} value={unit}>
                        {unit}
                    </option>
                ))}
            </SelectField>

            <span className="text-xs sm:text-sm leading-6 text-text-darkest">sesudah periode saat ini</span>
        </div>
    );
}

export function LimitationsSearchBlock({ block, rowId, optionValue, onChangeBlock }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
            <div className="text-xs sm:text-sm leading-6 text-text-darkest">{block.label}</div>
            <div className="max-w-[560px]">
                <PreferenceLookupAutocomplete
                    field={{
                        id: block.id,
                        label: block.label,
                        disabled: block.control?.disabled,
                        placeholder: block.control?.placeholder ?? 'Cari/Pilih Pengguna...'
                    }}
                    value={block.control?.value}
                    onChange={(fieldId, option) => {
                        onChangeBlock(
                            rowId,
                            optionValue,
                            block.id,
                            'control',
                            {
                                ...(block.control ?? {}),
                                value: option,
                            },
                        );
                    }}
                    options={LIMITATIONS_USER_OPTIONS}
                />
            </div>
        </div>
    );
}

export function LimitationsNestedRadioBlock({ block, rowId, optionValue, onChangeNestedRadio }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
            <div className="text-xs sm:text-sm leading-6 text-text-darkest">{block.label}</div>
            <div className="space-y-1.5">
                {(block.options ?? []).map((item) => (
                    <RadioField
                        key={item.value}
                        id={`${rowId}-${optionValue}-${block.id}-${item.value}`}
                        name={`${rowId}-${optionValue}-${block.id}`}
                        checked={block.value === item.value}
                        disabled={item.disabled}
                        size="sm"
                        align="center"
                        label={<span className="text-xs sm:text-sm leading-6">{item.label}</span>}
                        className="gap-3"
                        labelClassName="text-xs sm:text-sm leading-6"
                        onChange={() =>
                            onChangeNestedRadio(rowId, optionValue, block.id, item.value)
                        }
                    />
                ))}
            </div>
        </div>
    );
}
