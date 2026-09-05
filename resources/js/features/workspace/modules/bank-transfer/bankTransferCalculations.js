import { parseNumericInput, formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';

export function truncateText(value, limit = 22) {
    const normalizedValue = String(value ?? '').trim();

    if (normalizedValue.length <= limit) {
        return normalizedValue;
    }

    return `${normalizedValue.slice(0, limit - 3)}...`;
}

export function deriveTransferAmounts(record) {
    const transferLine = (record.lines ?? []).find((line) => line.attributes?.kind === 'transfer') ?? record.lines?.[0] ?? null;
    const feeLines = (record.lines ?? []).filter((line) => line.attributes?.kind === 'fee');
    const transferAmount = Number(
        record.metadata?.transfer_amount
        ?? transferLine?.total_amount
        ?? record.total_amount
        ?? record.paid_amount
        ?? 0,
    );
    const feeAmount = Number(
        record.metadata?.fee_total
        ?? feeLines.reduce((sum, line) => sum + Number(line.total_amount ?? 0), 0),
    );

    return {
        transferLine,
        feeLines,
        transferAmount,
        feeAmount,
    };
}

export function extractCleanAccountName(label) {
    if (!label) return '';
    const match = label.match(/^\[.*?\]\s*(.*)$/);
    return match ? match[1].trim() : label.trim();
}

export function buildTotals(values) {
    const transferAmount = parseNumericInput(values.blurredTransferValue ?? values.transferValue);
    const exchangeRate = parseNumericInput(values.exchangeRate);
    const resultAmount = exchangeRate > 0 ? transferAmount * exchangeRate : transferAmount;
    const transferPrefix = values.transferPrefix || '';
    const resultPrefix = values.resultPrefix || '';

    let feeFromVal = 0;
    let feeToVal = 0;

    (values.feeRows ?? []).forEach((row) => {
        const amt = parseNumericInput(row.amount);
        if (row.chargedTo === 'Bank Tujuan' || row.chargedTo === 'Ke Kas/Bank' || row.chargedTo === 'Bank Penerima') {
            feeToVal += amt;
        } else {
            feeFromVal += amt;
        }
    });

    const fromVal = transferAmount + feeFromVal;
    const toVal = Math.max(0, resultAmount - feeToVal);

    const fromAccountName = extractCleanAccountName(values.fromBankAccounts?.[0]);
    const toAccountName = extractCleanAccountName(values.toBankAccounts?.[0]);

    const cleanPrefix = (p) => p && p.trim() !== 'Rp' ? `${p.trim()} ` : '';
    return {
        fromTotalLabel: fromAccountName ? `Total ${fromAccountName}` : 'Total',
        fromTotalValue: fromVal > 0 ? `${cleanPrefix(transferPrefix)}${formatCurrencyValue(fromVal)}`.trim() : '0',
        toTotalLabel: toAccountName ? `Total ${toAccountName}` : 'Total',
        toTotalValue: toVal > 0 ? `${cleanPrefix(resultPrefix)}${formatCurrencyValue(toVal)}`.trim() : '0',
    };
}

export function applyBankTransferComputedValues(values) {
    const transferAmount = parseNumericInput(values.transferValue);
    const exchangeRate = parseNumericInput(values.exchangeRate);
    const resultAmount = exchangeRate > 0 ? transferAmount * exchangeRate : transferAmount;
    const baseValues = {
        ...values,
        transferPrefix: values.transferPrefix || 'Rp',
        resultPrefix: values.resultPrefix || 'Rp',
        resultValue: formatCurrencyValue(resultAmount),
    };

    return {
        ...baseValues,
        ...buildTotals(baseValues),
    };
}
