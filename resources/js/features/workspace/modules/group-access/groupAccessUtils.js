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

export function normalizeSelectedUsers(users = []) {
    return (users ?? [])
        .map((user) => {
            if (!user) {
                return null;
            }

            if (typeof user === 'string') {
                return {
                    id: null,
                    label: user,
                };
            }

            return {
                id: user.id ?? null,
                label: user.label ?? user.name ?? user.email ?? '',
            };
        })
        .filter((user) => user && user.label);
}

export function buildGeneralState(general = {}) {
    const selectedOption =
        general.accessLimitations?.options?.find((option) => option.checked) ??
        general.accessLimitations?.options?.[0] ??
        null;

    return {
        groupName: general.nameField?.value ?? '',
        accessLimitationId: selectedOption?.id ?? '',
        selectedUsers: normalizeSelectedUsers(general.userSelection?.selected),
        accessLimitDays: general.accessLimitDays ?? 'Senin-Jumat',
        accessLimitStartHour: general.accessLimitStartHour ?? '00',
        accessLimitEndHour: general.accessLimitEndHour ?? '12',
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

function buildPermissionMap(permissions = []) {
    return (permissions ?? []).reduce((result, permission) => {
        const menuKey = String(permission.menu_key ?? '').trim();

        if (!menuKey) {
            return result;
        }

        result[menuKey] = {
            active: Boolean(permission.can_access),
            create: Boolean(permission.can_create),
            update: Boolean(permission.can_update),
            delete: Boolean(permission.can_delete),
            view: Boolean(permission.can_view),
        };

        return result;
    }, {});
}

export function applyBackendPermissions(categories = [], permissions = []) {
    const permissionMap = buildPermissionMap(permissions);

    return clonePermissionCategories(categories).map((category) => ({
        ...category,
        sections: (category.sections ?? []).map((section) => ({
            ...section,
            rows: (section.rows ?? []).map((row) => ({
                ...row,
                permissions: permissionMap[row.id]
                    ? {
                          ...row.permissions,
                          ...permissionMap[row.id],
                      }
                    : { ...(row.permissions ?? {}) },
            })),
        })),
    }));
}

export function buildGroupAccessDetailForm(baseForm = {}, record = null) {
    if (!record) {
        return {};
    }

    const selectedUsers = normalizeSelectedUsers(
        Array.isArray(record.users)
            ? record.users.map((user) => ({
                  id: user.id ?? null,
                  label: user.name ?? user.email ?? `Pengguna #${user.id ?? ''}`,
              }))
            : [],
    );

    return {
        defaultTabId: 'general',
        permissionPreset: null,
        general: {
            ...(baseForm.general ?? {}),
            nameField: {
                ...(baseForm.general?.nameField ?? {}),
                value: record.name ?? '',
            },
            accessLimitations: {
                ...(baseForm.general?.accessLimitations ?? {}),
                options: (baseForm.general?.accessLimitations?.options ?? []).map((option) => ({
                    ...option,
                    checked: option.id === (record.access_limit_type ?? 'follow-preference'),
                })),
            },
            userSelection: {
                ...(baseForm.general?.userSelection ?? {}),
                selected: selectedUsers,
            },
            accessLimitDays: record.access_limit_days ?? 'Senin-Jumat',
            accessLimitStartHour: record.access_limit_start_hour ?? '00',
            accessLimitEndHour: record.access_limit_end_hour ?? '12',
        },
        permissions: {
            ...(baseForm.permissions ?? {}),
            categories: applyBackendPermissions(baseForm.permissions?.categories ?? [], record.permissions ?? []),
        },
    };
}

export function buildGroupAccessRow(record, baseForm = {}) {
    const users = Array.isArray(record.users) ? record.users : [];

    return {
        id: String(record.id),
        groupName: record.name ?? '',
        userList: users.length
            ? users
                  .map((user) => user.name ?? user.email ?? `Pengguna #${user.id ?? ''}`)
                  .filter(Boolean)
                  .join(', ')
            : 'Belum ada pengguna',
        tabLabel: record.name ?? `Akses Grup #${record.id}`,
        detailForm: buildGroupAccessDetailForm(baseForm, record),
        __backendRecord: record,
    };
}

export function buildGroupAccessPermissionsPayload(categories = []) {
    return clonePermissionCategories(categories).flatMap((category) =>
        (category.sections ?? []).flatMap((section) =>
            (section.rows ?? []).map((row) => ({
                menu_key: row.id,
                can_access: Boolean(row.permissions?.active),
                can_create: Boolean(row.permissions?.create),
                can_update: Boolean(row.permissions?.update),
                can_delete: Boolean(row.permissions?.delete),
                can_view: Boolean(row.permissions?.view),
            })),
        ),
    );
}

export function buildGroupAccessPayload(generalValues, permissionCategories) {
    return {
        name: String(generalValues.groupName ?? '').trim(),
        description: null,
        is_active: true,
        access_limit_type: String(generalValues.accessLimitationId ?? 'follow-preference'),
        access_limit_days: generalValues.accessLimitationId === 'limited-time' ? String(generalValues.accessLimitDays ?? 'Senin-Jumat') : null,
        access_limit_start_hour: generalValues.accessLimitationId === 'limited-time' ? String(generalValues.accessLimitStartHour ?? '00') : null,
        access_limit_end_hour: generalValues.accessLimitationId === 'limited-time' ? String(generalValues.accessLimitEndHour ?? '12') : null,
        user_ids: normalizeSelectedUsers(generalValues.selectedUsers)
            .map((user) => user.id)
            .filter((id) => id !== null && id !== undefined && id !== '' && Number.isInteger(Number(id))),
        permissions: buildGroupAccessPermissionsPayload(permissionCategories),
    };
}

export function buildGroupAccessComparableState(generalValues, permissionCategories) {
    return {
        groupName: String(generalValues.groupName ?? '').trim(),
        accessLimitationId: String(generalValues.accessLimitationId ?? '').trim(),
        accessLimitDays: String(generalValues.accessLimitDays ?? 'Senin-Jumat'),
        accessLimitStartHour: String(generalValues.accessLimitStartHour ?? '00'),
        accessLimitEndHour: String(generalValues.accessLimitEndHour ?? '12'),
        selectedUsers: normalizeSelectedUsers(generalValues.selectedUsers).map((user) => ({
            id: user.id ?? null,
            label: user.label,
        })),
        permissions: buildGroupAccessPermissionsPayload(permissionCategories),
    };
}
