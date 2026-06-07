export function buildBudgetFormValues(config, detailRow = null) {
    if (detailRow) {
        const backend = detailRow.__backendRecord ?? {};
        const meta = backend.metadata ?? {};
        return {
            month: meta.month ?? '',
            year: meta.year ?? '',
            type: meta.type ?? '',
            branches: meta.branches ?? [],
            keyword: '',
            notes: backend.notes ?? '',
            analyzer: meta.analyzer ?? '',
        };
    }
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
