import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseAmountInput, formatAmountInput } from '@/features/workspace/shared/amountFormatting';

export const INVENTORY_ADJUSTMENT_BACKEND_CONFIG = {
    'inventory-adjustment': {
        resource: 'inventory-adjustments',
    },
    'price-adjustment': {
        resource: 'price-adjustments',
    },
};

function formatCurrencyValue(value) {
    const numericValue = Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return '0';
    }

    return numericValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

export function buildInventoryAdjustmentTableRows(records) {
    return records.map((record) => ({
        id: String(record.id),
        __backendRecord: record,
        number: record.document_number ?? '',
        date: formatIsoDate(record.entry_date),
        notes: record.notes ?? '',
        dateFilter: formatIsoDate(record.entry_date),
        effectiveDate: formatIsoDate(record.effective_date) || formatIsoDate(record.entry_date),
        salesCategory: record.metadata?.salesCategory?.[0] ?? '',
        adjustmentType: record.process_type ?? record.metadata?.adjustmentType ?? 'Harga',
        inactiveFilter: record.is_closed ? 'inactive' : 'active',
    }));
}

export function buildInventoryAdjustmentRecord(record, config) {
    const items = (record.lines ?? []).map((line, index) => {
        const rawAttrs = typeof line.attributes === 'string' ? JSON.parse(line.attributes || '{}') : (line.attributes || {});
        const unitName = line.unit?.name 
            ?? line.product?.base_unit?.name 
            ?? line.product?.unit?.name 
            ?? (typeof rawAttrs?.unit === 'string' ? rawAttrs.unit : '') 
            ?? 'PCS';

        const itemQty = Number(line.quantity) || 0;
        const itemUnitPrice = Number(line.unit_price) || 0;
        const itemTotalAmount = line.total_amount !== undefined && line.total_amount !== null && Number(line.total_amount) > 0
            ? Number(line.total_amount)
            : (itemQty * itemUnitPrice);

        return {
            id: String(line.id ?? `line-${index}`),
            __lineId: line.id ?? null,
            __productId: line.product_id ?? null,
            __unitId: line.unit_id ?? null,
            name: line.product?.name ?? line.description ?? line.reference_code ?? `Baris ${index + 1}`,
            code: line.product?.code ?? line.reference_code ?? '',
            adjustmentType: rawAttrs?.adjustment_type ?? line.adjustment_type ?? 'Penambahan',
            quantity: String(line.quantity ?? 0),
            unit: unitName,
            unitLookup: unitName ? [unitName] : ['PCS'],
            unitCost: formatCurrencyValue(itemUnitPrice),
            totalCost: formatCurrencyValue(itemTotalAmount),
            warehouse: line.warehouse?.name ? [line.warehouse.name] : [],
            department: line.department?.name ? [line.department.name] : [],
            notes: line.notes ?? '',
            oldDiscount: String(rawAttrs?.old_discount ?? '0'),
            minQty: String(rawAttrs?.min_qty ?? '0'),
            newDiscount: String(rawAttrs?.new_discount ?? '0'),
        };
    });
    const totalAmount = Number(record.total_amount) || items.reduce((sum, item) => sum + parseNumericInput(item.totalCost), 0);
    const accountLabel = record.primary_account
        ? `[${record.primary_account.code ?? ''}] ${record.primary_account.name ?? ''}`.trim()
        : '';
    const branchLabel = record.branch?.name ?? '';

    return {
        __backendRecordId: record.id,
        __branchId: record.branch_id ?? null,
        __adjustmentAccountId: record.primary_account_id ?? null,
        date: formatIsoDate(record.entry_date),
        autoNumber: !record.document_number,
        numberingType: record.numbering_type ?? config?.numberingOptions?.[0] ?? '',
        documentNumber: record.document_number ?? '',
        itemSearch: '',
        detailMode: config?.detailModeOptions?.[0] ?? 'Rincian',
        items,
        itemCountLabel: items.length ? `${formatAmountInput(items.length)} Barang` : (config?.itemSectionTitle ?? 'Rincian Barang'),
        adjustmentAccount: accountLabel ? [accountLabel] : [],
        notes: record.notes ?? '',
        branches: branchLabel ? [branchLabel] : [],
        totalValue: `Rp ${formatCurrencyValue(totalAmount)}`,
        dockActions: config?.detailRecords?.[record.document_number]?.dockActions ?? (Array.isArray(config?.dockActions) ? config.dockActions : config?.dockActions?.detail) ?? config?.draft?.dockActions ?? [],
        itemModal: config?.itemModal ?? config?.draft?.itemModal ?? {},
        salesCategory: record.metadata?.salesCategory ?? [],
        adjustmentType: record.process_type ?? record.metadata?.adjustmentType ?? 'Harga',
        effectiveDate: formatIsoDate(record.effective_date) || formatIsoDate(record.entry_date),
    };
}

function parseNumericInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

export function buildInventoryAdjustmentPayload(values) {
    const lines = (values.items ?? [])
        .map((item, index) => ({
            id: item.__lineId ?? undefined,
            product_id: item.__productId ?? null,
            unit_id: item.__unitId ?? null,
            description: item.name?.trim() ?? '',
            reference_code: item.code?.trim() ?? '',
            quantity: parseNumericInput(item.quantity),
            unit_price: parseNumericInput(item.unitCost),
            total_amount: parseNumericInput(item.totalCost),
            attributes: {
                adjustment_type: item.adjustmentType ?? 'Penambahan',
                old_discount: parseNumericInput(item.oldDiscount),
                min_qty: parseNumericInput(item.minQty),
                new_discount: parseNumericInput(item.newDiscount),
            },
            sort_order: index,
        }))
        .filter(
            (item) =>
                item.product_id ||
                item.description ||
                item.reference_code ||
                item.quantity > 0 ||
                item.attributes.new_discount > 0
        );

    return {
        branch_id: values.__branchId ?? 1,
        primary_account_id: values.__adjustmentAccountId ?? null,
        document_number: values.documentNumber?.trim(),
        numbering_type: values.numberingType?.trim() || null,
        entry_date: values.date?.split('/').reverse().join('-') || new Date().toISOString().slice(0, 10),
        effective_date: values.effectiveDate ? values.effectiveDate.split('/').reverse().join('-') : (values.date ? values.date.split('/').reverse().join('-') : new Date().toISOString().slice(0, 10)),
        process_type: values.adjustmentType || 'Harga',
        notes: values.notes?.trim() || null,
        metadata: {
            ...(values.__backendRecord?.metadata ?? {}),
            salesCategory: values.salesCategory ?? [],
            adjustmentType: values.adjustmentType ?? 'Harga',
        },
        lines,
    };
}
