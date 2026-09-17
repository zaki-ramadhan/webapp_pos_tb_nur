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
        dppPercent: state.dppPercent,
        dppFactor: state.dppFactor,
        address: state.address,
        notes: state.notes,
        __bankAccountId: state.__bankAccountId,
        bankAccounts: state.bankAccounts,
    };
}

export function calculateDepositTaxes(baseAmount, taxEnabled, taxId, taxRateValue, taxIncluded, dppFactor = 1.0) {
    const taxRate = (taxEnabled && taxId) ? (taxRateValue ?? 0) / 100 : 0;
    const factor = Number.isFinite(dppFactor) && dppFactor > 0 ? dppFactor : 1.0;

    let taxTotal = 0;
    let subtotalAmount = baseAmount;
    let totalAmount = baseAmount;

    if (taxRate > 0) {
        if (taxIncluded) {
            const dpp = baseAmount / (1 + taxRate * factor);
            taxTotal = Math.round((dpp * factor) * taxRate);
            subtotalAmount = baseAmount;
            totalAmount = baseAmount;
        } else {
            const dpp = baseAmount * factor;
            taxTotal = Math.round(dpp * taxRate);
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
