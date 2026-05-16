export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function cloneItems(items = []) {
    return items.map((item) => ({
        ...item,
        unitLookup: cloneList(item.unitLookup ?? item.unit),
        serialNumbers: [...(item.serialNumbers ?? [])],
    }));
}

export function buildFormValues(source = {}) {
    return {
        ...source,
        warehouse: cloneList(source.warehouse),
        counterpartWarehouse: cloneList(source.counterpartWarehouse),
        branches: cloneList(source.branches),
        items: cloneItems(source.items),
        itemModal: source.itemModal
            ? {
                  ...source.itemModal,
                  tabs: (source.itemModal.tabs ?? []).map((tab) => ({ ...tab })),
              }
            : null,
    };
}
