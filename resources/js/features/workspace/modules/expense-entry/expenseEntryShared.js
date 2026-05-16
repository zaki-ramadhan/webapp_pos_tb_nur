export function buildFormState(source = {}) {
    return {
        liabilityAccounts: [...(source.liabilityAccounts ?? [])],
        entryDate: source.entryDate ?? '',
        autoNumber: source.autoNumber ?? true,
        numberingType: source.numberingType ?? '',
        documentNumber: source.documentNumber ?? '',
        dueDate: source.dueDate ?? '',
        branches: [...(source.branches ?? [])],
        notes: source.notes ?? '',
        lineLookup: source.lineLookup ?? '',
        lineItems: [...(source.lineItems ?? [])],
        paidAmount: source.paidAmount ?? 'Rp 0',
        status: source.status ?? '-',
        totalValue: source.totalValue ?? '0',
        saveTone: source.saveTone ?? 'primary',
    };
}
