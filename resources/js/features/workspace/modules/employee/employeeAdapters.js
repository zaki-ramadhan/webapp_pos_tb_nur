import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { buildFilterOptions, formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';

export function buildEmployeeFormValues(form, detailRow = null) {
    const defaults = form.defaults ?? {};
    const primaryBankAccount = detailRow?.bankAccounts?.find((account) => account.is_primary) ?? detailRow?.bankAccounts?.[0] ?? null;

    return {
        ...defaults,
        __backendRecordId: detailRow?.id ?? null,
        __branchId: detailRow?.branchId ?? null,
        __departmentId: detailRow?.departmentId ?? null,
        __userId: detailRow?.userId ?? defaults.__userId ?? null,
        user: detailRow?.user ?? defaults.user ?? '',
        salutation: detailRow?.salutation ?? defaults.salutation ?? '',
        fullName: detailRow?.fullName ?? defaults.fullName ?? '',
        position: detailRow?.position ?? defaults.position ?? '',
        email: detailRow?.email ?? defaults.email ?? '',
        mobilePhone: detailRow?.mobilePhone ?? defaults.mobilePhone ?? '',
        officePhone: detailRow?.officePhone ?? defaults.officePhone ?? '',
        homePhone: detailRow?.homePhone ?? defaults.homePhone ?? '',
        whatsApp: detailRow?.whatsApp ?? defaults.whatsApp ?? '',
        website: detailRow?.website ?? defaults.website ?? '',
        nationality: detailRow?.nationality ?? defaults.nationality ?? '',
        autoEmployeeId: detailRow ? false : (defaults.autoEmployeeId ?? true),
        employeeIdType: detailRow?.employeeIdType ?? defaults.employeeIdType ?? 'Karyawan',
        employeeCode: detailRow?.employeeCode ?? '',
        joinDate: detailRow?.joinDate ?? defaults.joinDate ?? '',
        identityNumber: detailRow?.identityNumber ?? defaults.identityNumber ?? '',
        branch: detailRow?.branch ?? defaults.branch ?? '',
        department: detailRow?.department ?? defaults.department ?? '',
        isSalesperson: detailRow?.isSalesperson ?? defaults.isSalesperson ?? false,
        note: detailRow?.note ?? defaults.note ?? '',
        street: detailRow?.street ?? defaults.street ?? '',
        city: detailRow?.city ?? defaults.city ?? '',
        postalCode: detailRow?.postalCode ?? defaults.postalCode ?? '',
        province: detailRow?.province ?? defaults.province ?? '',
        country: detailRow?.country ?? defaults.country ?? '',
        subjectToIncomeTax: detailRow?.subjectToIncomeTax ?? defaults.subjectToIncomeTax ?? true,
        taxNumber: detailRow?.taxNumber ?? defaults.taxNumber ?? '',
        employmentStatus: detailRow?.employmentStatus ?? defaults.employmentStatus ?? '',
        taxAllowanceApplies: detailRow?.taxAllowanceApplies ?? defaults.taxAllowanceApplies ?? '',
        taxAllowanceStatus: detailRow?.taxAllowanceStatus ?? defaults.taxAllowanceStatus ?? '',
        taxStartMonth: detailRow?.taxStartMonth ?? defaults.taxStartMonth ?? '',
        taxStartYear: detailRow?.taxStartYear ?? defaults.taxStartYear ?? '',
        previousIncome: detailRow?.previousIncome ?? defaults.previousIncome ?? '',
        previousTax: detailRow?.previousTax ?? defaults.previousTax ?? '',
        bankName: primaryBankAccount?.bank_name ?? primaryBankAccount?.bankName ?? detailRow?.bankName ?? defaults.bankName ?? '',
        bankAccountNumber: primaryBankAccount?.account_number ?? primaryBankAccount?.accountNumber ?? detailRow?.bankAccountNumber ?? defaults.bankAccountNumber ?? '',
        bankAccountHolder: primaryBankAccount?.account_name ?? primaryBankAccount?.accountName ?? detailRow?.bankAccountHolder ?? defaults.bankAccountHolder ?? '',
        __bankAccountId: primaryBankAccount?.id ?? null,
        attachments: detailRow?.attachments ?? defaults.attachments ?? [],
    };
}

export function buildEmployeeRow(record) {
    const branchName = record.branch?.name ?? '';
    const departmentName = record.department?.name ?? '';
    const taxStatus = record.tax_allowance_status ?? record.tax_status ?? '';
    const primaryBankAccount = (record.bankAccounts ?? []).find((account) => account.is_primary) ?? record.bankAccounts?.[0] ?? null;
    const previousIncome = Number(record.previous_income ?? 0);
    const previousTax = Number(record.previous_tax ?? 0);

    return {
        id: record.id,
        __backendRecord: record,
        branchId: record.branch_id ?? record.branch?.id ?? null,
        departmentId: record.department_id ?? record.department?.id ?? null,
        salutation: record.salutation ?? '',
        fullName: record.full_name ?? '',
        name: record.full_name ?? '',
        position: record.position ?? '',
        email: record.email ?? '',
        mobilePhone: record.mobile_phone ?? '',
        officePhone: record.office_phone ?? '',
        homePhone: record.home_phone ?? '',
        whatsApp: record.whatsapp_phone ?? '',
        website: record.website ?? '',
        nationality: record.nationality ?? '',
        employeeIdType: record.employee_id_type ?? 'Karyawan',
        employeeCode: record.employee_code ?? '',
        employeeId: record.employee_code ?? '',
        joinDate: formatIsoDate(record.joined_at),
        identityNumber: record.identity_number ?? '',
        branch: branchName,
        department: departmentName,
        isSalesperson: Boolean(record.is_salesperson),
        userId: record.user_id ?? record.user?.id ?? null,
        user: record.user ? (record.user.name && record.user.email ? `${record.user.name} (${record.user.email})` : (record.user.name ?? '')) : '',
        note: record.notes ?? '',
        street: record.street ?? '',
        city: record.city ?? '',
        postalCode: record.postal_code ?? '',
        province: record.province ?? '',
        country: record.country ?? '',
        subjectToIncomeTax: record.subject_to_income_tax !== false,
        taxNumber: record.tax_number ?? '',
        employmentStatus: record.employment_status ?? '',
        taxAllowanceApplies: record.tax_allowance_applies ?? (record.subject_to_income_tax !== false ? 'Ya' : 'Tidak'),
        taxAllowanceStatus: taxStatus,
        taxStatus,
        taxStartMonth: record.tax_start_month ?? '',
        taxStartYear: record.tax_start_year ?? '',
        previousIncome: previousIncome > 0 ? formatCurrencyValue(previousIncome) : '',
        previousTax: previousTax > 0 ? formatCurrencyValue(previousTax) : '',
        payable: 'IDR 0',
        bankName: primaryBankAccount?.bank_name ?? '',
        bankAccountNumber: primaryBankAccount?.account_number ?? '',
        bankAccountHolder: primaryBankAccount?.account_name ?? '',
        bankAccounts: record.bankAccounts ?? [],
        inactiveValue: record.is_active === false ? 'yes' : 'no',
        employmentStatusValue: String(record.employment_status ?? '').toLowerCase().includes('kontrak') ? 'contract' : 'permanent',
        departmentValue: departmentName.trim().toLowerCase().replace(/\s+/g, '-'),
        departmentLabel: departmentName,
        branchValue: branchName.trim().toLowerCase().replace(/\s+/g, '-'),
        branchLabel: branchName,
        sellerValue: record.is_salesperson ? 'yes' : 'no',
        attachments: record.attachments ?? [],
        tabLabel: record.full_name ?? record.employee_code ?? `Karyawan #${record.id}`,
    };
}

export function buildEmployeeFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'department') {
            return {
                ...filter,
                rowKey: 'departmentValue',
                options: buildFilterOptions('Departemen', rows, 'departmentValue', 'departmentLabel'),
            };
        }

        if (filter.id === 'employment-status') {
            return {
                ...filter,
                rowKey: 'employmentStatusValue',
                options: buildFilterOptions('Status Pekerja', rows, 'employmentStatusValue', 'employmentStatus'),
            };
        }

        if (filter.id === 'seller') {
            return {
                ...filter,
                rowKey: 'sellerValue',
                options: [
                    { value: 'all', label: 'Penjual: Semua' },
                    { value: 'yes', label: 'Penjual: Ya' },
                    { value: 'no', label: 'Penjual: Tidak' },
                ],
            };
        }

        if (filter.id === 'branch') {
            return {
                ...filter,
                rowKey: 'branchValue',
                options: buildFilterOptions('Cabang', rows, 'branchValue', 'branchLabel'),
            };
        }

        return filter;
    });
}

