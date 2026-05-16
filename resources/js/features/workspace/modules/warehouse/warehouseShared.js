export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function buildFormValues(config, detailRow = null) {
    const defaults = config.createDefaults ?? {};
    const detailRecord = detailRow ? config.detailRecords?.[detailRow.id] : null;
    const source = {
        ...defaults,
        ...(detailRecord ?? {}),
    };

    return {
        name: source.name ?? '',
        description: source.description ?? '',
        responsiblePerson: source.responsiblePerson ?? '',
        isDamagedWarehouse: Boolean(source.isDamagedWarehouse),
        inactive: Boolean(source.inactive),
        allUsers: source.allUsers ?? true,
        street: source.street ?? '',
        city: source.city ?? '',
        postalCode: source.postalCode ?? '',
        province: source.province ?? '',
        country: source.country ?? '',
        groupBranch: cloneList(source.groupBranch),
        users: cloneList(source.users),
    };
}
