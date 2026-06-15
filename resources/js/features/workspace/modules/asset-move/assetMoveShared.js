export function cloneAssetMoveList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function cloneAssetMoveItems(items = []) {
    return items.map((item) => ({ ...item }));
}

export function buildAssetMoveFormValues(source = {}) {
    return {
        ...source,
        sourceAddress: cloneAssetMoveList(source.sourceAddress),
        destinationAddress: cloneAssetMoveList(source.destinationAddress),
        items: cloneAssetMoveItems(source.items),
        itemModal: source.itemModal
            ? {
                  ...source.itemModal,
                  tabs: (source.itemModal.tabs ?? []).map((tab) => ({ ...tab })),
              }
            : null,
    };
}

export function resolveAssetMoveAlignClassName(align) {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
}
