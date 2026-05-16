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
