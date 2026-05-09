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

export function buildWorkOrderFormValues(source = {}) {
    return {
        ...source,
        expenseAccounts: cloneList(source.expenseAccounts),
        varianceAccounts: cloneList(source.varianceAccounts),
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

export function resolveWorkOrderCellAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}
