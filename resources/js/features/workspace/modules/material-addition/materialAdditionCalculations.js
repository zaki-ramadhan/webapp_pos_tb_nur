import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function cloneItems(items = []) {
    return items.map((item) => ({
        ...item,
        unitLookup: cloneList(item.unitLookup ?? item.unit),
        warehouse: cloneList(item.warehouse),
        department: cloneList(item.department),
        serialNumbers: [...(item.serialNumbers ?? [])],
    }));
}

export function cloneAdditionalCosts(rows = []) {
    return rows.map((row) => ({ ...row }));
}

export function buildFormValues(source = {}) {
    return {
        ...source,
        branches: cloneList(source.branches),
        items: cloneItems(source.items),
        additionalCosts: cloneAdditionalCosts(source.additionalCosts),
        itemModal: source.itemModal
            ? {
                  ...source.itemModal,
                  tabs: (source.itemModal.tabs ?? []).map((tab) => ({ ...tab })),
              }
            : null,
    };
}

export function buildItemCountLabel(items = []) {
    if (!items.length) {
        return 'Rincian Barang';
    }

    const totalQuantity = items.reduce((sum, item) => sum + parseNumericInput(item.quantity), 0);

    return `${items.length} Barang (${totalQuantity})`;
}

export function applyMaterialAdditionItems(values, items) {
    return {
        ...values,
        items,
        itemCountLabel: buildItemCountLabel(items),
    };
}

export function applyMaterialAdditionCharges(values, additionalCosts) {
    return {
        ...values,
        additionalCosts,
    };
}
