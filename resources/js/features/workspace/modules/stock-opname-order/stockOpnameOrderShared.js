export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function cloneItems(items = []) {
    return items.map((item) => ({ ...item }));
}

export function cloneRows(rows = []) {
    return rows.map((row) => ({ ...row }));
}

export function buildFormValues(source = {}) {
    return {
        ...source,
        branches: cloneList(source.branches),
        department: cloneList(source.department),
        workers: cloneList(source.workers),
        warehouse: cloneList(source.warehouse),
        category: cloneList(source.category),
        supplier: cloneList(source.supplier),
        brand: cloneList(source.brand),
        resultItems: cloneItems(source.resultItems),
        processSummaryRows: cloneRows(source.processSummaryRows),
        processHistoryRows: cloneRows(source.processHistoryRows),
    };
}
