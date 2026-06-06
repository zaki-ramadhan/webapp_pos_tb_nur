import React from 'react';
import RadioField from '@/components/ui/RadioField';
import CheckboxField from '@/components/ui/CheckboxField';
import {
    LimitationsTimingRule,
    LimitationsSearchBlock,
    LimitationsNestedRadioBlock,
} from './LimitationsTimingBlock';

export const LIMITATIONS_USER_OPTIONS = [
    'Zaki Ramadhan (piscokpiscok2610@gmail.com)',
    'Test User (test@example.com)',
    'H. Nurhasan (owner@tbnur.com)',
    'Siti Aminah (siti@tbnur.com)',
    'Joko Widodo (joko@tbnur.com)',
    'Budi Santoso (budi@tbnur.com)',
    'Andi Pratama (andi@tbnur.com)',
    'Rudi Hermawan (rudi@tbnur.com)',
];

export function LimitationsSimpleRadioGroup({ row, onChange }) {
    return (
        <div className="space-y-1.5 pt-0.5">
            {(row.options ?? []).map((option) => (
                <RadioField
                    key={option.value}
                    id={`${row.id}-${option.value}`}
                    name={row.name ?? row.id}
                    checked={row.value === option.value}
                    disabled={option.disabled}
                    size="sm"
                    align="center"
                    label={
                        <span className="whitespace-pre-line text-[14px] md:text-[15px] leading-6">
                            {option.label}
                        </span>
                    }
                    className="gap-3"
                    labelClassName="text-[14px] md:text-[15px] leading-6"
                    onChange={() => onChange(row.id, option.value)}
                />
            ))}
        </div>
    );
}

export function LimitationsAdvancedRadioGroup({
    row,
    onChange,
    onToggleTimingRule,
    onChangeTimingRule,
    onChangeNestedRadio,
}) {
    return (
        <div className="space-y-3 pt-0.5">
            {(row.options ?? []).map((option) => (
                <div key={option.value} className="space-y-2">
                    <RadioField
                        id={`${row.id}-${option.value}`}
                        name={row.name ?? row.id}
                        checked={row.value === option.value}
                        disabled={option.disabled}
                        size="sm"
                        align="center"
                        label={
                            <span className="whitespace-pre-line text-[14px] md:text-[15px] leading-6">
                                {option.label}
                            </span>
                        }
                        className="gap-3"
                        labelClassName="text-[14px] md:text-[15px] leading-6"
                        onChange={() => onChange(row.id, option.value)}
                    />

                    {row.value === option.value && option.blocks?.length ? (
                        <div className="space-y-2.5 pl-10">
                            {option.blocks.map((block) => {
                                if (block.type === 'timing-rule') {
                                    return (
                                        <LimitationsTimingRule
                                            key={block.id}
                                            block={block}
                                            rowId={row.id}
                                            optionValue={option.value}
                                            onToggle={onToggleTimingRule}
                                            onChangeBlock={onChangeTimingRule}
                                        />
                                    );
                                }

                                if (block.type === 'search-row') {
                                    return (
                                        <LimitationsSearchBlock
                                            key={block.id}
                                            block={block}
                                            rowId={row.id}
                                            optionValue={option.value}
                                            onChangeBlock={onChangeTimingRule}
                                        />
                                    );
                                }

                                return (
                                    <LimitationsNestedRadioBlock
                                        key={block.id}
                                        block={block}
                                        rowId={row.id}
                                        optionValue={option.value}
                                        onChangeNestedRadio={onChangeNestedRadio}
                                    />
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

export function LimitationsCheckboxList({ row, onToggleItem }) {
    return (
        <div className="space-y-1.5 pt-0.5">
            {(row.items ?? []).map((item) => (
                <CheckboxField
                    key={item.id}
                    id={`${row.id}-${item.id}`}
                    checked={Boolean(item.checked)}
                    disabled={Boolean(item.disabled)}
                    size="sm"
                    align="center"
                    label={
                        <span className="text-[14px] md:text-[15px] leading-6 text-[#111827]">
                            {item.label}
                        </span>
                    }
                    className="gap-3"
                    labelClassName="text-[14px] md:text-[15px] leading-6"
                    inputClassName="rounded-[5px] border-[#b6c1d1]"
                    onChange={(event) => onToggleItem(row.id, item.id, event.target.checked)}
                />
            ))}
        </div>
    );
}
