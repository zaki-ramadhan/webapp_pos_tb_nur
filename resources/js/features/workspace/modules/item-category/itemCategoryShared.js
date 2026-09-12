export function buildFormValues(config, detailRow = null) {
    const detailRecord = detailRow ? config?.detailRecords?.[detailRow.id] : null;
    const isDetail = Boolean(detailRow);
    const rows = config?.table?.rows ?? [];
    const hasAnyCategory = rows.length > 0;
    const hasDefaultCategory = rows.some((r) => r.isDefault);

    const source = {
        ...(config?.createDefaults ?? {}),
        ...(detailRecord ?? {}),
    };

    let defaultIsDefault = false;
    if (isDetail) {
        defaultIsDefault = Boolean(source.isDefault);
    } else {
        defaultIsDefault = !hasAnyCategory || !hasDefaultCategory;
    }

    return {
        id: detailRow?.id ?? source.id ?? '',
        name: source.name ?? '',
        isDefault: defaultIsDefault,
        isSubCategory: Boolean(source.isSubCategory),
        parentId: source.parentId ?? source.parent_id ?? '',
        parentName: source.parentName ?? source.parent?.name ?? '',
        accounts: (config?.accountFields ?? []).reduce((result, field) => {
            result[field.id] = source.accounts?.[field.id] ?? '';
            return result;
        }, {}),
        accountIds: (config?.accountFields ?? []).reduce((result, field) => {
            result[field.id] = source.accountIds?.[field.id] ?? '';
            return result;
        }, {}),
    };
}

export function resolveRowAlignClassName(align) {
    return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
}
