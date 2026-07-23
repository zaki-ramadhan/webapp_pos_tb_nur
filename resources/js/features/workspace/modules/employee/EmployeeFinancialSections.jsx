import { useEffect, useState } from 'react';
import axios from 'axios';

import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { EmployeeFieldRow } from '@/features/workspace/modules/employee/employeeViewShared';
import { SuggestionTextInput } from '@/features/workspace/modules/employee/employeeControls';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';

export function EmployeeTaxTab({ form, values, onChange }) {
    return (
        <div className="max-w-[1000px] space-y-3">
            <EmployeeFieldRow label="Dikenakan PPh 21">
                <CheckboxField id="employee-tax-pph21" name="subject_to_income_tax" label="Ya" checked={values.subjectToIncomeTax} onChange={(event) => onChange('subjectToIncomeTax', event.target.checked)} align="center" containerClassName="w-auto" labelClassName="text-base" inputClassName="mt-0 h-[18px] w-[18px]" />
            </EmployeeFieldRow>
            {values.subjectToIncomeTax && (
                <>
                    <EmployeeFieldRow label="No. NPWP"><TextInput name="tax_number" value={values.taxNumber} onChange={(event) => onChange('taxNumber', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border md:max-w-[320px]" inputClassName="text-xs sm:text-sm text-brand-dark" /></EmployeeFieldRow>
                    <EmployeeFieldRow label="Status Pekerja">
                        <SelectField name="employment_status" value={values.employmentStatus} onChange={(event) => onChange('employmentStatus', event.target.value)} containerClassName="w-full md:max-w-[430px]" className="h-[40px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
                            {form.employmentStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </SelectField>
                    </EmployeeFieldRow>
                    <EmployeeFieldRow label="Dikenakan PTKP"><TextInput name="tax_allowance_applies" value={values.taxAllowanceApplies} readOnly className="h-[40px] rounded-[4px] border-ui-border md:max-w-[120px]" inputClassName="text-xs sm:text-sm text-tab-view-active-text" /></EmployeeFieldRow>
                    <EmployeeFieldRow label="Status PTKP">
                        <SelectField name="tax_allowance_status" value={values.taxAllowanceStatus} onChange={(event) => onChange('taxAllowanceStatus', event.target.value)} containerClassName="w-full md:max-w-[430px]" className="h-[40px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
                            {form.taxAllowanceStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </SelectField>
                    </EmployeeFieldRow>
                    <div className="pt-1"><h3 className="text-2xl font-medium text-text-darkest">Perhitungan PPh</h3></div>
                    <EmployeeFieldRow label="PPh mulai dihitung">
                        <div className="flex flex-wrap items-center gap-4">
                            <SelectField name="tax_start_month" value={values.taxStartMonth} onChange={(event) => onChange('taxStartMonth', event.target.value)} containerClassName="w-full md:max-w-[200px]" className="h-[40px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
                                {form.taxStartMonthOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </SelectField>
                            <SelectField name="tax_start_year" value={values.taxStartYear} onChange={(event) => onChange('taxStartYear', event.target.value)} containerClassName="w-full md:max-w-[120px]" className="h-[40px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
                                {form.taxStartYearOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </SelectField>
                        </div>
                    </EmployeeFieldRow>
                    <EmployeeFieldRow label="Penghasilan Sebelumnya">
                        <TextInput type="number" name="previous_income" value={values.previousIncome} onChange={(event) => onChange('previousIncome', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border md:max-w-[280px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                    </EmployeeFieldRow>
                    <EmployeeFieldRow label="PPh Sebelumnya">
                        <TextInput type="number" name="previous_tax" value={values.previousTax} onChange={(event) => onChange('previousTax', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border md:max-w-[280px]" inputClassName="text-xs sm:text-sm text-brand-dark" />
                    </EmployeeFieldRow>
                    <div className="grid gap-2.5 lg:grid-cols-[160px_minmax(0,1fr)]">
                        <div className="hidden lg:block" />
                        <div className="max-w-[860px] border-l-[4px] border-text-light pl-3 text-sm italic leading-6 text-illustration-danger-bg">
                            {form.taxCalculationNote}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function EmployeeBankTab({ form, values, onChange }) {
    const [banks, setBanks] = useState([]);

    useEffect(() => {
        axios.get('/api/backend/banks')
            .then((res) => {
                setBanks(res.data || []);
            })
            .catch(() => {
                setBanks([]);
            });
    }, []);

    return (
        <div className="max-w-[980px] space-y-3.5">
            <EmployeeFieldRow label="Nama Bank">
                <ReferenceLookupInput
                    value={values.bankName}
                    items={banks}
                    onSelect={(item) => onChange('bankName', item.name)}
                    onClear={() => onChange('bankName', '')}
                    placeholder="Cari/Pilih Bank..."
                    searchLabel="Cari bank"
                    className="w-full max-w-[430px]"
                    getOptionLabel={(option) => option.name}
                    getOptionSearchText={(option) => `${option.name} ${option.code}`}
                    renderOption={(option) => (
                        <div className="min-w-0">
                            <div className="truncate text-xs sm:text-sm font-medium text-text-workspace-dark">{option.name}</div>
                            <div className="mt-0.5 truncate text-[13px] font-normal text-black">{option.code}</div>
                        </div>
                    )}
                />
            </EmployeeFieldRow>
            <EmployeeFieldRow label="No Rekening"><TextInput name="bank_accounts.0.account_number" value={values.bankAccountNumber} onChange={(event) => onChange('bankAccountNumber', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" /></EmployeeFieldRow>
            <EmployeeFieldRow label="Atas Nama Rekening"><TextInput name="bank_accounts.0.account_name" value={values.bankAccountHolder} onChange={(event) => onChange('bankAccountHolder', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border w-full max-w-[430px]" inputClassName="text-xs sm:text-sm text-brand-dark" /></EmployeeFieldRow>
        </div>
    );
}
