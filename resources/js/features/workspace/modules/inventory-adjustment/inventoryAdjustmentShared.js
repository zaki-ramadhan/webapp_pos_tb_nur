import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import { buildAccountLookupLabel } from '@/features/workspace/shared/AccountLookupControls';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';
import { showPromptModal } from '@/components/ui/promptModal';

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

export async function promptInventoryAdjustmentItemEditor(item = null) {
    // Step 1: pilih produk dari master
    const product = await promptSelectBackendRecord(
        'items-services',
        'produk',
        (p) => `[${p.code ?? ''}] ${p.name ?? ''}`,
    );

    if (!product) return null;

    // Step 2: isi qty, tipe, dan harga
    const result = await showPromptModal(item ? 'Edit Item Penyesuaian' : 'Tambah Item Penyesuaian', [
        {
            name: 'adjustmentType',
            label: 'Tipe Penyesuaian',
            type: 'select',
            defaultValue: item?.adjustmentType ?? 'Penambahan',
            options: [
                { value: 'Penambahan', label: 'Penambahan' },
                { value: 'Pengurangan', label: 'Pengurangan' },
            ],
            required: true,
        },
        {
            name: 'quantity',
            label: 'Kuantitas',
            type: 'number',
            defaultValue: item?.quantity ?? '1',
            required: true,
        },
        {
            name: 'unitCost',
            label: 'Harga Satuan',
            type: 'number',
            defaultValue: item?.unitCost ?? '0',
            required: true,
        },
    ]);

    if (!result) return null;

    const adjustmentType = result.adjustmentType ?? 'Penambahan';
    const quantity = result.quantity ?? '1';
    const unitCost = result.unitCost ?? '0';
    const unitName = product.base_unit?.name ?? item?.unit ?? 'PCS';

    const quantityAmount = parseNumericInput(quantity);
    const unitCostAmount = parseNumericInput(unitCost);

    return {
        ...item,
        id: item?.id ?? `draft-item-${Date.now()}`,
        __productId: product.id,
        name: product.name ?? '',
        code: product.code ?? '',
        adjustmentType: adjustmentType.trim() || 'Penambahan',
        quantity: String(quantityAmount || 0),
        unit: unitName,
        unitLookup: [unitName],
        unitCost: formatCurrencyValue(unitCostAmount),
        totalCost: formatCurrencyValue(quantityAmount * unitCostAmount),
        warehouse: item?.warehouse ?? [],
        department: item?.department ?? [],
        notes: item?.notes ?? '',
    };
}

export async function applyInventoryPromptItemUpdate(item, setValues, setStatus) {
    try {
        const nextItem = await promptInventoryAdjustmentItemEditor(item);

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
        showSuccessToast({
            message: item ? 'Item diperbarui.' : 'Item ditambahkan.',
        });
    } catch (error) {
        showErrorToast({ message: error.message });
    }
}

export function resolveInventoryDirtyState(values, initialSnapshot) {
    return !areComparableValuesEqual(buildInventoryComparableSnapshot(values), initialSnapshot);
}
