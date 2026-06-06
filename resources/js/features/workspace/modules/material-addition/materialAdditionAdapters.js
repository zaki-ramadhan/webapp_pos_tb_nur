import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import {
    buildFilterOptions,
    buildLookupLabel,
    formatCurrencyValue,
} from '@/features/workspace/shared/transactionFormatters';
import { buildItemCountLabel } from './materialAdditionCalculations';

export function buildMaterialAdditionFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'date') {
            return { ...filter, rowKey: 'dateFilter', options: buildFilterOptions('Tanggal', rows, 'dateFilter') };
        }

        if (filter.id === 'type') {
            return { ...filter, rowKey: 'typeFilter', options: buildFilterOptions('Tipe', rows, 'typeFilter') };
        }

        return filter;
    });
}

export function buildMaterialAdditionRow(record) {
    const relatedDocumentNumber = record?.relatedDocument?.document_number ?? record?.metadata?.work_order_number ?? '';
    const documentDate = formatIsoDate(record?.entry_date);

    return {
        id: String(record?.id ?? ''),
        __backendRecord: record,
        number: record?.document_number ?? '',
        date: documentDate,
        type: record?.process_type ?? '',
        workOrderNumber: relatedDocumentNumber,
        notes: record?.notes ?? '',
        dateFilter: documentDate,
        typeFilter: record?.process_type ?? '',
    };
}

export function buildMaterialAdditionRecord(record = {}, config) {
    const itemLines = [];
    const chargeLines = [];

    (record.lines ?? []).forEach((line, index) => {
        if (line.account_id || line.account) {
            chargeLines.push({
                id: String(line.id ?? `charge-${index + 1}`),
                __lineId: line.id ?? null,
                __accountId: line.account_id ?? null,
                name: line.account?.name ?? line.description ?? `Biaya ${index + 1}`,
                code: line.account?.code ?? line.reference_code ?? '',
                amount: formatCurrencyValue(line.total_amount ?? 0),
            });

            return;
        }

        itemLines.push({
            id: String(line.id ?? `item-${index + 1}`),
            __lineId: line.id ?? null,
            __productId: line.product_id ?? null,
            __unitId: line.unit_id ?? null,
            name: line.product?.name ?? line.description ?? `Barang ${index + 1}`,
            code: line.product?.code ?? line.reference_code ?? '',
            quantity: String(line.quantity ?? ''),
            unit: line.unit?.name ?? '',
        });
    });

    return {
        __backendRecordId: record.id ?? null,
        __workOrderId: record.related_document_id ?? null,
        __branchId: record.branch_id ?? null,
        date: formatIsoDate(record.entry_date),
        type: record.process_type ?? config.draft?.type ?? '',
        workOrderNumber: record.relatedDocument?.document_number ?? record.metadata?.work_order_number ?? '',
        autoNumber: false,
        numberingType: record.numbering_type ?? config.draft?.numberingType ?? '',
        documentNumber: record.document_number ?? '',
        itemSearch: '',
        chargeSearch: '',
        branches: record.branch?.name ? [record.branch.name] : [],
        notes: record.notes ?? '',
        items: itemLines,
        additionalCosts: chargeLines,
        itemCountLabel: buildItemCountLabel(itemLines),
        itemModal: config.draft?.itemModal ?? null,
        dockActions: config.draft?.dockActions ?? [],
    };
}
