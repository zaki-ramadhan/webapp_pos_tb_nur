export function getComparableTransactionFields(state) {
    if (!state) return null;
    return {
        __customerId: state.__customerId,
        __salesOrderId: state.__salesOrderId,
        customer: state.customer,
        entryDate: state.entryDate,
        autoNumber: state.autoNumber,
        numberingType: state.numberingType,
        documentNumber: state.documentNumber,
        currency: state.currency,
        depositAmount: state.depositAmount,
        purchaseOrderNumber: state.purchaseOrderNumber,
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
        __pphId: state.__pphId,
        pphCode: state.pphCode,
        pphName: state.pphName,
        pphRate: state.pphRate,
        paymentTermName: state.paymentTermName,
        address: state.address,
        notes: state.notes,
    };
}

export function calculateDepositTaxes(baseAmount, taxEnabled, taxId, taxRateValue, taxIncluded, dppFactor = 1.0, pphId = null, pphRateValue = 0) {
    const taxRate = (taxEnabled && (taxId || taxRateValue)) ? (Number(taxRateValue) || 0) / 100 : 0;
    const factor = Number.isFinite(dppFactor) && dppFactor > 0 ? dppFactor : 1.0;
    const pphRate = (taxEnabled && pphId) ? (Number(pphRateValue) || 0) / 100 : 0;
    
    let taxTotal = 0;
    let dpp = baseAmount;
    let subtotalAmount = baseAmount;
    let totalAmount = baseAmount;

    if (taxRate > 0) {
        if (taxIncluded) {
            dpp = baseAmount / (1 + taxRate * factor);
            taxTotal = Math.round((dpp * factor) * taxRate);
            subtotalAmount = baseAmount;
            totalAmount = baseAmount;
        } else {
            dpp = baseAmount * factor;
            taxTotal = Math.round(dpp * taxRate);
            subtotalAmount = baseAmount;
            totalAmount = baseAmount + taxTotal;
        }
    } else {
        dpp = baseAmount * factor;
    }

    const pphTotal = pphRate > 0 ? Math.round(dpp * pphRate) : 0;

    return {
        subtotal: `Rp ${subtotalAmount.toLocaleString('id-ID')}`,
        taxTotalFormatted: `Rp ${taxTotal.toLocaleString('id-ID')}`,
        total: `Rp ${totalAmount.toLocaleString('id-ID')}`,
        pphTotal,
        pphTotalFormatted: `Rp ${pphTotal.toLocaleString('id-ID')}`,
    };
}
