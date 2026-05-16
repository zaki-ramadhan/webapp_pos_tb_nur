import {
    defaultWorkOrderConfig,
    workOrderDetailDockActions,
} from './workOrderConfigData';

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneItems(items = []) {
    return items.map((item) => ({
        ...item,
        unitLookup: cloneList(item.unitLookup ?? item.unit),
        warehouse: cloneList(item.warehouse),
        department: cloneList(item.department),
        serialNumbers: [...(item.serialNumbers ?? [])],
    }));
}

function cloneAdditionalCosts(rows = []) {
    return rows.map((row) => ({ ...row }));
}

function toNumericValue(value) {
    const normalizedValue = Number.parseFloat(String(value ?? '0').replace(/[^\d.-]/g, ''));

    return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

function buildItemCountLabel(items = []) {
    if (!items.length) {
        return 'Rincian Barang';
    }

    const totalQuantity = items.reduce((sum, item) => sum + toNumericValue(item.quantity), 0);

    return `${items.length} Barang (${totalQuantity})`;
}

export function buildWorkOrderConfig(pageConfig = {}) {
    return {
        ...defaultWorkOrderConfig,
        ...pageConfig,
        labels: {
            ...defaultWorkOrderConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        numberingOptions: pageConfig.numberingOptions?.length ? pageConfig.numberingOptions : defaultWorkOrderConfig.numberingOptions,
        table: {
            ...defaultWorkOrderConfig.table,
            ...(pageConfig.table ?? {}),
            filters: pageConfig.table?.filters?.length ? pageConfig.table.filters : defaultWorkOrderConfig.table.filters,
            columns: pageConfig.table?.columns?.length ? pageConfig.table.columns : defaultWorkOrderConfig.table.columns,
            rows: pageConfig.table?.rows?.length ? pageConfig.table.rows : defaultWorkOrderConfig.table.rows,
            downloadItems: pageConfig.table?.downloadItems?.length ? pageConfig.table.downloadItems : defaultWorkOrderConfig.table.downloadItems,
            printItems: pageConfig.table?.printItems?.length ? pageConfig.table.printItems : defaultWorkOrderConfig.table.printItems,
            settingsItems: pageConfig.table?.settingsItems?.length ? pageConfig.table.settingsItems : defaultWorkOrderConfig.table.settingsItems,
        },
        sectionTabs: pageConfig.sectionTabs?.length ? pageConfig.sectionTabs : defaultWorkOrderConfig.sectionTabs,
        itemTable: {
            ...defaultWorkOrderConfig.itemTable,
            ...(pageConfig.itemTable ?? {}),
            columns: pageConfig.itemTable?.columns?.length ? pageConfig.itemTable.columns : defaultWorkOrderConfig.itemTable.columns,
        },
        chargeTable: {
            ...defaultWorkOrderConfig.chargeTable,
            ...(pageConfig.chargeTable ?? {}),
            columns: pageConfig.chargeTable?.columns?.length ? pageConfig.chargeTable.columns : defaultWorkOrderConfig.chargeTable.columns,
        },
        draft: {
            ...defaultWorkOrderConfig.draft,
            ...(pageConfig.draft ?? {}),
        },
        detailRecords: {
            ...defaultWorkOrderConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildWorkOrderRecord(row = {}, config = defaultWorkOrderConfig) {
    const detailRecord = config.detailRecords?.[row.id];
    const source = detailRecord
        ? {
              ...config.draft,
              ...detailRecord,
          }
        : {
              ...config.draft,
              autoNumber: false,
              documentNumber: row.number ?? '',
              date: row.date ?? config.draft.date,
              dockActions: workOrderDetailDockActions,
          };
    const items = cloneItems(source.items ?? []);
    const additionalCosts = cloneAdditionalCosts(source.additionalCosts ?? []);

    return {
        ...source,
        expenseAccounts: cloneList(source.expenseAccounts),
        varianceAccounts: cloneList(source.varianceAccounts),
        branches: cloneList(source.branches),
        items,
        additionalCosts,
        itemCountLabel: source.itemCountLabel ?? buildItemCountLabel(items),
        dockActions: source.dockActions?.length ? source.dockActions : workOrderDetailDockActions,
        itemModal: {
            ...config.draft.itemModal,
            ...(source.itemModal ?? {}),
        },
    };
}
