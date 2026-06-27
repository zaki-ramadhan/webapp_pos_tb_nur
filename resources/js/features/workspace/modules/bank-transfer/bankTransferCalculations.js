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

function extractCleanAccountName(label) {
    if (!label) return '';
    const match = label.match(/^\[.*?\]\s*(.*)$/);
    return match ? match[1].trim() : label.trim();
}

export function buildTotals(values) {
    const transferAmount = parseNumericInput(values.transferValue);
    const feeAmount = (values.feeRows ?? []).reduce((sum, row) => sum + parseNumericInput(row.amount), 0);
    const resultAmount = parseNumericInput(values.resultValue || values.transferValue);
    const transferPrefix = values.transferPrefix || '';
    const resultPrefix = values.resultPrefix || '';

    const fromVal = transferAmount + feeAmount;
    const toVal = resultAmount;

    const fromAccountName = extractCleanAccountName(values.fromBankAccounts?.[0]);
    const toAccountName = extractCleanAccountName(values.toBankAccounts?.[0]);

    return {
        fromTotalLabel: fromAccountName ? `Total ${fromAccountName}` : 'Total',
        fromTotalValue: fromVal > 0 ? `${transferPrefix} ${formatCurrencyValue(fromVal)}`.trim() : '0',
        toTotalLabel: toAccountName ? `Total ${toAccountName}` : 'Total',
        toTotalValue: toVal > 0 ? `${resultPrefix} ${formatCurrencyValue(toVal)}`.trim() : '0',
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
