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
                as_of_date: normalizeDisplayDate(values.asOfDate),
                per_page: 100,
            };
        }

        return {
            product_id: isWarehouseMode ? null : (values.itemSearchId ?? null),
            warehouse_id: isWarehouseMode ? (values.warehouseSearchId ?? null) : null,
            search: (isWarehouseMode ? values.warehouseSearch : values.itemSearch)?.trim() ?? '',
            as_of_date: normalizeDisplayDate(values.asOfDate),
            per_page: 100,
        };
    }

    return {
        search: values.keyword?.trim() ?? '',
        supplier_id: values.supplierSearchId ?? null,
        warehouse_id: values.warehouseSearchId ?? null,
        as_of_date: normalizeDisplayDate(values.asOfDate),
        per_page: 100,
    };
}

export function mapInventoryRows(pageId, records) {
    if (pageId === 'item-location') {
        return records.map((record) => ({
            id: record.id,
            warehouse: record.warehouse ?? '',
            productName: record.product_name ?? '',
            productCode: record.product_code ?? '',
            multiUnitQuantity: record.multi_unit_quantity ?? '',
            saleableStock: record.saleable_stock ?? '',
            address: record.address ?? '',
        }));
    }

    return records.map((record) => ({
        id: String(record.id),
        productId: String(record.id),
        selected: false,
        supplier: record.supplier ?? '',
        supplierId: record.supplier_id ?? null,
        itemName: record.item_name ?? '',
        itemCode: record.item_code ?? '',
        unit: record.unit ?? '',
        costPrice: Number(record.cost_price ?? record.default_purchase_price ?? record.price ?? 0),
        availableStock: record.available_stock ?? '',
        rawAvailableStock: Number(record.raw_available_stock ?? 0),
        ordered: record.ordered ?? '',
        requested: record.requested ?? '',
        minimumLimit: record.minimum_limit ?? '',
        rawMinimumLimit: Number(record.raw_minimum_limit ?? 0),
    }));
}

export function mapStockOpnameOrderRow(record) {
    return {
        id: String(record.id),
        date: formatIsoDate(record.document_date),
        number: record.document_number ?? '',
        warehouse: record.warehouse?.name ?? '-',
        responsible: record.responsible_user?.name ?? '-',
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
        branchName: record.branch?.name ?? '-',
        isActive: record.is_active !== false,
        tabLabel: record.name ?? '',
        branchId: record.branch_id ?? record.branch?.id ?? null,
    };
}
