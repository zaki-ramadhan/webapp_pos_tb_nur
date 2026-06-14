import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { EmployeeFieldRow } from '@/features/workspace/modules/employee/employeeViewShared';
import {
    PrefixedInput,
    PrefixedTextArea,
    SuggestionTextInput,
    ToggleSwitch,
} from '@/features/workspace/modules/employee/employeeControls';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';

export function EmployeeGeneralTab({ form, values, errors, onChange }) {
    return (
        <div className="grid grid-cols-1 gap-x-12 gap-y-4 lg:grid-cols-2">
            <div className="space-y-3.5">
                <EmployeeFieldRow label="Nama Lengkap" required>
                    <div className="flex w-full max-w-[430px] gap-3">
                        <SelectField name="salutation" value={values.salutation} onChange={(event) => onChange('salutation', event.target.value)} containerClassName="w-[120px] shrink-0" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                            <option value="">- Sapaan -</option>
                            {form.salutationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </SelectField>
                        <TextInput name="full_name" value={values.fullName} onChange={(event) => onChange('fullName', event.target.value)} className="h-[40px] flex-1 rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                    </div>
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Posisi Jabatan">
                    <TextInput name="position" value={values.position} onChange={(event) => onChange('position', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Email">
                    <TextInput name="email" value={values.email} onChange={(event) => onChange('email', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Handphone">
                    <TextInput name="mobile_phone" value={values.mobilePhone} onChange={(event) => onChange('mobilePhone', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="No. Telp. Bisnis">
                    <TextInput name="office_phone" value={values.officePhone} onChange={(event) => onChange('officePhone', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="No. Telp. Rumah">
                    <TextInput name="home_phone" value={values.homePhone} onChange={(event) => onChange('homePhone', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="No. WhatsApp">
                    <TextInput name="whatsapp_phone" value={values.whatsApp} onChange={(event) => onChange('whatsApp', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] w-full max-w-[280px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Website">
                    <TextInput name="website" value={values.website} onChange={(event) => onChange('website', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                </EmployeeFieldRow>
            </div>

            <div className="space-y-3.5">
                <EmployeeFieldRow label="Kewarganegaraan">
                    <SelectField name="nationality" value={values.nationality} onChange={(event) => onChange('nationality', event.target.value)} containerClassName="w-full max-w-[430px]" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                        {form.nationalityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </SelectField>
                </EmployeeFieldRow>

                <EmployeeFieldRow label="ID Karyawan" required>
                    <div className="flex w-full max-w-[430px] items-center gap-3">
                        <ToggleSwitch checked={values.autoEmployeeId} onChange={(nextValue) => onChange('autoEmployeeId', nextValue)} />
                        {values.autoEmployeeId ? (
                            <SelectField name="employee_id_type" value={values.employeeIdType} onChange={(event) => onChange('employeeIdType', event.target.value)} containerClassName="flex-1" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-xs sm:text-sm text-[#1f2436]">
                                {form.employeeIdTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </SelectField>
                        ) : (
                            <TextInput name="employee_code" value={values.employeeCode} onChange={(event) => onChange('employeeCode', event.target.value)} placeholder="Masukkan ID Karyawan" className="h-[40px] flex-1 rounded-[4px] border-[#cfd6e2]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                        )}
                    </div>
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Tgl Masuk">
                    <TransactionDateInput name="joined_at" value={values.joinDate} onChange={(nextValue) => onChange('joinDate', nextValue)} className="w-full max-w-[354px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" trailingClassName="w-[42px] shrink-0 justify-center px-0" />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="No. KTP">
                    <TextInput name="identity_number" value={values.identityNumber} onChange={(event) => onChange('identityNumber', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-[#1f2436]" />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Penjual">
                    <CheckboxField id="employee-seller" name="is_salesperson" label="Ya" checked={values.isSalesperson} onChange={(event) => onChange('isSalesperson', event.target.checked)} align="center" containerClassName="w-auto" labelClassName="text-base" inputClassName="mt-0 h-[18px] w-[18px]" />
                </EmployeeFieldRow>

                {values.isSalesperson && (
                    <EmployeeFieldRow label="Login Penjual">
                        <ReferenceLookupInput
                            value={values.user}
                            items={form.lookupOptions?.users ?? []}
                            placeholder="Cari atau pilih..."
                            searchLabel="Cari login penjual"
                            className="w-full max-w-[430px]"
                            getOptionLabel={(option) => option.label && option.email ? `${option.label} (${option.email})` : (option.label ?? '')}
                            getOptionSearchText={(option) => `${option.label} ${option.email}`}
                            renderOption={(option) => (
                                <div className="min-w-0">
                                    <div className="truncate text-xs sm:text-sm font-medium text-[#131a28]">{option.label}</div>
                                    {option.email ? (
                                        <div className="mt-0.5 truncate text-xs text-[#7d879a]">{option.email}</div>
                                    ) : null}
                                </div>
                            )}
                            onSelect={(option) => onChange('user', option)}
                            onClear={() => onChange('user', null)}
                        />
                    </EmployeeFieldRow>
                )}

                <EmployeeFieldRow label="Catatan">
                    <TextareaField name="notes" value={values.note} onChange={(event) => onChange('note', event.target.value)} rows={4} className="rounded-[4px] border-[#cfd6e2] w-full max-w-[600px]" textareaClassName="min-h-[80px] px-3 py-3 text-xs sm:text-sm text-[#1f2436]" />
                </EmployeeFieldRow>
            </div>
        </div>
    );
}

export function EmployeeAddressTab({ values, onChange }) {
    const handleSelectCity = (item) => {
        onChange('city', item.city);
        onChange('province', item.province);
        onChange('postalCode', item.postalCode);
        onChange('country', item.country);
    };

    return (
        <div className="max-w-[900px]">
            <div className="grid gap-3 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
                <label className="pt-2 text-xs sm:text-sm text-[#1f2436]">Alamat</label>
                <div className="space-y-3">
                    <PrefixedTextArea name="street" value={values.street} onChange={(event) => onChange('street', event.target.value)} prefix="Jalan" />
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_260px]">
                        <CityAutocompleteInput
                            id="city"
                            value={values.city}
                            onChange={(nextValue) => onChange('city', nextValue)}
                            onSelectCity={handleSelectCity}
                            prefix="Kota"
                        />
                        <PrefixedInput name="postal_code" value={values.postalCode} onChange={(event) => onChange('postalCode', event.target.value)} prefix="K.Pos" />
                    </div>
                    <PrefixedInput name="province" value={values.province} onChange={(event) => onChange('province', event.target.value)} prefix="Provinsi" />
                    <PrefixedInput name="country" value={values.country} onChange={(event) => onChange('country', event.target.value)} prefix="Negara" />
                </div>
            </div>
        </div>
    );
}
