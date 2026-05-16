export function buildWorkCompletionFormState(source = {}) {
    return {
        ...source,
        items: [...(source.items ?? [])],
        branches: [...(source.branches ?? [])],
        dockActions: [...(source.dockActions ?? [])],
    };
}

export function resolveWorkCompletionAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}
