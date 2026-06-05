import CheckboxField from '@/components/ui/CheckboxField';
import RadioField from '@/components/ui/RadioField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import Tooltip from '@/components/ui/Tooltip';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import { InfoIcon, SearchIcon } from '@/features/workspace/shared/Icons';

export function LimitationsSimpleRadioGroup({ row, onChange }) {
    return (
        <div className="space-y-3 pt-1">
            {(row.options ?? []).map((option) => (
                <RadioField
                    key={option.value}
                    id={`${row.id}-${option.value}`}
                    name={row.name ?? row.id}
                    checked={row.value === option.value}
                    disabled={option.disabled}
                    size="md"
                    align="center"
                    label={
                        <span className="whitespace-pre-line text-[17px] leading-8">
                            {option.label}
                        </span>
                    }
                    className="gap-3"
                    onChange={() => onChange(row.id, option.value)}
                />
            ))}
        </div>
    );
}

export function LimitationsTimingRule({ block, rowId, optionValue, onToggle, onChangeBlock }) {
    return (
        <div className="flex flex-wrap items-center gap-2.5">
            <CheckboxField
                id={`${rowId}-${optionValue}-${block.id}`}
                checked={Boolean(block.option?.checked)}
                disabled={Boolean(block.option?.disabled)}
                size="sm"
                align="center"
                label={<span className="text-[17px]">{block.label}</span>}
                className="gap-2"
                inputClassName="rounded-[5px] border-[#b6c1d1]"
                onChange={(event) =>
                    onToggle(rowId, optionValue, block.id, event.target.checked)
                }
            />

            <TextInput
                id={`${block.id}-before-value`}
                value={block.beforeValue ?? ''}
                containerClassName="w-[60px]"
                className="h-[44px] w-[60px] rounded-[6px] border-[#cfd6e2]"
                inputClassName="px-2 text-center text-[15px] text-[#111827]"
                onChange={(event) =>
                    onChangeBlock(rowId, optionValue, block.id, 'beforeValue', event.target.value)
                }
            />

            <SelectField
                id={`${block.id}-before-unit`}
                value={block.beforeUnit ?? ''}
                containerClassName="w-[128px]"
                className="h-[44px] w-[128px] rounded-[6px] border-[#cfd6e2]"
                selectClassName="text-[15px] text-[#111827]"
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

            <span className="text-[17px] leading-8 text-[#111827]">sebelum atau</span>

            <TextInput
                id={`${block.id}-after-value`}
                value={block.afterValue ?? ''}
                containerClassName="w-[60px]"
                className="h-[44px] w-[60px] rounded-[6px] border-[#cfd6e2]"
                inputClassName="px-2 text-center text-[15px] text-[#111827]"
                onChange={(event) =>
                    onChangeBlock(rowId, optionValue, block.id, 'afterValue', event.target.value)
                }
            />

            <SelectField
                id={`${block.id}-after-unit`}
                value={block.afterUnit ?? ''}
                containerClassName="w-[128px]"
                className="h-[44px] w-[128px] rounded-[6px] border-[#cfd6e2]"
                selectClassName="text-[15px] text-[#111827]"
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

            <span className="text-[17px] leading-8 text-[#111827]">sesudah periode saat ini</span>
        </div>
    );
}

export function LimitationsSearchBlock({ block, rowId, optionValue, onChangeBlock }) {
    return (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
            <div className="text-[17px] leading-8 text-[#111827]">{block.label}</div>
            <div className="max-w-[560px]">
                <TextInput
                    id={`${block.id}-search`}
                    value={block.control?.value ?? ''}
                    placeholder={block.control?.placeholder}
                    className="h-[44px] rounded-[6px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#111827]"
                    trailing={<SearchIcon className="h-5 w-5 text-[#1f2937]" />}
                    onChange={(event) =>
                        onChangeBlock(
                            rowId,
                            optionValue,
                            block.id,
                            'control',
                            {
                                ...(block.control ?? {}),
                                value: event.target.value,
                            },
                        )
                    }
                />
            </div>
        </div>
    );
}

