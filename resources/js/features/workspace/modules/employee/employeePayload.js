import { normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { emptyStringToNull, buildEmployeeCode, parseNullableCurrencyInput } from './employeeHelpers';

export function buildEmployeePayload(values) {
    const employeeCode = String(values.employeeCode ?? '').trim() || buildEmployeeCode(values.employeeIdType);
    const bankName = String(values.bankName ?? '').trim();
    const bankAccountNumber = String(values.bankAccountNumber ?? '').trim();
    const bankAccountHolder = String(values.bankAccountHolder ?? '').trim();
    const hasBankAccount = bankName && bankAccountNumber && bankAccountHolder;

    return {
        branch_id: values.__branchId ?? null,
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
        employment_status: emptyStringToNull(values.employmentStatus),
        joined_at: normalizeDisplayDate(values.joinDate) || null,
        tax_status: emptyStringToNull(values.taxAllowanceStatus),
        subject_to_income_tax: Boolean(values.subjectToIncomeTax),
        tax_number: emptyStringToNull(values.taxNumber),
        tax_allowance_applies: emptyStringToNull(values.taxAllowanceApplies),
        tax_allowance_status: emptyStringToNull(values.taxAllowanceStatus),
        tax_start_month: emptyStringToNull(values.taxStartMonth),
        tax_start_year: emptyStringToNull(values.taxStartYear),
        previous_income: parseNullableCurrencyInput(values.previousIncome),
        previous_tax: parseNullableCurrencyInput(values.previousTax),
        is_salesperson: Boolean(values.isSalesperson),
        notes: emptyStringToNull(values.note),
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
    };
}
