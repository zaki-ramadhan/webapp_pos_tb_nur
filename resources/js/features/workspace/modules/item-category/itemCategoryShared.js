export function buildFormValues(config, detailRow = null) {
    const detailRecord = detailRow ? config.detailRecords?.[detailRow.id] : null;
    const source = {
        ...(config.createDefaults ?? {}),
        ...(detailRecord ?? {}),
    };

    return {
        name: source.name ?? '',
        isDefault: Boolean(source.isDefault),
        isSubCategory: Boolean(source.isSubCategory),
        parentId: source.parentId ?? source.parent_id ?? '',
        parentName: source.parentName ?? source.parent?.name ?? '',
        accounts: (config.accountFields ?? []).reduce((result, field) => {
            result[field.id] = source.accounts?.[field.id] ?? '';
            return result;
        }, {}),
        accountIds: (config.accountFields ?? []).reduce((result, field) => {
            result[field.id] = source.accountIds?.[field.id] ?? '';
            return result;
        }, {}),
    };
}

export function resolveRowAlignClassName(align) {
    return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
}