export function buildEmployeeSnapshot(values) {
    return {
        salutation: values.salutation ?? '',
        fullName: values.fullName ?? '',
        position: values.position ?? '',
        email: values.email ?? '',
        mobilePhone: values.mobilePhone ?? '',
        officePhone: values.officePhone ?? '',
        homePhone: values.homePhone ?? '',
        whatsApp: values.whatsApp ?? '',
        website: values.website ?? '',
        nationality: values.nationality ?? '',
        employeeIdType: values.employeeIdType ?? '',
        employeeCode: values.employeeCode ?? '',
        joinDate: values.joinDate ?? '',
        identityNumber: values.identityNumber ?? '',
        branch: values.branch ?? '',
        department: values.department ?? '',
        isSalesperson: Boolean(values.isSalesperson),
        autoEmployeeId: Boolean(values.autoEmployeeId),
        note: values.note ?? '',
        street: values.street ?? '',
        city: values.city ?? '',
        postalCode: values.postalCode ?? '',
        province: values.province ?? '',
        country: values.country ?? '',
        subjectToIncomeTax: Boolean(values.subjectToIncomeTax),
        taxNumber: values.taxNumber ?? '',
        employmentStatus: values.employmentStatus ?? '',
        taxAllowanceApplies: values.taxAllowanceApplies ?? '',
        taxAllowanceStatus: values.taxAllowanceStatus ?? '',
        taxStartMonth: values.taxStartMonth ?? '',
        taxStartYear: values.taxStartYear ?? '',
        previousIncome: values.previousIncome ?? '',
        previousTax: values.previousTax ?? '',
        bankName: values.bankName ?? '',
        bankAccountNumber: values.bankAccountNumber ?? '',
        bankAccountHolder: values.bankAccountHolder ?? '',
        __branchId: values.__branchId ?? null,
        __departmentId: values.__departmentId ?? null,
        __userId: values.__userId ?? null,
        user: values.user ?? '',
        __bankAccountId: values.__bankAccountId ?? null,
        attachments: values.attachments ?? [],
    };
}

export function matchesEmployeeFilter(row, filter, selectedValue) {
    if (!filter.rowKey || selectedValue === 'all') {
        return true;
    }

    return row[filter.rowKey] === selectedValue;
}
