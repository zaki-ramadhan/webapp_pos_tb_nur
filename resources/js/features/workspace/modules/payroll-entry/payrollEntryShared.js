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
        notes: config.defaults?.notes ?? '',
    };
}

export function mapPayrollEntryRow(record) {
    const totalAmount = parseFloat(record.total_amount ?? 0);
    const month = record.metadata?.period_month ?? '';
    const year = record.metadata?.period_year ?? '';

    return {
        id: String(record.id ?? ''),
        __backendRecord: record,
        number: record.document_number,
        date: formatIsoDate(record.entry_date),
        dueDate: formatIsoDate(record.due_date),
        total: totalAmount.toLocaleString('id-ID'),
        paymentType: record.metadata?.payment_type ?? 'Bulanan',
        status: record.status ?? 'Draft',
        statusValue: (record.status ?? 'draft').toLowerCase(),
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
        };
    });

    const metadata = record.metadata ?? {};
    return {
        __backendRecordId: record.id ?? null,
        paymentType: metadata.payment_type ?? config.defaults?.paymentType ?? 'Bulanan',
        branches: [...(metadata.branches ?? config.defaults?.branches ?? [])],
        month: metadata.period_month ?? config.defaults?.month ?? '',
        year: metadata.period_year ?? config.defaults?.year ?? '',
        autoNumber: false,
        numberingType: record.numbering_type ?? config.defaults?.numberingType ?? 'Pencatatan Gaji',
        documentNumber: record.document_number ?? '',
        entryDate: record.entry_date ? formatIsoDate(record.entry_date) : '',
        dueDate: record.due_date ? formatIsoDate(record.due_date) : '',
        employeeLookup: '',
        liabilityAccounts: [...(metadata.liability_accounts ?? config.defaults?.liabilityAccounts ?? [])],
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
