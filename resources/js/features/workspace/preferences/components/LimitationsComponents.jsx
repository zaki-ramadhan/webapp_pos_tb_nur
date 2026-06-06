import CheckboxField from '@/components/ui/CheckboxField';
import RadioField from '@/components/ui/RadioField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import { SearchIcon } from '@/features/workspace/shared/Icons';
import PreferenceLookupAutocomplete from './PreferenceLookupAutocomplete';

const LIMITATIONS_USER_OPTIONS = [
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

export function LimitationsTimingRule({ block, rowId, optionValue, onToggle, onChangeBlock }) {
    return (
        <div className="flex flex-wrap items-center gap-2.5">
            <CheckboxField
                id={`${rowId}-${optionValue}-${block.id}`}
                checked={Boolean(block.option?.checked)}
                disabled={Boolean(block.option?.disabled)}
                size="sm"
                align="center"
                label={<span className="text-[14px] md:text-[15px]">{block.label}</span>}
                className="gap-2"
                labelClassName="text-[14px] md:text-[15px] leading-6"
                inputClassName="rounded-[5px] border-[#b6c1d1]"
                containerClassName="w-auto shrink-0"
                onChange={(event) =>
                    onToggle(rowId, optionValue, block.id, event.target.checked)
                }
            />

            <TextInput
                id={`${block.id}-before-value`}
                value={block.beforeValue ?? ''}
                containerClassName="w-[60px]"
                className="h-[38px] w-[60px] rounded-[6px] border-[#cfd6e2]"
                inputClassName="px-2 text-left text-[14px] md:text-[15px] text-[#111827]"
                maxLength={3}
                onChange={(event) =>
                    onChangeBlock(rowId, optionValue, block.id, 'beforeValue', event.target.value)
                }
            />

            <SelectField
                id={`${block.id}-before-unit`}
                value={block.beforeUnit ?? ''}
                containerClassName="w-[90px]"
                className="h-[38px] w-[90px] rounded-[6px] border-[#cfd6e2]"
                selectClassName="text-[14px] md:text-[15px] text-[#111827]"
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

            <span className="text-[14px] md:text-[15px] leading-6 text-[#111827]">sebelum atau</span>

            <TextInput
                id={`${block.id}-after-value`}
                value={block.afterValue ?? ''}
                containerClassName="w-[60px]"
                className="h-[38px] w-[60px] rounded-[6px] border-[#cfd6e2]"
                inputClassName="px-2 text-left text-[14px] md:text-[15px] text-[#111827]"
                maxLength={3}
                onChange={(event) =>
                    onChangeBlock(rowId, optionValue, block.id, 'afterValue', event.target.value)
                }
            />

            <SelectField
                id={`${block.id}-after-unit`}
                value={block.afterUnit ?? ''}
                containerClassName="w-[90px]"
                className="h-[38px] w-[90px] rounded-[6px] border-[#cfd6e2]"
                selectClassName="text-[14px] md:text-[15px] text-[#111827]"
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

            <span className="text-[14px] md:text-[15px] leading-6 text-[#111827]">sesudah periode saat ini</span>
        </div>
    );
}

export function LimitationsSearchBlock({ block, rowId, optionValue, onChangeBlock }) {
    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
            <div className="text-[14px] md:text-[15px] leading-6 text-[#111827]">{block.label}</div>
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
            <div className="text-[14px] md:text-[15px] leading-6 text-[#111827]">{block.label}</div>
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
                        label={<span className="text-[14px] md:text-[15px] leading-6">{item.label}</span>}
                        className="gap-3"
                        labelClassName="text-[14px] md:text-[15px] leading-6"
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

function getLimitationInfo(id, label) {
    const map = {
        'process-draft-transaction': 'Mengizinkan pemrosesan dokumen/transaksi yang saat ini masih dalam status rancangan atau pengajuan persetujuan.',
        'print-draft-transaction': 'Mengizinkan pencetakan atau pengiriman email untuk transaksi yang belum disetujui (Draf/Pengajuan/Ditolak).',
    };
    return map[id] || `Informasi tentang ${label}`;
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
        <section className="space-y-3.5">
            <PreferencesSectionHeading icon={section.icon} title={section.title} />

            <div className="space-y-2.5">
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
