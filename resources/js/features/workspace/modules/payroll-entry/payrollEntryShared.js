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
        id: record.id,
        number: record.document_number,
        date: record.entry_date,
        dueDate: record.due_date,
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
