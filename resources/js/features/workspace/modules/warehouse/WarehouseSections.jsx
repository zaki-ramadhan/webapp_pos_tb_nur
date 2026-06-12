import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { CloseIcon } from '@/features/workspace/shared/Icons';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';

export function WarehouseFieldRow({ label, required = false, children, className = '' }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
            <TransactionFieldLabel label={label} required={required} className="pt-2 leading-6" />
            <div>{children}</div>
        </div>
    );
}

export function ClearableTextInput({ id, name, value, onChange, placeholder = '', className = '', inputClassName = '', ...props }) {
    return (
        <TextInput
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            inputClassName={`text-xs sm:text-sm text-[#1f2436] ${inputClassName}`.trim()}
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#111827] transition hover:bg-[#eef2f7]"
                        aria-label="Kosongkan isian"
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null
            }
            trailingClassName={value ? 'pr-2' : ''}
            {...props}
        />
    );
}

export function PrefixedTextArea({ prefix, value, onChange }) {
    return (
        <div className="flex overflow-hidden rounded-[4px] border border-[#cfd6e2] bg-white">
            <div className="flex min-w-[40px] items-start justify-start border-r border-[#cfd6e2] bg-[#f3f3f4] px-2 py-3 text-xs sm:text-sm text-[#8b94a7]">
                {prefix}
            </div>
            <textarea
                value={value}
                onChange={onChange}
                rows={4}
                className="min-h-[74px] w-full resize-none px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none"
            />
        </div>
    );
}

export function PrefixedInput({ prefix, value, onChange, className = '', ...props }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            prefixClassName="min-w-[48px] border-[#cfd6e2] bg-[#f3f3f4] px-2 text-xs sm:text-sm text-[#8b94a7]"
            inputClassName="text-xs sm:text-sm text-[#1f2436]"
            {...props}
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#111827] transition hover:bg-[#eef2f7]"
                        aria-label={`Kosongkan ${prefix}`}
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null
            }
            trailingClassName={value ? 'pr-2' : ''}
        />
    );
}

export function WarehouseGeneralTab({ config, values, onChange, isDetail }) {
    return (
        <div className="space-y-3">
            <WarehouseFieldRow label={config.labels.name} required>
                <ClearableTextInput id="name" name="name" value={values.name} onChange={(event) => onChange('name', event.target.value)} />
            </WarehouseFieldRow>

            <WarehouseFieldRow label={config.labels.description}>
                <TextareaField
                    value={values.description}
                    onChange={(event) => onChange('description', event.target.value)}
                    rows={4}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[76px] text-xs sm:text-sm text-[#1f2436]"
                />
            </WarehouseFieldRow>

            <WarehouseFieldRow label={config.labels.responsiblePerson}>
                <ClearableTextInput
                    value={values.responsiblePerson}
                    onChange={(event) => onChange('responsiblePerson', event.target.value)}
                    className="max-w-[420px]"
                />
            </WarehouseFieldRow>

            <div className="space-y-3 lg:pl-[260px]">
                <CheckboxField
                    id="warehouse-damaged"
                    label={config.labels.damagedWarehouse}
                    checked={values.isDamagedWarehouse}
                    onChange={(event) => onChange('isDamagedWarehouse', event.target.checked)}
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />

                {isDetail ? (
                    <CheckboxField
                        id="warehouse-inactive"
                        label={config.labels.inactive}
                        checked={values.inactive}
                        onChange={(event) => onChange('inactive', event.target.checked)}
                        align="center"
                        labelClassName="text-base"
                        inputClassName="mt-0 h-[18px] w-[18px]"
                        containerClassName="w-auto"
                    />
                ) : null}
            </div>
        </div>
    );
}

export function WarehouseAddressTab({ config, values, onChange }) {
    const handleSelectCity = (item) => {
        onChange('city', item.city);
        onChange('province', item.province);
        onChange('postalCode', item.postalCode);
        onChange('country', item.country);
    };

    return (
        <WarehouseFieldRow label={config.labels.address}>
            <div className="max-w-[720px] space-y-3">
                <PrefixedTextArea prefix="Jalan" value={values.street} onChange={(event) => onChange('street', event.target.value)} />

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <CityAutocompleteInput
                        value={values.city}
                        onChange={(nextValue) => onChange('city', nextValue)}
                        onSelectCity={handleSelectCity}
                        prefix="Kota"
                        prefixClassName="min-w-[48px] border-[#cfd6e2] bg-[#f3f3f4] px-2 text-xs sm:text-sm text-[#8b94a7]"
                        dropdownLeftOffsetClassName="left-[48px]"
                    />
                    <PrefixedInput prefix="K.Pos" value={values.postalCode} onChange={(event) => onChange('postalCode', event.target.value)} />
                </div>

                <PrefixedInput prefix="Provinsi" value={values.province} onChange={(event) => onChange('province', event.target.value)} />
                <PrefixedInput prefix="Negara" value={values.country} onChange={(event) => onChange('country', event.target.value)} />
            </div>
        </WarehouseFieldRow>
    );
}

export function WarehouseUsersTab({ config, values, onChange, isDetail }) {
    return (
        <div className="space-y-4">
            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-lg font-medium text-[#1f2436]">{config.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="warehouse-all-users"
                label={config.userAccess.allUsersLabel}
                checked={values.allUsers}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-base"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName="w-auto"
            />

            {!values.allUsers ? (
                <div className="space-y-3">
                    <div className="pt-1">
                        <h3 className="text-lg font-medium text-[#1f2436]">{config.userAccess.limitedTitle}</h3>
                    </div>

                    <WarehouseFieldRow label={config.labels.groupBranch}>
                        <ChipLookupField
                            values={values.groupBranch}
                            placeholder={config.userAccess.groupBranchPlaceholder}
                            searchLabel="Cari grup/cabang"
                            onRemove={(value) => onChange('groupBranch', values.groupBranch.filter((item) => item !== value))}
                            className="max-w-[1320px]"
                            contentClassName="items-start"
                        />
                    </WarehouseFieldRow>

                    <WarehouseFieldRow label={config.labels.user}>
                        <ChipLookupField
                            values={values.users}
                            placeholder={config.userAccess.userPlaceholder}
                            searchLabel="Cari pengguna"
                            onRemove={(value) => onChange('users', values.users.filter((item) => item !== value))}
                            className="max-w-[1320px]"
                        />
                    </WarehouseFieldRow>
                </div>
            ) : isDetail ? null : null}
        </div>
    );
}
