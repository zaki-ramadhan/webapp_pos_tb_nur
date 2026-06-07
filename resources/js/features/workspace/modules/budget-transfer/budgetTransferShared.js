export function buildInitialValues(config, detailRow = null) {
    if (detailRow) {
        const backend = detailRow.__backendRecord ?? {};
        const meta = backend.metadata ?? {};
        return {
            year: meta.year ?? '',
            type: meta.type ?? '',
            branches: meta.branches ?? [],
            autoNumber: Boolean(meta.autoNumber),
            numberingType: meta.numberingType ?? '',
            transferNumber: backend.document_number ?? '',
            date: meta.date ?? '',
            fromMonth: meta.fromMonth ?? '',
            fromBudget: meta.fromBudget ?? '',
            remainingBudget: meta.remainingBudget ?? '-',
            transferAmount: meta.transferAmount ?? '',
            toMonth: meta.toMonth ?? '',
            toBudget: meta.toBudget ?? '',
            notes: backend.notes ?? '',
        };
    }
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
