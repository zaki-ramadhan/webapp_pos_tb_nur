export function buildCommissionFormValues(config, detailRow = null) {
    const source = detailRow ?? config.draft ?? {};

    return {
        periodType: source.periodType ?? 'forever',
        name: source.name ?? '',
        sellerScope: source.sellerScope ?? 'all',
        orderSelections: [...(source.orderSelections ?? ['first'])],
        productScope: source.productScope ?? '',
        supplierScope: source.supplierScope ?? '',
        conditionType: source.conditionType ?? 'none',
        salesValueFrom: source.salesValueFrom ?? '',
        salesValueTo: source.salesValueTo ?? '',
        quantityFrom: source.quantityFrom ?? '',
        quantityTo: source.quantityTo ?? '',
        quantityUnit: source.quantityUnit ?? '',
        rewardType: source.rewardType ?? '',
        rewardValue: source.rewardValue ?? '',
        rewardBase: source.rewardBase ?? '',
        notes: source.notes ?? '',
        inactive: Boolean(source.inactive),
    };
}
