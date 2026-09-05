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

export function extractCleanAccountName(val) {
    if (!val) return '';
    if (typeof val === 'object') {
        const inner = val.name ?? val.accountName ?? val.label ?? val.title ?? val.code ?? '';
        return extractCleanAccountName(inner);
    }
    let str = String(val).trim();
    if (!str) return '';
    str = str.replace(/^[\[\(].*?[\]\)]\s*/, '').trim();
    str = str.replace(/^[0-9]+([.-][0-9]+)*\s*[-–—:]?\s*/, '').trim();
    return str || String(val).trim();
}

export function buildTotals(values) {
    const rawTransfer = (values.transferValue !== undefined && values.transferValue !== null && values.transferValue !== '')
        ? values.transferValue
        : values.blurredTransferValue;
    const transferAmount = parseNumericInput(rawTransfer);
    const exchangeRate = parseNumericInput(values.exchangeRate);
    const resultAmount = exchangeRate > 0 ? transferAmount * exchangeRate : transferAmount;
    const transferPrefix = values.transferPrefix || '';
    const resultPrefix = values.resultPrefix || '';

    let feeFromVal = 0;
    let feeToVal = 0;

    (values.feeRows ?? []).forEach((row) => {
        const amt = parseNumericInput(row.amount);
        const chargedTo = String(row.chargedTo ?? '').toLowerCase();
        if (chargedTo.includes('tujuan') || chargedTo.includes('ke kas') || chargedTo.includes('penerima')) {
            feeToVal += amt;
        } else {
            feeFromVal += amt;
        }
    });

    const fromVal = transferAmount + feeFromVal;
    const toVal = resultAmount + feeToVal;

    const rawFrom = values.fromBankAccounts?.[0] || values.fromBankLabel || values.fromBank || '';
    const rawTo = values.toBankAccounts?.[0] || values.toBankLabel || values.toBank || '';
    const fromAccountName = extractCleanAccountName(rawFrom);
    const toAccountName = extractCleanAccountName(rawTo);

    const cleanPrefix = (p) => p && p.trim() !== 'Rp' ? `${p.trim()} ` : '';
    return {
        fromTotalLabel: fromAccountName ? `Total ${fromAccountName}` : 'Total',
        fromTotalValue: fromVal > 0 ? `${cleanPrefix(transferPrefix)}${formatCurrencyValue(fromVal)}`.trim() : '0',
        toTotalLabel: toAccountName ? `Total ${toAccountName}` : 'Total',
        toTotalValue: toVal > 0 ? `${cleanPrefix(resultPrefix)}${formatCurrencyValue(toVal)}`.trim() : '0',
    };
}

export function applyBankTransferComputedValues(values) {
    const rawTransfer = (values.transferValue !== undefined && values.transferValue !== null && values.transferValue !== '')
        ? values.transferValue
        : values.blurredTransferValue;
    const transferAmount = parseNumericInput(rawTransfer);
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
