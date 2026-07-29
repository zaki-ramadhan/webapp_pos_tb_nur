import { formatIsoDate, normalizeDisplayDate, addDaysToDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { showWarningToast } from '@/components/feedback/toast';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';

export function requireSupplierSelection(values, partnerLabel = 'Pemasok') {
    const hasSupplier = Boolean(values.__supplierId || (values.supplier && values.supplier.length > 0 && values.supplier[0]));
    if (!hasSupplier) {
        window.dispatchEvent(new CustomEvent('form-validation-error', {
            detail: {
                supplierPriceSupplier: `${partnerLabel} wajib dipilih.`,
                supplier: `${partnerLabel} wajib dipilih.`,
                __supplierId: `${partnerLabel} wajib dipilih.`,
            }
        }));
        showSystemErrorModal({
            title: 'Terjadi Permasalahan pada Pemrosesan',
            description: 'Silakan perbaiki permasalahan berikut ini:',
            message: `${partnerLabel} harus diisi.`,
            confirmLabel: 'OK',
        });
        return false;
    }
    return true;
}

export function buildFormValues(config) {
    const todayStr = formatIsoDate(new Date().toISOString());
    const effectiveDate = config.draft?.effectiveDate || todayStr;
    const endDate = config.draft?.endDate || addDaysToDisplayDate(effectiveDate, 1);

    return {
        supplier: [...(config.draft?.supplier ?? [])],
        effectiveDate,
        autoEndDate: config.draft?.autoEndDate ?? false,
        endDate,
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
