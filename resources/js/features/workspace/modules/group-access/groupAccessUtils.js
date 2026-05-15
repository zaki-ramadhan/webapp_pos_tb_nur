export function clonePermissionCategories(categories = []) {
    return categories.map((category) => ({
        ...category,
        sections: (category.sections ?? []).map((section) => ({
            ...section,
            rows: (section.rows ?? []).map((row) => ({
                ...row,
                permissions: { ...(row.permissions ?? {}) },
            })),
        })),
    }));
}

export function buildGeneralState(general = {}) {
    const selectedOption =
        general.accessLimitations?.options?.find((option) => option.checked) ??
        general.accessLimitations?.options?.[0] ??
        null;

    return {
        groupName: general.nameField?.value ?? '',
        accessLimitationId: selectedOption?.id ?? '',
        selectedUsers: [...(general.userSelection?.selected ?? [])],
    };
}

export function buildPresetProfile(presetId) {
    switch (presetId) {
        case 'administrator':
            return {
                active: true,
                create: true,
                update: true,
                delete: true,
                view: true,
            };
        case 'supervisor':
            return {
                active: true,
                create: true,
                update: true,
                delete: false,
                view: true,
            };
        case 'viewer':
            return {
                active: true,
                create: false,
                update: false,
                delete: false,
                view: true,
            };
        case 'operator':
        default:
            return {
                active: true,
                create: true,
                update: true,
                delete: false,
                view: true,
            };
    }
}

export function applyPermissionPreset(categories, preset) {
    return categories.map((category) => ({
        ...category,
        sections: category.sections.map((section) => ({
            ...section,
            rows: section.rows.map((row) => ({
                ...row,
                permissions: {
                    ...row.permissions,
                    ...preset,
                },
            })),
        })),
    }));
}

export function buildInitialPermissionCategories(permissions = {}, permissionPreset = null) {
    const categories = clonePermissionCategories(permissions.categories);

    if (!permissionPreset) {
        return categories;
    }

    return applyPermissionPreset(categories, buildPresetProfile(permissionPreset));
}

export function mergeGroupAccessForm(baseForm = {}, overrideForm = {}) {
    return {
        ...baseForm,
        ...overrideForm,
        tabs: overrideForm.tabs ?? baseForm.tabs,
        actions: overrideForm.actions ?? baseForm.actions,
        general: {
            ...(baseForm.general ?? {}),
            ...(overrideForm.general ?? {}),
            nameField: {
                ...(baseForm.general?.nameField ?? {}),
                ...(overrideForm.general?.nameField ?? {}),
            },
            accessLimitations: {
                ...(baseForm.general?.accessLimitations ?? {}),
                ...(overrideForm.general?.accessLimitations ?? {}),
                options:
                    overrideForm.general?.accessLimitations?.options ??
                    baseForm.general?.accessLimitations?.options ??
                    [],
            },
            userSelection: {
                ...(baseForm.general?.userSelection ?? {}),
                ...(overrideForm.general?.userSelection ?? {}),
                selected:
                    overrideForm.general?.userSelection?.selected ??
                    baseForm.general?.userSelection?.selected ??
                    [],
            },
        },
        permissions: {
            ...(baseForm.permissions ?? {}),
            ...(overrideForm.permissions ?? {}),
            columns: overrideForm.permissions?.columns ?? baseForm.permissions?.columns ?? [],
            copyAccessOptions:
                overrideForm.permissions?.copyAccessOptions ?? baseForm.permissions?.copyAccessOptions ?? [],
            categories: overrideForm.permissions?.categories ?? baseForm.permissions?.categories ?? [],
        },
    };
}

export function filterSections(sections, keyword) {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
        return sections;
    }

    return sections
        .map((section) => ({
            ...section,
            rows: section.rows.filter((row) => row.label.toLowerCase().includes(normalizedKeyword)),
        }))
        .filter((section) => section.rows.length);
}

export function resolveDeleteConfirmationMessage(template, groupName) {
    return String(template ?? '').replace('{name}', groupName || '-');
}
