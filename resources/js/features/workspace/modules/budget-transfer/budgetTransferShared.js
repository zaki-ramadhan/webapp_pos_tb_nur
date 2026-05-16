export function buildInitialValues(config) {
    return {
        year: config.defaults?.year ?? config.yearOptions?.[0] ?? '',
        type: config.defaults?.type ?? config.typeOptions?.[0] ?? '',
        branches: [...(config.defaults?.branches ?? [])],
        autoNumber: config.defaults?.autoNumber ?? true,
        numberingType: config.defaults?.numberingType ?? config.numberingOptions?.[0] ?? '',
        transferNumber: config.defaults?.transferNumber ?? '',
        date: config.defaults?.date ?? '',
        fromMonth: config.defaults?.fromMonth ?? config.monthOptions?.[0] ?? '',
        fromBudget: config.defaults?.fromBudget ?? '',
        remainingBudget: config.defaults?.remainingBudget ?? '-',
        transferAmount: config.defaults?.transferAmount ?? '',
        toMonth: config.defaults?.toMonth ?? config.monthOptions?.[0] ?? '',
        toBudget: config.defaults?.toBudget ?? '',
        notes: config.defaults?.notes ?? '',
    };
}
