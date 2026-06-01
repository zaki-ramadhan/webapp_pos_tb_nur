import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

function emptyStringToNull(value) {
    const normalizedValue = String(value ?? '').trim();

    return normalizedValue === '' ? null : normalizedValue;
}

function parseCurrencyInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

function parseNullableCurrencyInput(value) {
    return String(value ?? '').trim() ? parseCurrencyInput(value) : null;
}

function formatCurrencyValue(value) {
    const numericValue = Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return '0';
    }

    return numericValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function buildFilterOptions(labelPrefix, rows, rowKey, labelKey = rowKey) {
    const values = [...new Set(rows.map((row) => row[rowKey]).filter(Boolean))];

    return [
        { value: 'all', label: `${labelPrefix}: Semua` },
        ...values.map((value) => ({
            value,
            label: `${labelPrefix}: ${rows.find((row) => row[rowKey] === value)?.[labelKey] ?? value}`,
        })),
    ];
}

export function buildEmployeeFormValues(form, detailRow = null) {
    const defaults = form.defaults ?? {};
    const primaryBankAccount = detailRow?.bankAccounts?.find((account) => account.is_primary) ?? detailRow?.bankAccounts?.[0] ?? null;

    return {
        ...defaults,
        __backendRecordId: detailRow?.id ?? null,
        __branchId: detailRow?.branchId ?? null,
        __departmentId: detailRow?.departmentId ?? null,
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
    };
}

export function validateEmployeeWebsite(value) {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return '';
    }

    try {
        const parsedUrl = new URL(normalizedValue);

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return 'Website harus diawali http:// atau https://.';
        }

        if (!parsedUrl.hostname || !parsedUrl.hostname.includes('.')) {
            return 'Masukkan domain website yang valid.';
        }

        return '';
    } catch {
        return 'Masukkan URL lengkap, misalnya https://dicoding.com.';
    }
}

export function buildEmployeeCode(employeeIdType) {
    const prefixMap = {
        Karyawan: 'EMP',
        Kontrak: 'CTR',
        Magang: 'INT',
    };
    const prefix = prefixMap[employeeIdType] ?? 'EMP';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `${prefix}-${year}${month}${day}${time}`;
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
        __bankAccountId: values.__bankAccountId ?? null,
    };
}

export function validateEmployeeValues(values) {
    if (!String(values.fullName ?? '').trim()) {
        return 'Nama lengkap wajib diisi.';
    }

    if (!String(values.employeeIdType ?? '').trim()) {
        return 'Tipe ID karyawan wajib dipilih.';
    }

    if (values.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(values.email).trim())) {
        return 'Format email tidak valid. Pastikan menggunakan domain DNS lengkap (contoh: nama@domain.com).';
    }

    const websiteError = validateEmployeeWebsite(values.website);

    if (websiteError) {
        return websiteError;
    }

    const hasAnyBankField = [values.bankName, values.bankAccountNumber, values.bankAccountHolder]
        .some((value) => String(value ?? '').trim());

    if (hasAnyBankField) {
        if (!String(values.bankName ?? '').trim()) {
            return 'Nama bank wajib diisi jika rekening gaji digunakan.';
        }

        if (!String(values.bankAccountNumber ?? '').trim()) {
            return 'Nomor rekening wajib diisi jika rekening gaji digunakan.';
        }

        if (!String(values.bankAccountHolder ?? '').trim()) {
            return 'Atas nama rekening wajib diisi jika rekening gaji digunakan.';
        }
    }

    return '';
}

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

export function matchesEmployeeFilter(row, filter, selectedValue) {
    if (!filter.rowKey || selectedValue === 'all') {
        return true;
    }

    return row[filter.rowKey] === selectedValue;
}

export function EmployeeFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-2.5 lg:grid-cols-[208px_minmax(0,1fr)] lg:items-center">
            <label className="text-[16px] text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}
