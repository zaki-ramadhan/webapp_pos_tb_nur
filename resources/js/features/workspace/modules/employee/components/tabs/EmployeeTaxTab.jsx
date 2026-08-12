import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { formatNpwpInput } from '@/features/workspace/shared/formValidation';
import { EmployeeFieldRow } from '@/features/workspace/modules/employee/employeeViewShared';

export default function EmployeeTaxTab({ form, values, onChange }) {
    return (
        <div className="max-w-[1000px] space-y-3">
            <EmployeeFieldRow label="Dikenakan PPh 21">
                <CheckboxField id="employee-tax-pph21" name="subject_to_income_tax" label="Ya" checked={values.subjectToIncomeTax} onChange={(event) => onChange('subjectToIncomeTax', event.target.checked)} align="center" containerClassName="w-auto" labelClassName="text-base" inputClassName="mt-0 h-[18px] w-[18px]" />
            </EmployeeFieldRow>
            {values.subjectToIncomeTax && (
                <>
                    <EmployeeFieldRow label="No. NPWP"><TextInput name="tax_number" value={values.taxNumber} onChange={(event) => onChange('taxNumber', formatNpwpInput(event.target.value))} className="h-[40px] rounded-[4px] border-ui-border md:max-w-[320px]" inputClassName="text-xs sm:text-sm text-brand-dark" /></EmployeeFieldRow>
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
                </>
            )}
        </div>
    );
}
