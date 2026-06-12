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

export async function promptMaterialAdditionItem(record, currentItem = null) {
    const itemName = record?.name ?? currentItem?.name ?? 'barang';
    const result = await showPromptModal(`Input Kuantitas - ${itemName}`, [
        {
            name: 'quantity',
            label: 'Kuantitas',
            type: 'number',
            defaultValue: currentItem?.quantity ?? '1',
            required: true,
        },
    ]);

    if (!result) {
        return null;
    }

    const quantity = parseNumericInput(result.quantity);

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

export async function promptMaterialAdditionCharge(record, currentCharge = null) {
    const chargeName = record?.name ?? currentCharge?.name ?? 'biaya';
    const result = await showPromptModal(`Input Nilai Biaya - ${chargeName}`, [
        {
            name: 'amount',
            label: 'Nilai Biaya',
            type: 'number',
            defaultValue: currentCharge?.amount ?? '0',
            required: true,
        },
    ]);

    if (!result) {
        return null;
    }

    const amount = parseNumericInput(result.amount);

    if (amount <= 0) {
        throw new Error('Nilai biaya harus lebih dari 0.');
    }

    return {
        id: currentCharge?.id ?? `draft-charge-${Date.now()}`,
        __lineId: currentCharge?.__lineId ?? null,
        __accountId: record?.id ?? currentCharge?.__accountId ?? null,
        accountCode: record?.code ?? currentCharge?.accountCode ?? '',
        accountName: record?.name ?? currentCharge?.accountName ?? '',
        amount: formatCurrencyValue(amount),
    };
}
