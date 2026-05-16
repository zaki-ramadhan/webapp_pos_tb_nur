export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function cloneRows(rows = []) {
    return rows.map((row) => ({ ...row }));
}

export function buildFormValues(source = {}) {
    return {
        ...source,
        asset: cloneList(source.asset),
        branch: cloneList(source.branch),
        department: cloneList(source.department),
        assetAccount: cloneList(source.assetAccount),
        expenseRows: cloneRows(source.expenseRows),
    };
}
