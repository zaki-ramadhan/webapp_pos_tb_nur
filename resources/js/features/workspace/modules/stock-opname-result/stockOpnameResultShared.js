export function cloneItems(items = []) {
    return items.map((item) => ({ ...item }));
}

export function buildFormValues(source = {}) {
    return {
        ...source,
        takeOptions: source.takeOptions?.length ? [...source.takeOptions] : [],
        resultItems: cloneItems(source.resultItems),
        itemModal: source.itemModal ? { ...source.itemModal } : null,
    };
}
