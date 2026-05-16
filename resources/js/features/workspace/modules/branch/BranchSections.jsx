import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';

export function BranchFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
            <label className="text-[17px] text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

export function PrefixedTextArea({ value, onChange, prefix, className = '', textareaClassName = '' }) {
    return (
        <div className={`flex overflow-hidden rounded-[4px] border border-[#cfd6e2] bg-white ${className}`.trim()}>
            <div className="flex min-w-[88px] items-start justify-start border-r border-[#cfd6e2] bg-[#f3f3f4] px-3 py-3 text-[15px] text-[#8b94a7]">
                {prefix}
            </div>
            <textarea
                value={value}
                onChange={onChange}
                rows={4}
                className={`min-h-[112px] w-full resize-none px-4 py-3 text-[15px] text-[#1f2436] outline-none ${textareaClassName}`.trim()}
            />
        </div>
    );
}

export function PrefixedInput({ value, onChange, prefix, className = '', inputClassName = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            prefixClassName="min-w-[92px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-[15px] text-[#8b94a7]"
            inputClassName={`text-[15px] text-[#1f2436] ${inputClassName}`.trim()}
        />
    );
}

export function BranchGeneralTab({ values, onChange }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
                <PreferencesSectionHeading title="Info Umum" icon="building" />

                <div className="space-y-4">
                    <BranchFieldRow label="Nama" required>
                        <TextInput
                            value={values.name}
                            onChange={(event) => onChange('name', event.target.value)}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </BranchFieldRow>

                    <BranchFieldRow label="No. Telepon">
                        <TextInput
                            value={values.phone}
                            onChange={(event) => onChange('phone', event.target.value)}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </BranchFieldRow>
                </div>
            </div>

            <div className="space-y-4">
                <PreferencesSectionHeading title="Info Lainnya" icon="building" />

                <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
                    <label className="pt-2 text-[17px] text-[#1f2436]">Alamat</label>
                    <div className="space-y-3">
                        <PrefixedTextArea
                            value={values.street}
                            onChange={(event) => onChange('street', event.target.value)}
                            prefix="Jalan"
                        />

                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_184px]">
                            <PrefixedInput
                                value={values.city}
                                onChange={(event) => onChange('city', event.target.value)}
                                prefix="Kota"
                            />
                            <PrefixedInput
                                value={values.postalCode}
                                onChange={(event) => onChange('postalCode', event.target.value)}
                                prefix="K.Pos"
                            />
                        </div>

                        <PrefixedInput
                            value={values.province}
                            onChange={(event) => onChange('province', event.target.value)}
                            prefix="Provinsi"
                        />

                        <PrefixedInput
                            value={values.country}
                            onChange={(event) => onChange('country', event.target.value)}
                            prefix="Negara"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BranchUsersTab({ form, values, onChange }) {
    return (
        <div className="space-y-5">
            <div className="border-b border-[#d9dee8] pb-2.5">
                <h3 className="text-[18px] font-medium text-[#1f2436]">{form.userAccess.title}</h3>
            </div>

            <CheckboxField
                id="branch-all-users"
                label={form.userAccess.allUsersLabel}
                checked={values.allUsers}
                onChange={(event) => onChange('allUsers', event.target.checked)}
                align="center"
                labelClassName="text-[17px]"
                inputClassName="mt-0 h-[18px] w-[18px]"
            />
        </div>
    );
}
