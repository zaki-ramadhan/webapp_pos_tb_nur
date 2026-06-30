import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';

export function buildFormValues(config) {
    return {
        supplier: [...(config.draft?.supplier ?? [])],
        effectiveDate: config.draft?.effectiveDate ?? '',
        autoEndDate: config.draft?.autoEndDate ?? false,
        endDate: config.draft?.endDate ?? '',
        autoNumber: config.draft?.autoNumber ?? true,
        numberingType: config.draft?.numberingType ?? '',
        currencies: [...(config.draft?.currencies ?? [])],
        notes: config.draft?.notes ?? '',
        itemSearch: config.draft?.itemSearch ?? '',
        itemLines: [],
    };
}

export function buildRecord(record, config) {
    if (!record) return null;
    const effectiveDate = record.effective_from ? formatIsoDate(record.effective_from) : '';
    const endDate = record.effective_until ? formatIsoDate(record.effective_until) : '';
    return {
        __backendRecordId: record.id,
        supplier: [record.supplier?.name].filter(Boolean),
        __supplierId: record.supplier_id,
        effectiveDate,
        autoEndDate: Boolean(record.effective_until),
        endDate,
        autoNumber: false,
        numberingType: 'Harga Pemasok',
        currencies: ['Indonesian Rupiah'],
        notes: record.notes ?? '',
        itemSearch: '',
        itemLines: [
            {
                id: record.id,
                __productId: record.product_id,
                name: record.product?.name ?? '',
                code: record.product?.code ?? '',
                unit: record.unit?.name ?? 'PCS',
                __unitId: record.unit_id,
                newPrice: record.price,
            }
        ],
    };
}

export function buildSupplierPricePayload(values, lineItem) {
    return {
        supplier_id: values.__supplierId,
        product_id: lineItem.__productId,
        unit_id: lineItem.__unitId || null,
        price: parseFloat(lineItem.newPrice) || 0,
        effective_from: normalizeDisplayDate(values.effectiveDate),
        effective_until: values.autoEndDate && values.endDate ? normalizeDisplayDate(values.endDate) : null,
        notes: values.notes || null,
    };
}

export function validateSupplierPrice(values) {
    if (!values.__supplierId) {
        return 'Pemasok wajib dipilih.';
    }
    if (!values.effectiveDate) {
        return 'Tanggal Mulai Berlaku wajib diisi.';
    }
    if (!values.itemLines || values.itemLines.length === 0) {
        return 'Rincian Barang wajib diisi minimal 1.';
    }
    for (const line of values.itemLines) {
        if (!line.newPrice || parseFloat(line.newPrice) <= 0) {
            return `Harga Baru untuk barang "${line.name}" harus lebih dari 0.`;
        }
    }
    return '';
}
