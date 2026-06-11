import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
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
        <div className="grid gap-8 xl:grid-cols-2">
            <div className="space-y-3.5">
                <EmployeeFieldRow label="Nama Lengkap" required>
                    <div className="grid gap-3 md:grid-cols-[206px_minmax(0,1fr)]">
                        <SelectField value={values.salutation} onChange={(event) => onChange('salutation', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                            {form.salutationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </SelectField>
                        <TextInput value={values.fullName} onChange={(event) => onChange('fullName', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />
                    </div>
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Posisi Jabatan"><TextInput value={values.position} onChange={(event) => onChange('position', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[430px]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
                <EmployeeFieldRow label="Email"><TextInput value={values.email} onChange={(event) => onChange('email', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
                <EmployeeFieldRow label="Handphone"><TextInput value={values.mobilePhone} onChange={(event) => onChange('mobilePhone', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[430px]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
                <EmployeeFieldRow label="No. Telp. Bisnis"><TextInput value={values.officePhone} onChange={(event) => onChange('officePhone', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[430px]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
                <EmployeeFieldRow label="No. Telp. Rumah"><TextInput value={values.homePhone} onChange={(event) => onChange('homePhone', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[430px]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
                <EmployeeFieldRow label="No. WhatsApp"><TextInput value={values.whatsApp} onChange={(event) => onChange('whatsApp', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[280px]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
                <EmployeeFieldRow label="Website"><TextInput value={values.website} onChange={(event) => onChange('website', event.target.value)} error={errors.website} className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
            </div>

            <div className="space-y-3.5">
                <EmployeeFieldRow label="Kewarganegaraan">
                    <SelectField value={values.nationality} onChange={(event) => onChange('nationality', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                        {form.nationalityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </SelectField>
                </EmployeeFieldRow>

                <EmployeeFieldRow label="ID Karyawan" required>
                    <div className="flex flex-wrap items-center gap-4">
                        <ToggleSwitch checked={values.autoEmployeeId} onChange={(nextValue) => onChange('autoEmployeeId', nextValue)} />
                        <SelectField value={values.employeeIdType} onChange={(event) => onChange('employeeIdType', event.target.value)} containerClassName="w-full md:max-w-[430px]" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                            {form.employeeIdTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </SelectField>
                    </div>
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Tgl Masuk">
                    <TransactionDateInput value={values.joinDate} onChange={(nextValue) => onChange('joinDate', nextValue)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[354px]" inputClassName="text-[15px] text-[#1f2436]" trailingClassName="w-[42px] shrink-0 justify-center px-0" />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="No. KTP"><TextInput value={values.identityNumber} onChange={(event) => onChange('identityNumber', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
                <EmployeeFieldRow label="Cabang">
                    <SelectField value={values.branch} onChange={(event) => onChange('branch', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                        {form.branchOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </SelectField>
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Departemen">
                    <SuggestionTextInput value={values.department} onChange={(nextValue) => onChange('department', nextValue)} options={form.departmentOptions ?? []} placeholder="Cari/Pilih..." className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" searchLabel="Cari departemen" emptyLabel="Departemen tidak ditemukan." />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Penjual">
                    <CheckboxField id="employee-seller" label="Ya" checked={values.isSalesperson} onChange={(event) => onChange('isSalesperson', event.target.checked)} align="center" containerClassName="w-auto" labelClassName="text-[16px]" inputClassName="mt-0 h-[18px] w-[18px]" />
                </EmployeeFieldRow>
                <EmployeeFieldRow label="Catatan">
                    <TextareaField value={values.note} onChange={(event) => onChange('note', event.target.value)} rows={4} className="rounded-[4px] border-[#cfd6e2]" textareaClassName="min-h-[80px] px-3 py-3 text-[15px] text-[#1f2436]" />
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
            <div className="grid gap-3 lg:grid-cols-[208px_minmax(0,1fr)] lg:items-start">
                <label className="pt-2 text-[16px] text-[#1f2436]">Alamat</label>
                <div className="space-y-3">
                    <PrefixedTextArea value={values.street} onChange={(event) => onChange('street', event.target.value)} prefix="Jalan" />
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_260px]">
                        <CityAutocompleteInput
                            value={values.city}
                            onChange={(nextValue) => onChange('city', nextValue)}
                            onSelectCity={handleSelectCity}
                            prefix="Kota"
                        />
                        <PrefixedInput value={values.postalCode} onChange={(event) => onChange('postalCode', event.target.value)} prefix="K.Pos" />
                    </div>
                    <PrefixedInput value={values.province} onChange={(event) => onChange('province', event.target.value)} prefix="Provinsi" />
                    <PrefixedInput value={values.country} onChange={(event) => onChange('country', event.target.value)} prefix="Negara" />
                </div>
            </div>
        </div>
    );
}
