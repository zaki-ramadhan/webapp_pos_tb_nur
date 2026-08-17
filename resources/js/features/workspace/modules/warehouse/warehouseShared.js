export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

/**
 * Buat entry form dari raw backend record atau mock detailRecords.
 * Jika record null → gunakan defaults (mode buat baru).
 */
export function buildWarehouseEntry(backendRecord, defaults) {
    if (!backendRecord) {
        return { ...defaults };
    }

    // Backend record (dari API show/index)
    if (backendRecord.__source === 'backend') {
        const r = backendRecord;
        return {
            id: r.id,
            code: r.code ?? '',
            name: r.name ?? '',
            description: r.description ?? '',
            responsiblePerson: r.responsible_person ?? r.responsiblePerson ?? '',
            isDamagedWarehouse: r.warehouse_type === 'damaged' || Boolean(r.isDamagedWarehouse),
            inactive: r.is_active === false || Boolean(r.inactive),
            allUsers: r.all_users !== false && r.allUsers !== false,
            street: r.street || r.branch?.street || '',
            city: r.city || r.branch?.city || '',
            postalCode: r.postal_code || r.postalCode || r.branch?.postal_code || '',
            province: r.province || r.branch?.province || '',
            country: r.country || r.branch?.country || '',
            groupBranch: cloneList(r.group_branch || r.groupBranch || (r.branch?.name ? [r.branch.name] : [])),
            users: cloneList(r.users),
            branchId: r.branch_id ?? r.branch?.id ?? r.branchId ?? null,
        };
    }

    // Mock detailRecord (dari config.detailRecords)
    return {
        id: backendRecord.id ?? null,
        code: backendRecord.code ?? '',
        name: backendRecord.name ?? '',
        description: backendRecord.description ?? '',
        responsiblePerson: backendRecord.responsiblePerson ?? backendRecord.responsible_person ?? '',
        isDamagedWarehouse: Boolean(backendRecord.isDamagedWarehouse || backendRecord.warehouse_type === 'damaged'),
        inactive: Boolean(backendRecord.inactive || backendRecord.is_active === false),
        allUsers: backendRecord.allUsers ?? (backendRecord.all_users !== false),
        street: backendRecord.street || backendRecord.branch?.street || '',
        city: backendRecord.city || backendRecord.branch?.city || '',
        postalCode: backendRecord.postalCode || backendRecord.postal_code || backendRecord.branch?.postal_code || '',
        province: backendRecord.province || backendRecord.branch?.province || '',
        country: backendRecord.country || backendRecord.branch?.country || '',
        groupBranch: cloneList(backendRecord.groupBranch || backendRecord.group_branch || (backendRecord.branch?.name ? [backendRecord.branch.name] : [])),
        users: cloneList(backendRecord.users),
        branchId: backendRecord.branchId ?? backendRecord.branch_id ?? backendRecord.branch?.id ?? null,
    };
}

/** Peta baris tabel (index list) — hanya field tampilan tabel */
export function mapWarehouseTableRow(record) {
    return {
        id: record.id,
        code: record.code ?? '',
        name: record.name ?? '',
        tabLabel: record.name ?? '',
        address: record.street ?? '',
        branchId: record.branch_id ?? record.branch?.id ?? null,
        inactiveValue: record.is_active === false ? 'yes' : 'no',
        
      // Pemetaan kolom baru untuk Settings

        description: record.description ?? '',
        responsiblePerson: record.responsible_person ?? record.responsiblePerson ?? '',
        isDamagedWarehouseText: record.warehouse_type === 'damaged' || record.isDamagedWarehouse ? 'Ya' : 'Tidak',
        fullAddress: [record.street, record.city, record.province].filter(Boolean).join(', ') || '-',
        allUsersText: record.all_users !== false ? 'Semua Pengguna' : 'Pengguna Tertentu',
        isActiveText: record.is_active === false ? 'Ya' : 'Tidak',
    };
}

/** Legacy compat – dipakai buildFormValues lama di FormView */
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
