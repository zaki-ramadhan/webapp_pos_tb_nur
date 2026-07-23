import { formatAmountInput, parseAmountInput } from '@/features/workspace/shared/amountFormatting';

export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function toNumericValue(value) {
    return parseAmountInput(value, { allowDecimal: true, allowNegative: true, emptyValue: 0 }) ?? 0;
}

export function buildItemCountLabel(items = [], emptyTitle = 'Rincian Barang') {
    if (!items.length) {
        return emptyTitle;
    }

    const totalQuantity = items.reduce((sum, item) => sum + toNumericValue(item.quantity), 0);

    return `${formatAmountInput(items.length)} Barang (${formatAmountInput(totalQuantity)})`;
}
