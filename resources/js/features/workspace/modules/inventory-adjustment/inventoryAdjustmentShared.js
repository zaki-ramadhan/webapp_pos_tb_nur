import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { buildAccountLookupLabel } from '@/features/workspace/shared/AccountLookupControls';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';

export const buildLookupLabel = buildAccountLookupLabel;

export function resolveCellAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}

export function formatCurrencyValue(value) {
    const numericValue = Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return '0';
    }

    return numericValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

export function parseNumericInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

export function buildTotals(values, items) {
    const totalAmount = items.reduce((sum, item) => sum + parseNumericInput(item.totalCost), 0);

    return {
        ...values,
        items,
        itemCountLabel: items.length ? `${items.length} Barang` : 'Rincian Barang',
        totalValue: `Rp ${formatCurrencyValue(totalAmount)}`,
    };
}

export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function cloneItems(items = []) {
    return items.map((item) => ({
        ...item,
        unitLookup: cloneList(item.unitLookup),
        warehouse: cloneList(item.warehouse),
        department: cloneList(item.department),
    }));
}

export function buildFormValues(source = {}) {
    return {
        ...source,
        adjustmentAccount: cloneList(source.adjustmentAccount),
        branches: cloneList(source.branches),
        items: cloneItems(source.items),
    };
}

export function buildInventoryComparableSnapshot(values) {
    return {
        date: values.date,
        documentNumber: values.documentNumber,
        autoNumber: values.autoNumber,
        numberingType: values.numberingType,
        branches: values.branches,
        branchId: values.__branchId,
        adjustmentAccount: values.adjustmentAccount,
        adjustmentAccountId: values.__adjustmentAccountId,
        notes: values.notes,
        items: (values.items ?? []).map((item) => ({
            name: item.name,
            code: item.code,
            adjustmentType: item.adjustmentType,
            quantity: item.quantity,
            unit: item.unit,
            unitCost: item.unitCost,
            totalCost: item.totalCost,
        })),
    };
}

export function validateInventoryAdjustmentValues(values, config, isDetail) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.date, value: values.date },
        ...(isDetail
            ? [{ label: config.labels.documentNumber, value: values.documentNumber }]
            : [{ label: 'Tipe penomoran', value: values.numberingType }]),
        { label: config.labels.branch, value: values.__branchId, type: 'lookup' },
        { label: config.itemSectionTitle, value: values.items, type: 'array' },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    const invalidItem = (values.items ?? []).find(
        (item) =>
            !String(item?.name ?? '').trim()
            || Number.parseFloat(String(item?.quantity ?? '0').replace(',', '.')) <= 0
            || !String(item?.unit ?? '').trim(),
    );

    if (invalidItem) {
        return 'Setiap item wajib memiliki nama, kuantitas lebih dari 0, dan satuan.';
    }

    return '';
}

export function buildInventoryDocumentNumber(pageId) {
    const prefix = pageId === 'price-adjustment' ? 'PA' : 'IA';
    const dateLabel = new Date().toISOString().slice(0, 10).replaceAll('-', '.');

    return `${prefix}.${dateLabel}.${Date.now()}`;
}

export function promptInventoryAdjustmentItemEditor(item = null) {
    const name = window.prompt('Nama barang', item?.name ?? '');

    if (name === null) {
        return null;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new Error('Nama barang wajib diisi.');
    }

    const code = window.prompt('Kode barang', item?.code ?? '') ?? '';
    const adjustmentType = window.prompt('Tipe penyesuaian', item?.adjustmentType ?? 'Penambahan') ?? item?.adjustmentType ?? 'Penambahan';
    const quantity = window.prompt('Kuantitas', item?.quantity ?? '1');

    if (quantity === null) {
        return null;
    }

    const unit = window.prompt('Satuan', item?.unit ?? 'PCS');

    if (unit === null) {
        return null;
    }

    const unitCost = window.prompt('Harga satuan', item?.unitCost ?? '0');

    if (unitCost === null) {
        return null;
    }

    const quantityAmount = parseNumericInput(quantity);
    const unitCostAmount = parseNumericInput(unitCost);
    const resolvedUnit = unit.trim() || 'PCS';

    return {
        ...item,
        id: item?.id ?? `draft-item-${Date.now()}`,
        name: trimmedName,
        code: code.trim(),
        adjustmentType: adjustmentType.trim() || 'Penambahan',
        quantity: String(quantityAmount || 0),
        unit: resolvedUnit,
        unitLookup: [resolvedUnit],
        unitCost: formatCurrencyValue(unitCostAmount),
        totalCost: formatCurrencyValue(quantityAmount * unitCostAmount),
        warehouse: item?.warehouse ?? [],
        department: item?.department ?? [],
        notes: item?.notes ?? '',
    };
}

export function applyInventoryPromptItemUpdate(item, setValues, setStatus) {
    try {
        const nextItem = promptInventoryAdjustmentItemEditor(item);

        if (!nextItem) {
            return;
        }

        setValues((current) =>
            buildTotals(
                current,
                item
                    ? (current.items ?? []).map((entry) => (entry.id === item.id ? nextItem : entry))
                    : [...(current.items ?? []), nextItem],
            ),
        );
        setStatus({
            tone: 'success',
            message: item ? 'Item diperbarui.' : 'Item ditambahkan.',
        });
    } catch (error) {
        setStatus({ tone: 'error', message: error.message });
    }
}

export function resolveInventoryDirtyState(values, initialSnapshot) {
    return !areComparableValuesEqual(buildInventoryComparableSnapshot(values), initialSnapshot);
}
