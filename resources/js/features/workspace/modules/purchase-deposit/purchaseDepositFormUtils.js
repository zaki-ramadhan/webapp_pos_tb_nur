export function getComparableTransactionFields(state) {
    if (!state) return null;
    return {
        __supplierId: state.__supplierId,
        supplier: state.supplier,
        entryDate: state.entryDate,
        autoNumber: state.autoNumber,
        numberingType: state.numberingType,
        documentNumber: state.documentNumber,
        depositAmount: state.depositAmount,
        __taxId: state.__taxId,
        taxName: state.taxName,
        taxEnabled: state.taxEnabled,
        taxIncluded: state.taxIncluded,
        taxInvoiceDate: state.taxInvoiceDate,
        taxTransactionType: state.taxTransactionType,
        taxInvoiceNumber: state.taxInvoiceNumber,
        taxRate: state.taxRate,
        address: state.address,
        notes: state.notes,
        __bankAccountId: state.__bankAccountId,
        bankAccounts: state.bankAccounts,
    };
}

export function calculateDepositTaxes(baseAmount, taxEnabled, taxId, taxRateValue, taxIncluded) {
    const taxRate = (taxEnabled && taxId) ? (taxRateValue ?? 0) / 100 : 0;

    let taxTotal = 0;
    let subtotalAmount = baseAmount;
    let totalAmount = baseAmount;

    if (taxRate > 0) {
        if (taxIncluded) {
            taxTotal = Math.round(baseAmount - (baseAmount / (1 + taxRate)));
            subtotalAmount = baseAmount - taxTotal;
            totalAmount = baseAmount;
        } else {
            taxTotal = Math.round(baseAmount * taxRate);
            subtotalAmount = baseAmount;
            totalAmount = baseAmount + taxTotal;
        }
    }

    return {
        subtotal: `Rp ${subtotalAmount.toLocaleString('id-ID')}`,
        taxTotalFormatted: `Rp ${taxTotal.toLocaleString('id-ID')}`,
        total: `Rp ${totalAmount.toLocaleString('id-ID')}`,
    };
}
