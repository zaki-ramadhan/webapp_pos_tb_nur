export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function toNumericValue(value) {
    const normalizedValue = Number.parseFloat(String(value ?? '0').replace(/[^\d.-]/g, ''));

    return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

export function buildItemCountLabel(items = [], emptyTitle = 'Rincian Barang') {
    if (!items.length) {
        return emptyTitle;
    }

    const totalQuantity = items.reduce((sum, item) => sum + toNumericValue(item.quantity), 0);

    return `${items.length} Barang (${totalQuantity})`;
}
