import { normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { emptyStringToNull, buildEmployeeCode, parseNullableCurrencyInput } from './employeeHelpers';

export function buildEmployeePayload(values) {
    const employeeCode = String(values.employeeCode ?? '').trim() || buildEmployeeCode(values.employeeIdType);
    const bankName = String(values.bankName ?? '').trim();
    const bankAccountNumber = String(values.bankAccountNumber ?? '').trim();
    const bankAccountHolder = String(values.bankAccountHolder ?? '').trim();
    const hasBankAccount = bankName && bankAccountNumber && bankAccountHolder;

    return {
        branch_id: values.__branchId ?? 1,
        department_id: values.__departmentId ?? null,
        employee_code: employeeCode,
        employee_id_type: emptyStringToNull(values.employeeIdType),
        salutation: emptyStringToNull(values.salutation),
        full_name: values.fullName.trim(),
        position: emptyStringToNull(values.position),
        email: emptyStringToNull(values.email),
        mobile_phone: emptyStringToNull(values.mobilePhone),
        office_phone: emptyStringToNull(values.officePhone),
        home_phone: emptyStringToNull(values.homePhone),
        whatsapp_phone: emptyStringToNull(values.whatsApp),
        website: emptyStringToNull(values.website),
        identity_number: emptyStringToNull(values.identityNumber),
        street: emptyStringToNull(values.street),
        city: emptyStringToNull(values.city),
        postal_code: emptyStringToNull(values.postalCode),
        province: emptyStringToNull(values.province),
        country: emptyStringToNull(values.country),
        nationality: emptyStringToNull(values.nationality),
        employment_status: values.subjectToIncomeTax ? emptyStringToNull(values.employmentStatus) : null,
        joined_at: normalizeDisplayDate(values.joinDate) || null,
        tax_status: values.subjectToIncomeTax ? emptyStringToNull(values.taxAllowanceStatus) : null,
        subject_to_income_tax: Boolean(values.subjectToIncomeTax),
        tax_number: values.subjectToIncomeTax ? emptyStringToNull(values.taxNumber) : null,
        tax_allowance_applies: values.subjectToIncomeTax ? emptyStringToNull(values.taxAllowanceApplies) : 'Tidak',
        tax_allowance_status: values.subjectToIncomeTax ? emptyStringToNull(values.taxAllowanceStatus) : null,
        tax_start_month: values.subjectToIncomeTax ? emptyStringToNull(values.taxStartMonth) : null,
        tax_start_year: values.subjectToIncomeTax ? emptyStringToNull(values.taxStartYear) : null,
        previous_income: values.subjectToIncomeTax ? parseNullableCurrencyInput(values.previousIncome) : null,
        previous_tax: values.subjectToIncomeTax ? parseNullableCurrencyInput(values.previousTax) : null,
        is_salesperson: Boolean(values.isSalesperson),
        user_id: values.isSalesperson ? (values.__userId ?? null) : null,
        notes: emptyStringToNull(values.note),
        liability_account_label: emptyStringToNull(values.liabilityAccountLabel),
        is_active: true,
        bank_accounts: hasBankAccount
            ? [
                {
                    id: values.__bankAccountId ?? undefined,
                    bank_name: bankName,
                    account_name: bankAccountHolder,
                    account_number: bankAccountNumber,
                    is_primary: true,
                },
            ]
            : [],
        attachment_ids: (values.attachments ?? []).map((att) => att.id),
    };
}
