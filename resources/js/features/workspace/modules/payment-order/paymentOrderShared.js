export function buildFormValues(config) {
    return {
        transferDueDate: config.draft?.transferDueDate ?? '',
        paymentMethod: config.draft?.paymentMethod ?? '',
        autoNumber: config.draft?.autoNumber ?? true,
        numberingType: config.draft?.numberingType ?? '',
        invoiceSearch: config.draft?.invoiceSearch ?? '',
        notes: config.draft?.notes ?? '',
        branches: [...(config.draft?.branches ?? [])],
        footerValue: config.draft?.footerValue ?? '0',
    };
}
