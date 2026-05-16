export function buildBudgetFormValues(config) {
    return {
        month: config.defaults?.month ?? config.monthOptions?.[0] ?? '',
        year: config.defaults?.year ?? config.yearOptions?.[0] ?? '',
        type: config.defaults?.type ?? config.typeOptions?.[0] ?? '',
        branches: config.defaults?.branches ?? [],
        keyword: '',
        notes: config.defaults?.notes ?? '',
        analyzer: config.defaults?.analyzer ?? '',
    };
}
