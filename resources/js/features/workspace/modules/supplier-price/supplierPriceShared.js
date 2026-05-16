export function buildFormValues(config) {
    return {
        supplier: [...(config.draft?.supplier ?? [])],
        effectiveDate: config.draft?.effectiveDate ?? '',
        autoEndDate: config.draft?.autoEndDate ?? false,
        autoNumber: config.draft?.autoNumber ?? true,
        numberingType: config.draft?.numberingType ?? '',
        currencies: [...(config.draft?.currencies ?? [])],
        notes: config.draft?.notes ?? '',
        itemSearch: config.draft?.itemSearch ?? '',
    };
}
