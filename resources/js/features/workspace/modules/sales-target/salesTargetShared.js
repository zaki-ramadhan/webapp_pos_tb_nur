export function buildTargetState(source = {}, config) {
    const detailConfig = source.detailConfig ?? config.draft?.detailConfig ?? {};

    return {
        name: source.name ?? config.draft?.name ?? '',
        targetType: source.targetType ?? config.draft?.targetType ?? '',
        branch: source.branch ?? config.draft?.branch ?? '',
        startDate: source.startDate ?? config.draft?.startDate ?? '',
        endDate: source.endDate ?? config.draft?.endDate ?? '',
        detailSearch: source.detailSearch ?? '',
        detailTitle: detailConfig.title ?? '',
        detailSearchPlaceholder: detailConfig.searchPlaceholder ?? '',
        detailColumns: detailConfig.columns ?? [],
        detailRows: detailConfig.rows ?? [],
        detailModal: detailConfig.modal ?? null,
        notes: source.notes ?? config.draft?.notes ?? '',
        analyst: source.analyst ?? config.draft?.analyst ?? '',
    };
}

export function findTargetRecord(config, activeLevel2Tab) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

    if (!recordId) {
        return null;
    }

    return (config.table.rows ?? []).find((row) => row.id === recordId) ?? null;
}
