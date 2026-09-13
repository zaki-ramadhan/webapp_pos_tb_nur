export function buildDefaultCategoryAccounts(preferences = {}) {
    const getVal = (key, fallback) => {
        const val = preferences[key];
        if (Array.isArray(val) && val.length > 0) return val[0];
        if (typeof val === 'string' && val.trim()) return val.trim();
        return fallback;
    };

    return {
        inventoryAccount: getVal('accounts-items-inventory', '[110301] Persediaan Barang Dagang'),
        expenseAccount: getVal('accounts-items-expense', '[510102] Biaya Angkut Pembelian Barang'),
        salesAccount: getVal('accounts-items-sales', '[410101] Pendapatan Penjualan Barang Dagang'),
        salesReturnAccount: getVal('accounts-items-sales-return', ''),
        salesDiscountAccount: getVal('accounts-items-sales-discount', '[410103] Potongan / Diskon Penjualan'),
        costOfGoodsSoldAccount: getVal('accounts-items-cogs', '[510101] HPP Barang Dagang'),
        purchaseReturnAccount: getVal('accounts-items-purchase-return', '[110301] Persediaan Barang Dagang'),
        unbilledPurchaseAccount: getVal('accounts-items-uninvoiced-purchase', ''),
    };
}

export function buildFormValues(config, detailRow = null, preferences = {}) {
    const detailRecord = detailRow ? config?.detailRecords?.[detailRow.id] : null;
    const isDetail = Boolean(detailRow);
    const rows = config?.table?.rows ?? [];
    const hasAnyCategory = rows.length > 0;
    const hasDefaultCategory = rows.some((r) => r.isDefault);
    const defaultAccounts = buildDefaultCategoryAccounts(preferences);

    const source = {
        ...(config?.createDefaults ?? {}),
        ...(detailRecord ?? {}),
    };

    let defaultIsDefault = false;
    if (isDetail) {
        defaultIsDefault = Boolean(source.isDefault);
    } else {
        defaultIsDefault = !hasAnyCategory || !hasDefaultCategory;
    }

    return {
        id: detailRow?.id ?? source.id ?? '',
        name: source.name ?? '',
        isDefault: defaultIsDefault,
        isSubCategory: Boolean(source.isSubCategory),
        parentId: source.parentId ?? source.parent_id ?? '',
        parentName: source.parentName ?? source.parent?.name ?? '',
        accounts: (config?.accountFields ?? []).reduce((result, field) => {
            result[field.id] = source.accounts?.[field.id]
                ?? (isDetail ? '' : (defaultAccounts[field.id] ?? ''));
            return result;
        }, {}),
        accountIds: (config?.accountFields ?? []).reduce((result, field) => {
            result[field.id] = source.accountIds?.[field.id] ?? '';
            return result;
        }, {}),
    };
}

export function resolveRowAlignClassName(align) {
    return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
}

export function getCategoryDescendantIds(categoryId, categories = []) {
    if (!categoryId) return new Set();
    const targetId = String(categoryId);
    const descendants = new Set();
    const queue = [targetId];

    while (queue.length > 0) {
        const currentId = queue.shift();
        categories.forEach((cat) => {
            const pId = cat.parentId
                ? String(cat.parentId)
                : (cat.parent_id ? String(cat.parent_id) : (cat.parent?.id ? String(cat.parent.id) : null));
            const catId = String(cat.id);
            if (pId === currentId && catId !== targetId && !descendants.has(catId)) {
                descendants.add(catId);
                queue.push(catId);
            }
        });
    }

    return descendants;
}

export function buildHierarchicalCategories(categories = []) {
    if (!categories || categories.length === 0) return [];

    const map = new Map();
    const roots = [];

    categories.forEach((cat) => {
        const key = String(cat.id);
        map.set(key, { ...cat, children: [] });
    });

    categories.forEach((cat) => {
        const key = String(cat.id);
        const node = map.get(key);
        const parentId = cat.parentId
            ? String(cat.parentId)
            : (cat.parent_id ? String(cat.parent_id) : (cat.parent?.id ? String(cat.parent.id) : null));
        if (parentId && map.has(parentId) && parentId !== key) {
            map.get(parentId).children.push(node);
        } else {
            roots.push(node);
        }
    });

    const sortByName = (a, b) => {
        const nameA = String(a.name ?? a.label ?? '');
        const nameB = String(b.name ?? b.label ?? '');
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    };

    roots.sort(sortByName);

    const result = [];
    const visited = new Set();

    function traverse(nodes, depth = 0) {
        nodes.sort(sortByName);
        nodes.forEach((node) => {
            const key = String(node.id);
            if (visited.has(key)) return;
            visited.add(key);

            const cleanName = node.rawName ?? node.originalName ?? String(node.name ?? node.label ?? '').replace(/^[-\s]+/, '');
            const level = depth;
            const prefix = level > 0 ? `${'-'.repeat(level)} ` : '';
            result.push({
                ...node,
                level,
                rawName: cleanName,
                hierarchicalPrefix: prefix,
                hierarchicalName: `${prefix}${cleanName}`,
            });
            if (node.children && node.children.length > 0) {
                traverse(node.children, depth + 1);
            }
        });
    }

    traverse(roots, 0);

    if (result.length < categories.length) {
        categories.forEach((cat) => {
            const key = String(cat.id);
            if (!visited.has(key)) {
                visited.add(key);
                const cleanName = cat.rawName ?? cat.originalName ?? String(cat.name ?? cat.label ?? '').replace(/^[-\s]+/, '');
                result.push({
                    ...cat,
                    level: 0,
                    rawName: cleanName,
                    hierarchicalPrefix: '',
                    hierarchicalName: cleanName,
                });
            }
        });
    }

    return result;
}