export function LimitationsNestedRadioBlock({ block, rowId, optionValue, onChangeNestedRadio }) {
    return (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
            <div className="text-[17px] leading-8 text-[#111827]">{block.label}</div>
            <div className="space-y-3">
                {(block.options ?? []).map((item) => (
                    <RadioField
                        key={item.value}
                        id={`${rowId}-${optionValue}-${block.id}-${item.value}`}
                        name={`${rowId}-${optionValue}-${block.id}`}
                        checked={block.value === item.value}
                        disabled={item.disabled}
                        size="md"
                        align="center"
                        label={<span className="text-[17px] leading-8">{item.label}</span>}
                        className="gap-3"
                        onChange={() =>
                            onChangeNestedRadio(rowId, optionValue, block.id, item.value)
                        }
                    />
                ))}
            </div>
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
        <div className="space-y-4 pt-1">
            {(row.options ?? []).map((option) => (
                <div key={option.value} className="space-y-3">
                    <RadioField
                        id={`${row.id}-${option.value}`}
                        name={row.name ?? row.id}
                        checked={row.value === option.value}
                        disabled={option.disabled}
                        size="md"
                        align="center"
                        label={
                            <span className="whitespace-pre-line text-[17px] leading-8">
                                {option.label}
                            </span>
                        }
                        className="gap-3"
                        onChange={() => onChange(row.id, option.value)}
                    />

                    {row.value === option.value && option.blocks?.length ? (
                        <div className="space-y-4 pl-10">
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

function getLimitationInfo(id, label) {
    const map = {
        'process-draft-transaction': 'Mengizinkan pemrosesan dokumen/transaksi yang saat ini masih dalam status rancangan atau pengajuan persetujuan.',
        'print-draft-transaction': 'Mengizinkan pencetakan atau pengiriman email untuk transaksi yang belum disetujui (Draf/Pengajuan/Ditolak).',
    };
    return map[id] || `Informasi tentang ${label}`;
}

export function LimitationsCheckboxList({ row, onToggleItem }) {
    return (
        <div className="space-y-3 pt-1">
            {(row.items ?? []).map((item) => (
                <CheckboxField
                    key={item.id}
                    id={`${row.id}-${item.id}`}
                    checked={Boolean(item.checked)}
                    disabled={Boolean(item.disabled)}
                    size="sm"
                    align="center"
                    label={
                        <span className="text-[17px] leading-8 text-[#111827]">
                            {item.label}
                            {item.showInfo ? (
                                <Tooltip content={getLimitationInfo(item.id, item.label)} portal>
                                    <InfoIcon className="ml-2 inline h-[18px] w-[18px] align-text-bottom text-[#111827] cursor-help" />
                                </Tooltip>
                            ) : null}
                        </span>
                    }
                    className="gap-3"
                    inputClassName="rounded-[5px] border-[#b6c1d1]"
                    onChange={(event) => onToggleItem(row.id, item.id, event.target.checked)}
                />
            ))}
        </div>
    );
}

export function LimitationsSection({
    section,
    onChangeRadio,
    onChangeAdvancedRadio,
    onToggleTimingRule,
    onChangeTimingRule,
    onChangeNestedRadio,
    onToggleCheckboxItem,
}) {
    return (
        <section className="space-y-5">
            <PreferencesSectionHeading icon={section.icon} title={section.title} />

            <div className="space-y-4">
                {(section.rows ?? []).map((row) => {
                    if (row.type === 'advanced-radio-group') {
                        return (
                            <LimitationsAdvancedRadioGroup
                                key={row.id}
                                row={row}
                                onChange={onChangeAdvancedRadio}
                                onToggleTimingRule={onToggleTimingRule}
                                onChangeTimingRule={onChangeTimingRule}
                                onChangeNestedRadio={onChangeNestedRadio}
                            />
                        );
                    }

                    if (row.type === 'checkbox-list') {
                        return (
                            <LimitationsCheckboxList
                                key={row.id}
                                row={row}
                                onToggleItem={onToggleCheckboxItem}
                            />
                        );
                    }

                    return (
                        <LimitationsSimpleRadioGroup
                            key={row.id}
                            row={row}
                            onChange={onChangeRadio}
                        />
                    );
                })}
            </div>
        </section>
    );
}
