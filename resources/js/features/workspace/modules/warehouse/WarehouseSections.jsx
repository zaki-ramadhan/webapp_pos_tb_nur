import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { CloseIcon } from '@/features/workspace/shared/Icons';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';

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
            className={`h-[40px] rounded-[4px] border-ui-border ${className}`.trim()}
            inputClassName={`text-xs sm:text-sm text-brand-dark ${inputClassName}`.trim()}
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-text-darkest transition hover:bg-bg-workspace-light"
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
        <div className="flex overflow-hidden rounded-[4px] border border-slate-400 bg-white">
            <div className="flex min-w-[92px] items-start justify-start border-r border-slate-400 bg-input-prefix-bg px-3 py-3 text-xs sm:text-sm text-input-prefix-text">
                {prefix}
            </div>
            <TextareaField
                value={value}
                onChange={onChange}
                rows={4}
                className="border-none"
                textareaClassName="min-h-[112px] text-brand-dark"
            />
        </div>
    );
}

export function PrefixedInput({ prefix, value, onChange, className = '', prefixClassName = '', ...props }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            className={`h-[40px] rounded-[4px] border-slate-400 ${className}`.trim()}
            prefixClassName={prefixClassName || "min-w-[92px] border-slate-400 bg-input-prefix-bg px-3 text-xs sm:text-sm text-input-prefix-text"}
            inputClassName="text-xs sm:text-sm text-brand-dark"
            {...props}
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-text-darkest transition hover:bg-bg-workspace-light"
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
        <div className="space-y-3 max-w-[980px]">
            <WarehouseFieldRow label={config.labels.name} required>
                <div className="lg:max-w-[50%] w-full">
                    <ClearableTextInput id="name" name="name" value={values.name} onChange={(event) => onChange('name', event.target.value)} />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label={config.labels.description}>
                <div className="lg:max-w-[50%] w-full">
                    <TextareaField
                        value={values.description}
                        onChange={(event) => onChange('description', event.target.value)}
                        rows={4}
                        className="rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[112px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label={config.labels.responsiblePerson}>
                <div className="lg:max-w-[50%] w-full">
                    <ClearableTextInput
                        value={values.responsiblePerson}
                        onChange={(event) => onChange('responsiblePerson', event.target.value)}
                    />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label="Gudang Barang Rusak">
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
            </WarehouseFieldRow>

            {isDetail ? (
                <WarehouseFieldRow label="Non Aktif">
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
                </WarehouseFieldRow>
            ) : null}
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
        <div className="space-y-3 max-w-[980px]">
            <WarehouseFieldRow label="Jalan">
                <div className="lg:max-w-[50%] w-full">
                    <TextareaField
                        value={values.street}
                        onChange={(event) => onChange('street', event.target.value)}
                        rows={3}
                        className="rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[80px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label="Kota / K.Pos">
                <div className="lg:max-w-[50%] w-full grid gap-3 grid-cols-[1fr_120px]">
                    <CityAutocompleteInput
                        value={values.city}
                        onChange={(nextValue) => onChange('city', nextValue)}
                        onSelectCity={handleSelectCity}
                        prefix=""
                        placeholder="Cari Kota / Kabupaten..."
                    />
                    <ClearableTextInput
                        placeholder="K. Pos"
                        value={values.postalCode}
                        onChange={(event) => onChange('postalCode', event.target.value)}
                    />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label="Provinsi">
                <div className="lg:max-w-[50%] w-full">
                    <ClearableTextInput
                        value={values.province}
                        onChange={(event) => onChange('province', event.target.value)}
                    />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label="Negara">
                <div className="lg:max-w-[50%] w-full">
                    <ClearableTextInput
                        value={values.country}
                        onChange={(event) => onChange('country', event.target.value)}
                    />
                </div>
            </WarehouseFieldRow>
        </div>
    );
}

export function WarehouseUsersTab({ config, values, onChange, isDetail }) {
    return (
        <div className="space-y-4">
            <div className="border-b border-ui-border-medium pb-2.5">
                <h3 className="text-lg font-medium text-brand-dark">{config.userAccess.title}</h3>
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
                        <h3 className="text-lg font-medium text-brand-dark">{config.userAccess.limitedTitle}</h3>
                    </div>

                    <WarehouseFieldRow label={config.labels.user}>
                        <BackendLookupField
                            resource="users"
                            values={values.users || []}
                            placeholder={config.userAccess.userPlaceholder}
                            searchLabel="Cari pengguna"
                            getOptionLabel={(option) => typeof option === 'string' ? option : (option?.name ?? option?.label ?? '')}
                            onSelect={(option) => {
                                const name = typeof option === 'string' ? option : (option?.name ?? option?.label ?? '');
                                if (name && !(values.users || []).includes(name)) {
                                    onChange('users', [...(values.users || []), name]);
                                }
                            }}
                            onRemove={(item) => {
                                const name = typeof item === 'string' ? item : (item?.name ?? item?.label ?? '');
                                onChange('users', (values.users || []).filter((val) => val !== name));
                            }}
                            className="max-w-[1320px]"
                        />
                    </WarehouseFieldRow>
                </div>
            ) : null}
        </div>
    );
}
