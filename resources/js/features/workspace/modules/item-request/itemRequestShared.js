export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function cloneItems(items) {
    return (items ?? []).map((item) => ({
        ...item,
        unit: cloneList(item.unit),
        department: cloneList(item.department),
    }));
}

export function buildFormValues(source = {}) {
    return {
        ...source,
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
