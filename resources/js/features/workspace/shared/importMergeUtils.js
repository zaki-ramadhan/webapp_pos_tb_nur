import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

/**
 * Gabungkan item impor ke array item yang ada.
 */
export function mergeImportedItems(existingItems, importedItems) {
    const merged = existingItems.map(item => ({ ...item }));

    for (const incoming of importedItems) {
        const existingIndex = merged.findIndex(
            item => String(item.code ?? '').toLowerCase() === String(incoming.code ?? '').toLowerCase(),
        );

        if (existingIndex !== -1) {
            const existing = merged[existingIndex];
            const prevQty = parseAmountInput(existing.quantity, { allowDecimal: true, emptyValue: 0 }) ?? 0;
            const addQty = parseAmountInput(incoming.quantity, { allowDecimal: true, emptyValue: 0 }) ?? 0;
            merged[existingIndex] = {
                ...existing,
                quantity: String(prevQty + addQty),
            };
        } else {
            merged.push({ ...incoming });
        }
    }

    return merged;
}
