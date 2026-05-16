export function buildCreateValues(config) {
    return {
        discountDays: config.createDefaults?.discountDays ?? '',
        discountPercent: config.createDefaults?.discountPercent ?? '',
        dueDays: config.createDefaults?.dueDays ?? '',
        description: config.createDefaults?.description ?? '',
        isDefault: Boolean(config.createDefaults?.isDefault),
    };
}

export function buildDetailValues(config, recordId) {
    const record = config.records.find((item) => item.id === recordId);

    return {
        name: record?.name ?? '',
        isDefault: Boolean(record?.isDefault),
        isInactive: Boolean(record?.isInactive),
    };
}
