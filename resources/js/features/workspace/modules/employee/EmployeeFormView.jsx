import { useEffect, useState } from 'react';

import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import { SearchIcon } from '@/features/workspace/shared/Icons';
import {
    AttachmentSelectButton,
    buildEmployeeFormValues,
    EmployeeFieldRow,
    PrefixedInput,
    PrefixedTextArea,
    ToggleSwitch,
} from '@/features/workspace/modules/employee/employeeViewShared';

function EmployeeGeneralTab({ form, values, onChange }) {
    return (
        <div className="grid gap-8 xl:grid-cols-2">
            <div className="space-y-3.5">
                <EmployeeFieldRow label="Nama Lengkap" required>
                    <div className="grid gap-3 md:grid-cols-[206px_minmax(0,1fr)]">
                        <SelectField
                            value={values.salutation}
                            onChange={(event) => onChange('salutation', event.target.value)}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {form.salutationOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                        <TextInput
                            value={values.fullName}
                            onChange={(event) => onChange('fullName', event.target.value)}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Posisi Jabatan">
                    <TextInput
                        value={values.position}
                        onChange={(event) => onChange('position', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[430px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Email">
                    <TextInput
                        value={values.email}
                        onChange={(event) => onChange('email', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Handphone">
                    <TextInput
                        value={values.mobilePhone}
                        onChange={(event) => onChange('mobilePhone', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[430px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="No. Telp. Bisnis">
                    <TextInput
                        value={values.officePhone}
                        onChange={(event) => onChange('officePhone', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[430px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="No. Telp. Rumah">
                    <TextInput
                        value={values.homePhone}
                        onChange={(event) => onChange('homePhone', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[430px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="No. WhatsApp">
                    <TextInput
                        value={values.whatsApp}
                        onChange={(event) => onChange('whatsApp', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[280px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Website">
                    <TextInput
                        value={values.website}
                        onChange={(event) => onChange('website', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </EmployeeFieldRow>
            </div>

            <div className="space-y-3.5">
                <EmployeeFieldRow label="Kewarganegaraan">
                    <SelectField
                        value={values.nationality}
                        onChange={(event) => onChange('nationality', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {form.nationalityOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </EmployeeFieldRow>

                <EmployeeFieldRow label="ID Karyawan" required>
                    <div className="flex flex-wrap items-center gap-4">
                        <ToggleSwitch
                            checked={values.autoEmployeeId}
                            onChange={(nextValue) => onChange('autoEmployeeId', nextValue)}
                        />
                        <SelectField
                            value={values.employeeIdType}
                            onChange={(event) => onChange('employeeIdType', event.target.value)}
                            containerClassName="w-full md:max-w-[430px]"
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#1f2436]"
                        >
                            {form.employeeIdTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Tgl Masuk">
                    <TransactionDateInput
                        value={values.joinDate}
                        onChange={(nextValue) => onChange('joinDate', nextValue)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[354px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                        trailingClassName="w-[42px] shrink-0 justify-center px-0"
                    />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="No. KTP">
                    <TextInput
                        value={values.identityNumber}
                        onChange={(event) => onChange('identityNumber', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Cabang">
                    <SelectField
                        value={values.branch}
                        onChange={(event) => onChange('branch', event.target.value)}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {form.branchOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Departemen">
                    <TextInput
                        value={values.department}
                        onChange={(event) => onChange('department', event.target.value)}
                        placeholder="Cari/Pilih..."
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                        trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                    />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Penjual">
                    <CheckboxField
                        id="employee-seller"
                        label="Ya"
                        checked={values.isSalesperson}
                        onChange={(event) => onChange('isSalesperson', event.target.checked)}
                        align="center"
                        containerClassName="w-auto"
                        labelClassName="text-[16px]"
                        inputClassName="mt-0 h-[18px] w-[18px]"
                    />
                </EmployeeFieldRow>

                <EmployeeFieldRow label="Catatan">
                    <TextareaField
                        value={values.note}
                        onChange={(event) => onChange('note', event.target.value)}
                        rows={4}
                        className="rounded-[4px] border-[#cfd6e2]"
                        textareaClassName="min-h-[80px] px-3 py-3 text-[15px] text-[#1f2436]"
                    />
                </EmployeeFieldRow>
            </div>
        </div>
    );
}

function EmployeeAddressTab({ values, onChange }) {
    return (
        <div className="max-w-[900px]">
            <div className="grid gap-3 lg:grid-cols-[208px_minmax(0,1fr)] lg:items-start">
                <label className="pt-2 text-[16px] text-[#1f2436]">Alamat</label>
                <div className="space-y-3">
                    <PrefixedTextArea
                        value={values.street}
                        onChange={(event) => onChange('street', event.target.value)}
                        prefix="Jalan"
                    />

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_260px]">
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
    );
}

function EmployeeTaxTab({ form, values, onChange }) {
    return (
        <div className="max-w-[1000px] space-y-4">
            <EmployeeFieldRow label="Dikenakan PPh 21">
                <CheckboxField
                    id="employee-tax-pph21"
                    label="Ya"
                    checked={values.subjectToIncomeTax}
                    onChange={(event) => onChange('subjectToIncomeTax', event.target.checked)}
                    align="center"
                    containerClassName="w-auto"
                    labelClassName="text-[16px]"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                />
            </EmployeeFieldRow>

            <EmployeeFieldRow label="No. NPWP">
                <TextInput
                    value={values.taxNumber}
                    onChange={(event) => onChange('taxNumber', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[476px]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </EmployeeFieldRow>

            <EmployeeFieldRow label="Status Pekerja">
                <SelectField
                    value={values.employmentStatus}
                    onChange={(event) => onChange('employmentStatus', event.target.value)}
                    containerClassName="w-full md:max-w-[676px]"
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-[15px] text-[#1f2436]"
                >
                    {form.employmentStatusOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </EmployeeFieldRow>

            <EmployeeFieldRow label="Dikenakan PTKP">
                <TextInput
                    value={values.taxAllowanceApplies}
                    readOnly
                    className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[176px]"
                    inputClassName="text-[15px] text-[#5f6780]"
                />
            </EmployeeFieldRow>

            <EmployeeFieldRow label="Status PTKP">
                <SelectField
                    value={values.taxAllowanceStatus}
                    onChange={(event) => onChange('taxAllowanceStatus', event.target.value)}
                    containerClassName="w-full md:max-w-[676px]"
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-[15px] text-[#1f2436]"
                >
                    {form.taxAllowanceStatusOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </EmployeeFieldRow>

            <div className="pt-1">
                <h3 className="text-[22px] font-medium text-[#111827]">Perhitungan PPh</h3>
            </div>

            <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
                <label className="text-[16px] text-[#1f2436]">PPh mulai dihitung</label>
                <div className="flex flex-wrap items-center gap-4">
                    <SelectField
                        value={values.taxStartMonth}
                        onChange={(event) => onChange('taxStartMonth', event.target.value)}
                        containerClassName="w-full md:max-w-[376px]"
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {form.taxStartMonthOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>

                    <SelectField
                        value={values.taxStartYear}
                        onChange={(event) => onChange('taxStartYear', event.target.value)}
                        containerClassName="w-full md:max-w-[176px]"
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {form.taxStartYearOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
                <label className="text-[16px] text-[#1f2436]">Penghasilan Sebelumnya</label>
                <TextInput
                    value={values.previousIncome}
                    onChange={(event) => onChange('previousIncome', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[376px]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </div>

            <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
                <label className="text-[16px] text-[#1f2436]">PPh Sebelumnya</label>
                <TextInput
                    value={values.previousTax}
                    onChange={(event) => onChange('previousTax', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[376px]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </div>

            <div className="ml-0 max-w-[860px] border-l-[4px] border-[#8c8c8d] pl-3 text-[13px] italic leading-6 text-[#ff4a4a] lg:ml-[100px]">
                {form.taxCalculationNote}
            </div>
        </div>
    );
}

function EmployeeBankTab({ values, onChange }) {
    return (
        <div className="max-w-[980px] space-y-3.5">
            <EmployeeFieldRow label="Nama Bank">
                <TextInput
                    value={values.bankName}
                    onChange={(event) => onChange('bankName', event.target.value)}
                    placeholder="Cari/Pilih..."
                    className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[568px]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                />
            </EmployeeFieldRow>

            <EmployeeFieldRow label="No Rekening">
                <TextInput
                    value={values.bankAccountNumber}
                    onChange={(event) => onChange('bankAccountNumber', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[568px]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </EmployeeFieldRow>

            <EmployeeFieldRow label="Atas Nama Rekening">
                <TextInput
                    value={values.bankAccountHolder}
                    onChange={(event) => onChange('bankAccountHolder', event.target.value)}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[568px]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </EmployeeFieldRow>
        </div>
    );
}

export default function EmployeeFormView({ form }) {
    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'employee-general');
    const [values, setValues] = useState(() => buildEmployeeFormValues(form));

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'employee-general');
        setValues(buildEmployeeFormValues(form));
    }, [form]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={form.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[740px] flex-col gap-5 px-4 py-4 xl:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-3 py-3 sm:px-4 sm:py-4">
                    {activeTabId === 'employee-address' ? (
                        <EmployeeAddressTab values={values} onChange={handleChange} />
                    ) : activeTabId === 'employee-tax' ? (
                        <EmployeeTaxTab form={form} values={values} onChange={handleChange} />
                    ) : activeTabId === 'employee-bank' ? (
                        <EmployeeBankTab values={values} onChange={handleChange} />
                    ) : (
                        <EmployeeGeneralTab form={form} values={values} onChange={handleChange} />
                    )}
                </div>

                <div className="flex shrink-0 flex-row justify-end gap-3 xl:flex-col">
                    <DockSaveButton label={form.saveLabel} />
                    <AttachmentSelectButton label={form.attachmentLabel} />
                </div>
            </div>
        </div>
    );
}
