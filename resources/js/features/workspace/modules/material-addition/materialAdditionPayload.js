import { normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import {
    buildLookupLabel,
    formatCurrencyValue,
    parseNumericInput,
} from '@/features/workspace/shared/transactionFormatters';
import { buildGeneratedDocNumber } from '@/features/workspace/shared/documentNumberUtils';

export function buildGeneratedMaterialAdditionNumber() {
    return buildGeneratedDocNumber('MA');
}

export function buildMaterialAdditionPayload(values) {
    const itemLines = (values.items ?? []).map((item, index) => ({
        id: item.__lineId ?? undefined,
        product_id: item.__productId ?? null,
        unit_id: item.__unitId ?? null,
        description: item.name?.trim() || null,
        reference_code: item.code?.trim() || null,
        quantity: parseNumericInput(item.quantity),
        sort_order: index,
    }));
    const chargeLines = (values.additionalCosts ?? []).map((charge, index) => ({
        id: charge.__lineId ?? undefined,
        account_id: charge.__accountId ?? null,
        description: charge.name?.trim() || null,
        reference_code: charge.code?.trim() || null,
        total_amount: parseNumericInput(charge.amount),
        sort_order: itemLines.length + index,
    }));

    return {
        branch_id: values.__branchId ?? null,
        related_document_id: values.__workOrderId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedMaterialAdditionNumber(),
        numbering_type: values.numberingType?.trim() || null,
        process_type: values.type?.trim() || null,
        entry_date: normalizeDisplayDate(values.date) || new Date().toISOString().slice(0, 10),
        notes: values.notes?.trim() || null,
        metadata: {
            branch_label: values.branches?.[0] ?? null,
            work_order_number: values.workOrderNumber?.trim() || null,
        },
        lines: [...itemLines, ...chargeLines].filter(
            (line) => line.product_id || line.account_id || line.description || line.reference_code,
        ),
    };
}

export function promptMaterialAdditionItem(record, currentItem = null) {
    const quantityValue = window.prompt(
        `Kuantitas untuk ${record?.name ?? currentItem?.name ?? 'barang'}`,
        currentItem?.quantity ?? '1',
    );

    if (quantityValue === null) {
        return null;
    }

    const quantity = parseNumericInput(quantityValue);

    if (quantity <= 0) {
        throw new Error('Kuantitas harus lebih dari 0.');
    }

    return {
        id: currentItem?.id ?? `draft-item-${Date.now()}`,
        __lineId: currentItem?.__lineId ?? null,
        __productId: record?.id ?? currentItem?.__productId ?? null,
        __unitId: record?.default_unit_id ?? currentItem?.__unitId ?? null,
        name: record?.name ?? currentItem?.name ?? '',
        code: record?.code ?? currentItem?.code ?? '',
        quantity: String(quantity),
        unit: record?.default_unit?.name ?? currentItem?.unit ?? '',
    };
}

export function promptMaterialAdditionCharge(record, currentCharge = null) {
    const amountValue = window.prompt(
        `Nilai biaya untuk ${record?.name ?? currentCharge?.name ?? 'biaya'}`,
        currentCharge?.amount ?? '0',
    );

    if (amountValue === null) {
        return null;
    }

    const amount = parseNumericInput(amountValue);

    if (amount <= 0) {
        throw new Error('Nilai biaya harus lebih dari 0.');
    }

    return {
        id: currentCharge?.id ?? `draft-charge-${Date.now()}`,
        __lineId: currentCharge?.__lineId ?? null,
        __accountId: record?.id ?? currentCharge?.__accountId ?? null,
        name: record?.name ?? currentCharge?.name ?? '',
        code: record?.code ?? currentCharge?.code ?? '',
        amount: formatCurrencyValue(amount),
    };
}
