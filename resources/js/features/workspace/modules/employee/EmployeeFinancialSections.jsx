import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { EmployeeFieldRow } from '@/features/workspace/modules/employee/employeeViewShared';
import { SuggestionTextInput } from '@/features/workspace/modules/employee/employeeControls';

export function EmployeeTaxTab({ form, values, onChange }) {
    return (
        <div className="max-w-[1000px] space-y-4">
            <EmployeeFieldRow label="Dikenakan PPh 21">
                <CheckboxField id="employee-tax-pph21" name="subject_to_income_tax" label="Ya" checked={values.subjectToIncomeTax} onChange={(event) => onChange('subjectToIncomeTax', event.target.checked)} align="center" containerClassName="w-auto" labelClassName="text-[16px]" inputClassName="mt-0 h-[18px] w-[18px]" />
            </EmployeeFieldRow>
            <EmployeeFieldRow label="No. NPWP"><TextInput name="tax_number" value={values.taxNumber} onChange={(event) => onChange('taxNumber', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[476px]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
            <EmployeeFieldRow label="Status Pekerja">
                <SelectField name="employment_status" value={values.employmentStatus} onChange={(event) => onChange('employmentStatus', event.target.value)} containerClassName="w-full md:max-w-[676px]" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                    {form.employmentStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </SelectField>
            </EmployeeFieldRow>
            <EmployeeFieldRow label="Dikenakan PTKP"><TextInput name="tax_allowance_applies" value={values.taxAllowanceApplies} readOnly className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[176px]" inputClassName="text-[15px] text-[#5f6780]" /></EmployeeFieldRow>
            <EmployeeFieldRow label="Status PTKP">
                <SelectField name="tax_allowance_status" value={values.taxAllowanceStatus} onChange={(event) => onChange('taxAllowanceStatus', event.target.value)} containerClassName="w-full md:max-w-[676px]" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                    {form.taxAllowanceStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </SelectField>
            </EmployeeFieldRow>
            <div className="pt-1"><h3 className="text-[22px] font-medium text-[#111827]">Perhitungan PPh</h3></div>
            <EmployeeFieldRow label="PPh mulai dihitung">
                <div className="flex flex-wrap items-center gap-4">
                    <SelectField name="tax_start_month" value={values.taxStartMonth} onChange={(event) => onChange('taxStartMonth', event.target.value)} containerClassName="w-full md:max-w-[376px]" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                        {form.taxStartMonthOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </SelectField>
                    <SelectField name="tax_start_year" value={values.taxStartYear} onChange={(event) => onChange('taxStartYear', event.target.value)} containerClassName="w-full md:max-w-[176px]" className="h-[40px] rounded-[4px] border-[#cfd6e2]" selectClassName="text-[15px] text-[#1f2436]">
                        {form.taxStartYearOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </SelectField>
                </div>
            </EmployeeFieldRow>
            <EmployeeFieldRow label="Penghasilan Sebelumnya">
                <TextInput name="previous_income" value={values.previousIncome} onChange={(event) => onChange('previousIncome', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[376px]" inputClassName="text-[15px] text-[#1f2436]" />
            </EmployeeFieldRow>
            <EmployeeFieldRow label="PPh Sebelumnya">
                <TextInput name="previous_tax" value={values.previousTax} onChange={(event) => onChange('previousTax', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[376px]" inputClassName="text-[15px] text-[#1f2436]" />
            </EmployeeFieldRow>
            <div className="ml-0 max-w-[860px] border-l-[4px] border-[#8c8c8d] pl-3 text-[13px] italic leading-6 text-[#ff4a4a] lg:ml-[220px]">{form.taxCalculationNote}</div>
        </div>
    );
}

export function EmployeeBankTab({ form, values, onChange }) {
    return (
        <div className="max-w-[980px] space-y-3.5">
            <EmployeeFieldRow label="Nama Bank">
                <SuggestionTextInput name="bank_accounts.0.bank_name" value={values.bankName} onChange={(nextValue) => onChange('bankName', nextValue)} options={form.bankOptions ?? []} placeholder="Cari/Pilih..." className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[568px]" inputClassName="text-[15px] text-[#1f2436]" searchLabel="Cari bank" emptyLabel="Nama bank tidak ditemukan." />
            </EmployeeFieldRow>
            <EmployeeFieldRow label="No Rekening"><TextInput name="bank_accounts.0.account_number" value={values.bankAccountNumber} onChange={(event) => onChange('bankAccountNumber', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[568px]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
            <EmployeeFieldRow label="Atas Nama Rekening"><TextInput name="bank_accounts.0.account_name" value={values.bankAccountHolder} onChange={(event) => onChange('bankAccountHolder', event.target.value)} className="h-[40px] rounded-[4px] border-[#cfd6e2] md:max-w-[568px]" inputClassName="text-[15px] text-[#1f2436]" /></EmployeeFieldRow>
        </div>
    );
}
