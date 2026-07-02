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
import AddressStack from '@/features/workspace/shared/components/AddressStack';

export function EmployeeGeneralTab({ form, values, errors, onChange }) {
    return (
        <div className="grid grid-cols-1 gap-x-12 gap-y-4 lg:grid-cols-2">
            <div className="space-y-3.5 min-w-0">
                <EmployeeFieldRow label="Nama Lengkap" required>
                    <div className="flex w-full max-w-[430px] gap-3">
                        <SelectField name="salutation" value={values.salutation} onChange={(event) => onChange('salutation', event.target.value)} containerClassName="w-[100px] shrink-0" className="h-[40px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
                            <option value="">- Sapaan -</option>
                            {form.salutationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </SelectField>
                        <TextInput name="full_name" value={values.fullName} onChange={(event) => onChange('fullName', event.target.value)} className="h-[40px] flex-1 rounded-[4px] border-ui-border" inputClassName="text-xs sm:text-sm text-brand-dark" />
                    </div>
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Posisi Jabatan">
                    <TextInput name="position" value={values.position} onChange={(event) => onChange('position', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Email">
                    <TextInput name="email" value={values.email} onChange={(event) => onChange('email', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Handphone">
                    <TextInput name="mobile_phone" value={values.mobilePhone} onChange={(event) => onChange('mobilePhone', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="No. Telp. Bisnis">
                    <TextInput name="office_phone" value={values.officePhone} onChange={(event) => onChange('officePhone', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="No. Telp. Rumah">
                    <TextInput name="home_phone" value={values.homePhone} onChange={(event) => onChange('homePhone', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="No. WhatsApp">
                    <TextInput name="whatsapp_phone" value={values.whatsApp} onChange={(event) => onChange('whatsApp', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[280px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Website">
                    <TextInput name="website" value={values.website} onChange={(event) => onChange('website', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
            </div>

            <div className="space-y-3.5 min-w-0">
                <EmployeeFieldRow label="Kewarganegaraan">
                    <SelectField name="nationality" value={values.nationality} onChange={(event) => onChange('nationality', event.target.value)} containerClassName="w-full max-w-[430px]" className="h-[40px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
                        {form.nationalityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </SelectField>
                </EmployeeFieldRow>

                <EmployeeFieldRow label="ID Karyawan" required>
                    <div className="flex w-full max-w-[430px] items-center gap-3">
                        <ToggleSwitch checked={values.autoEmployeeId} onChange={(nextValue) => onChange('autoEmployeeId', nextValue)} />
                        {values.autoEmployeeId ? (
                            <SelectField name="employee_id_type" value={values.employeeIdType} onChange={(event) => onChange('employeeIdType', event.target.value)} containerClassName="flex-1" className="h-[40px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
                                {form.employeeIdTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </SelectField>
                        ) : (
                            <TextInput name="employee_code" value={values.employeeCode} onChange={(event) => onChange('employeeCode', event.target.value)} placeholder="Masukkan ID Karyawan" className="h-[40px] flex-1 rounded-[4px] border-ui-border" inputClassName="text-xs sm:text-sm text-brand-dark" />
                        )}
                    </div>
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Tgl Masuk">
                    <TransactionDateInput name="joined_at" value={values.joinDate} onChange={(nextValue) => onChange('joinDate', nextValue)} className="w-full max-w-[354px]" inputClassName="text-xs sm:text-sm text-brand-dark" trailingClassName="w-[42px] shrink-0 justify-center px-0" />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="No. KTP">
                    <TextInput name="identity_number" value={values.identityNumber} onChange={(event) => onChange('identityNumber', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
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
                                    <div className="truncate text-xs sm:text-sm font-medium text-text-workspace-dark">{option.label}</div>
                                    {option.email ? (
                                        <div className="mt-0.5 truncate text-xs text-text-placeholder">{option.email}</div>
                                    ) : null}
                                </div>
                            )}
                            onSelect={(option) => onChange('user', option)}
                            onClear={() => onChange('user', null)}
                        />
                    </EmployeeFieldRow>
                )}

                <EmployeeFieldRow label="Catatan">
                    <TextareaField name="notes" value={values.note} onChange={(event) => onChange('note', event.target.value)} rows={4} className="rounded-[4px] border-ui-border w-full max-w-[600px]" textareaClassName="min-h-[80px] px-3 py-3 text-xs sm:text-sm text-brand-dark" />
                </EmployeeFieldRow>
            </div>
        </div>
    );
}

export function EmployeeAddressTab({ values, onChange }) {
    return (
        <div className="max-w-[900px]">
            <div className="grid gap-3 lg:grid-cols-[135px_minmax(0,1fr)] lg:items-start">
                <label className="pt-2 text-xs sm:text-sm text-brand-dark">Alamat</label>
                <div className="w-full max-w-[430px]">
                    <AddressStack
                        prefixValue="Jalan"
                        layout="grid"
                        values={{
                            street: values.street,
                            city: values.city,
                            postalCode: values.postalCode,
                            province: values.province,
                            country: values.country,
                        }}
                        onChange={onChange}
                    />
                </div>
            </div>
        </div>
    );
}
