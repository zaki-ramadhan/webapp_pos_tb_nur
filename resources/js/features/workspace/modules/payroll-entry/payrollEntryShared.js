import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';

export function buildDefaultValues(config) {
    return {
        paymentType: config.defaults?.paymentType ?? config.paymentTypeOptions?.[0] ?? '',
        branches: [...(config.defaults?.branches ?? [])],
        month: config.defaults?.month ?? config.monthOptions?.[0] ?? '',
        year: config.defaults?.year ?? config.yearOptions?.[0] ?? '',
        autoNumber: config.defaults?.autoNumber ?? true,
        numberingType: config.defaults?.numberingType ?? config.numberingOptions?.[0] ?? '',
        entryDate: config.defaults?.entryDate ?? '',
        dueDate: config.defaults?.dueDate ?? '',
        employeeLookup: config.defaults?.employeeLookup ?? '',
        liabilityAccounts: [...(config.defaults?.liabilityAccounts ?? [])],
        __liabilityAccountId: null,
        notes: config.defaults?.notes ?? '',
    };
}

export function mapPayrollEntryRow(record) {
    const totalAmount = parseFloat(record.total_amount ?? 0);
    const month = record.metadata?.period_month ?? '';
    const year = record.metadata?.period_year ?? '';

    const rawStatus = String(record.status ?? 'Draft').toLowerCase();
    let statusText = 'Sedang diproses';
    let statusVal = 'draft';
    if (rawStatus === 'posted' || rawStatus === 'paid' || rawStatus === 'terbayar') {
        statusText = 'Terbayar';
        statusVal = 'paid';
    } else if (rawStatus === 'partial' || rawStatus === 'sebagian dibayar') {
        statusText = 'Sebagian dibayar';
        statusVal = 'partial';
    }

    return {
        id: String(record.id ?? ''),
        __backendRecord: record,
        number: record.document_number,
        date: formatIsoDate(record.entry_date),
        dueDate: formatIsoDate(record.due_date),
        total: totalAmount.toLocaleString('id-ID'),
        paymentType: record.metadata?.payment_type ?? 'Bulanan',
        status: statusText,
        statusValue: statusVal,
        period: `${month} ${year}`.trim() || '-',
        description: record.notes ?? '',
        dateFilter: record.entry_date ? new Date(record.entry_date).getFullYear().toString() : 'all',
        monthValue: (month || 'all').toLowerCase(),
        yearValue: (year || 'all').toLowerCase(),
    };
}

export function buildPayrollEntryRecord(record = {}, config) {
    const lineItems = (record.lines ?? []).map((line, index) => {
        const gross = parseFloat(line.unit_price ?? 0);
        const tax = parseFloat(line.tax_amount ?? 0);
        const paid = parseFloat(line.total_amount ?? 0);
        const attributes = line.attributes ?? {};

        return {
            id: String(line.id ?? `line-${index + 1}`),
            __lineId: line.id ?? null,
            employeeId: attributes.employee_id ?? '',
            employeeCode: attributes.employee_code ?? '',
            employeeName: attributes.employee_name ?? line.description ?? '',
            grossIncome: gross.toLocaleString('id-ID'),
            grossIncomeRaw: gross,
            incomeTax: tax.toLocaleString('id-ID'),
            incomeTaxRaw: tax,
            paidSalary: paid.toLocaleString('id-ID'),
            paidSalaryRaw: paid,
            pensionAllowance: attributes.pensionAllowance ?? 0,
            basicSalary: attributes.basicSalary ?? 0,
            taxAllowance: attributes.taxAllowance ?? 0,
            positionAllowance: attributes.positionAllowance ?? 0,
            mealAllowance: attributes.mealAllowance ?? 0,
            transportAllowance: attributes.transportAllowance ?? 0,
            telecommunicationAllowance: attributes.telecommunicationAllowance ?? 0,
            overtimeAllowance: attributes.overtimeAllowance ?? 0,
            healthPremiAllowance: attributes.healthPremiAllowance ?? 0,
            jkkAllowance: attributes.jkkAllowance ?? 0,
            jkmAllowance: attributes.jkmAllowance ?? 0,
            salaryReduction: attributes.salaryReduction ?? 0,
            monthlyDeduction: attributes.monthlyDeduction ?? 0,
            installmentDeduction: attributes.installmentDeduction ?? 0,
            pensionDeduction: attributes.pensionDeduction ?? 0,
            healthPremiDeduction: attributes.healthPremiDeduction ?? 0,
            notes: attributes.notes ?? '',
        };
    });

    const metadata = record.metadata ?? {};
    let liabilityAccounts = [...(metadata.liability_accounts ?? config.defaults?.liabilityAccounts ?? [])];
    if (liabilityAccounts.length === 0 && record.primary_account) {
        liabilityAccounts = [`[${record.primary_account.code}] ${record.primary_account.name}`];
    }
    const liabilityAccountId = record.primary_account_id ?? metadata.liability_account_id ?? null;

    return {
        __backendRecordId: record.id ?? null,
        paymentType: metadata.payment_type ?? config.defaults?.paymentType ?? 'Bulanan',
        status: record.status ?? 'Draft',
        branches: [...(metadata.branches ?? config.defaults?.branches ?? [])],
        month: metadata.period_month ?? config.defaults?.month ?? '',
        year: metadata.period_year ?? config.defaults?.year ?? '',
        autoNumber: false,
        numberingType: record.numbering_type ?? config.defaults?.numberingType ?? 'Pencatatan Gaji',
        documentNumber: record.document_number ?? '',
        entryDate: record.entry_date ? formatIsoDate(record.entry_date) : '',
        dueDate: record.due_date ? formatIsoDate(record.due_date) : '',
        employeeLookup: '',
        liabilityAccounts,
        __liabilityAccountId: liabilityAccountId,
        notes: record.notes ?? '',
        employeeRows: lineItems,
    };
}

export function buildGeneratedPayrollEntryNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `EPY.${year}.${month}.${day}.${time}`;
}
