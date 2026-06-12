import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import { CloseIcon } from '@/features/workspace/shared/Icons';

function ItemCategoryFieldRow({ label, required = false, children, className = '' }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
            <label className="pt-2 text-xs sm:text-sm leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function ClearableTextInput({ value, onChange, className = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            inputClassName="text-xs sm:text-sm text-[#1f2436]"
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#111827] transition hover:bg-[#eef2f7]"
                        aria-label="Kosongkan nama kategori"
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null
            }
            trailingClassName={value ? 'pr-2' : ''}
        />
    );
}

export function ItemCategoryGeneralTab({ config, values, onChange }) {
    return (
        <div className="space-y-3">
            <ItemCategoryFieldRow label={config.labels.name} required>
                <ClearableTextInput value={values.name} onChange={(event) => onChange('name', event.target.value)} className="max-w-[420px]" />
            </ItemCategoryFieldRow>

            <ItemCategoryFieldRow label={config.labels.isDefault}>
                <CheckboxField
                    id="item-category-default"
                    label={config.labels.yes}
                    checked={values.isDefault}
                    onChange={(event) => onChange('isDefault', event.target.checked)}
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </ItemCategoryFieldRow>

            <div className="lg:pl-[280px]">
                <CheckboxField
                    id="item-category-subcategory"
                    label={config.labels.isSubCategory}
                    checked={values.isSubCategory}
                    onChange={(event) => onChange('isSubCategory', event.target.checked)}
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </div>
        </div>
    );
}

export function ItemCategoryAccountsTab({ config, values, onAccountChange }) {
    return (
        <div className="max-w-[1180px] space-y-3">
            <p className="pt-1 text-base italic leading-7 text-[#1f2436]">{config.accountIntro}</p>

            <div className="space-y-3">
                {config.accountFields.map((field) => (
                    <ItemCategoryFieldRow key={field.id} label={field.label}>
                        <AccountLookupField
                            value={values.accounts[field.id] ?? ''}
                            placeholder={config.accountPlaceholder}
                            searchLabel={`Cari ${field.label}`}
                            onRemove={() => onAccountChange(field.id, '')}
                            onSelectAccount={(_, label) => onAccountChange(field.id, label)}
                            dialogTitle={`Pilih ${field.label}`}
                            className="max-w-[640px]"
                        />
                    </ItemCategoryFieldRow>
                ))}
            </div>

            <div className="flex items-start gap-3 pt-1">
                <span className="mt-0.5 h-6 w-[4px] shrink-0 rounded-full bg-[#b9bdc5]" />
                <p className="text-sm italic leading-6 text-[#ef513f]">{config.accountNote}</p>
            </div>
        </div>
    );
}
