import { normalizeDisplayDate, formatIsoDate } from './dateHelpers';

export const BACKEND_INVENTORY_RESOURCES = {
    'item-location': 'item-locations',
    'minimum-stock': 'minimum-stocks',
};

export function buildInventoryFilters(pageId, values) {
    if (pageId === 'item-location') {
        const isWarehouseMode = values.itemType === 'warehouse';
        const hasTarget = isWarehouseMode
            ? Boolean(values.warehouseSearchId || (values.warehouseSearch && values.warehouseSearch.trim()))
            : Boolean(values.itemSearchId || (values.itemSearch && values.itemSearch.trim()));

        if (!hasTarget) {
            return {
                require_target: 1,
                unit: values.unitMode || 'multi',
                unit_mode: values.unitMode || 'multi',
                as_of_date: normalizeDisplayDate(values.asOfDate),
                per_page: 100,
            };
        }

        return {
            product_id: isWarehouseMode ? null : (values.itemSearchId ?? null),
            warehouse_id: isWarehouseMode ? (values.warehouseSearchId ?? null) : null,
            search: (isWarehouseMode ? values.warehouseSearch : values.itemSearch)?.trim() ?? '',
            unit: values.unitMode || 'multi',
            unit_mode: values.unitMode || 'multi',
            as_of_date: normalizeDisplayDate(values.asOfDate),
            per_page: 100,
        };
    }

    return {
        search: (values.keyword || values.search)?.trim() ?? '',
        supplier_id: values.supplierSearchId ?? null,
        supplier: values.supplierSearch?.trim() ?? '',
        warehouse_id: values.warehouseSearchId ?? null,
        warehouse: values.warehouseSearch?.trim() ?? '',
        as_of_date: normalizeDisplayDate(values.asOfDate),
        per_page: 100,
    };
}

export function mapInventoryRows(pageId, records) {
    if (pageId === 'item-location') {
        return records.map((record) => ({
            id: record.id,
            productId: record.product_id ?? '',
            warehouseId: record.warehouse_id ?? '',
            warehouse: record.warehouse ?? '',
            productName: record.product_name ?? '',
            productCode: record.product_code ?? '',
            multiUnitQuantity: record.multi_unit_quantity ?? '',
            saleableStock: record.saleable_stock ?? '',
            rawQuantity: Number(record.raw_quantity ?? record.quantity ?? 0),
            quantity: record.quantity ?? 0,
            unit: record.unit ?? '',
            unitName: record.unit_name ?? record.unit ?? '',
            address: record.address ?? '',
            date: record.date ?? '',
            conversions: record.conversions ?? [],
            baseUnit: record.base_unit ?? null,
        }));
    }

    return records.map((record) => ({
        id: String(record.id),
        productId: String(record.id),
        selected: false,
        supplier: record.supplier && record.supplier !== '-' ? record.supplier : (record.preferred_supplier?.name || record.main_supplier?.name || ''),
        supplierId: record.supplier_id ?? record.main_supplier_id ?? (record.preferred_supplier?.id || record.main_supplier?.id || null),
        itemName: record.item_name ?? '',
        itemCode: record.item_code ?? '',
        unit: record.unit ?? '',
        unitId: record.unit_id ?? null,
        costPrice: Number(record.cost_price ?? record.default_purchase_price ?? record.price ?? 0),
        defaultPurchasePrice: Number(record.default_purchase_price ?? record.price ?? record.cost_price ?? 0),
        availableStock: record.available_stock ?? '',
        rawAvailableStock: Number(record.raw_available_stock ?? 0),
        ordered: record.ordered ?? record.ordered_quantity ?? '0',
        rawOrdered: Number(record.raw_ordered ?? record.raw_ordered_quantity ?? 0),
        minimumLimit: record.minimum_limit ?? '',
        rawMinimumLimit: Number(record.raw_minimum_limit ?? 0),
        suggestedReorderQty: Number(record.raw_suggested_reorder_qty ?? record.suggested_reorder_qty ?? 0),
    }));
}

export function mapStockOpnameOrderRow(record) {
    return {
        id: String(record.id),
        date: formatIsoDate(record.document_date),
        number: record.document_number ?? '',
        warehouse: record.warehouse?.name ?? '',
        responsible: record.responsible_user?.name ?? '',
        status: record.status ?? 'Draft',
        notes: record.notes ?? '',
        dateFilter: normalizeDisplayDate(record.document_date),
        statusFilter: record.status ?? 'Draft',
        tabLabel: record.document_number ?? `Opname ${record.id}`,
    };
}

export function mapWarehouseRow(record) {
    return {
        id: record.id,
        code: record.code ?? '',
        name: record.name ?? '',
        type: record.warehouse_type ?? 'Gudang Lokal',
        branchName: record.branch?.name ?? '',
        isActive: record.is_active !== false,
        tabLabel: record.name ?? '',
        branchId: record.branch_id ?? record.branch?.id ?? null,
    };
}
