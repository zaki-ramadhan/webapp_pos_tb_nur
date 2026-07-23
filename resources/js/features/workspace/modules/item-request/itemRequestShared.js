import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { formatAmountInput, parseAmountInput } from '@/features/workspace/shared/amountFormatting';

export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function cloneItems(items) {
    return (items ?? []).map((item) => ({
        ...item,
        unit: cloneList(item.unit),
        department: cloneList(item.department),
    }));
}

export function buildFormValues(source = {}) {
    return {
        ...source,
        branches: cloneList(source.branches),
        items: cloneItems(source.items),
        itemModal: source.itemModal
            ? {
                  ...source.itemModal,
                  tabs: (source.itemModal.tabs ?? []).map((tab) => ({ ...tab })),
              }
            : null,
    };
}

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

function parseNumericInput(value) {
    return parseAmountInput(value, { allowDecimal: true, allowNegative: true, emptyValue: 0 }) ?? 0;
}

export function buildLookupLabel(record, codeKey = 'code') {
    const code = String(record?.[codeKey] ?? '').trim();
    const name = String(record?.name ?? record?.title ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

function buildItemCountLabel(items = []) {
    if (!items.length) {
        return 'Rincian Barang';
    }

    const totalQuantity = items.reduce((sum, item) => sum + parseNumericInput(item.quantity), 0);

    return `${formatAmountInput(items.length)} Barang (${formatAmountInput(totalQuantity)})`;
}

function buildFilterOptions(labelPrefix, rows, rowKey, labelKey = rowKey) {
    const values = [...new Set(rows.map((row) => row[rowKey]).filter(Boolean))];

    return [
        { value: 'all', label: `${labelPrefix}: Semua` },
        ...values.map((value) => ({
            value,
            label: `${labelPrefix}: ${rows.find((row) => row[rowKey] === value)?.[labelKey] ?? value}`,
        })),
    ];
}

export function buildItemRequestFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'date') {
            return { ...filter, rowKey: 'dateFilter', options: buildFilterOptions('Tanggal', rows, 'dateFilter') };
        }

        if (filter.id === 'status') {
            return { ...filter, rowKey: 'statusFilter', options: buildFilterOptions('Status', rows, 'statusFilter') };
        }

        if (filter.id === 'type') {
            return { ...filter, rowKey: 'typeFilter', options: buildFilterOptions('Tipe Permintaan', rows, 'typeFilter') };
        }

        return filter;
    });
}

export function buildItemRequestRow(record) {
    const totalAmount = (record.lines ?? []).reduce((sum, line) => sum + Number(line.attributes?.estimated_total ?? 0), 0);
    const documentDate = formatIsoDate(record?.document_date);
    const statusText = record?.is_closed ? 'Ditutup' : (record?.status ?? 'Menunggu diproses');

    return {
        id: String(record?.id ?? ''),
        __backendRecord: record,
        number: record?.document_number ?? '',
        date: documentDate,
        requestType: record?.request_type ?? '',
        notes: record?.notes ?? '',
        status: statusText,
        total: (record.lines ?? []).reduce((sum, line) => sum + Number(line.quantity ?? 0), 0),
        estimatedTotal: formatCurrencyValue(totalAmount),
        dateFilter: documentDate,
        statusFilter: statusText,
        printedFilter: record?.metadata?.printed ? 'printed' : 'not-printed',
        typeFilter: record?.request_type ?? '',
    };
}

export function buildItemRequestRecord(record = {}, config) {
    const items = (record.lines ?? []).map((line, index) => ({
        id: String(line.id ?? `line-${index + 1}`),
        __lineId: line.id ?? null,
        __productId: line.product_id ?? null,
        __unitId: line.unit_id ?? null,
        __departmentId: line.department_id ?? null,
        name: line.product?.name ?? line.item_name ?? line.description ?? `Baris ${index + 1}`,
        code: line.product?.code ?? line.item_code ?? '',
        quantity: String(line.quantity ?? ''),
        unit: line.unit?.name ?? '',
        requestDate: formatIsoDate(line.line_date ?? record.document_date),
        department: line.department?.name ? [line.department.name] : [],
        notes: line.notes ?? '',
    }));

    return {
        __backendRecordId: record.id ?? null,
        __branchId: record.branch_id ?? null,
        requestDate: formatIsoDate(record.document_date),
        requestType: record.request_type ?? config.draft?.requestType ?? '',
        autoNumber: false,
        numberingType: record.numbering_type ?? config.draft?.numberingType ?? '',
        documentNumber: record.document_number ?? '',
        notes: record.notes ?? '',
        closeRequest: Boolean(record.is_closed),
        branches: record.branch?.name ? [record.branch.name] : [],
        itemSearch: '',
        items,
        itemCountLabel: buildItemCountLabel(items),
        itemModal: config.draft?.itemModal ?? null,
        dockActions: config.detailRecords?.[record.document_number]?.dockActions ?? config.draft?.dockActions ?? [],
    };
}

export function applyItemRequestItems(values, items) {
    return {
        ...values,
        items,
        itemCountLabel: buildItemCountLabel(items),
    };
}

export function buildGeneratedItemRequestNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `IR.${year}.${month}.${day}.${time}`;
}

export function buildItemRequestPayload(values) {
    return {
        branch_id: values.__branchId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedItemRequestNumber(),
        request_type: values.requestType?.trim() || null,
        numbering_type: values.numberingType?.trim() || null,
        status: values.closeRequest ? 'Ditutup' : 'Menunggu diproses',
        document_date: normalizeDisplayDate(values.requestDate) || new Date().toISOString().slice(0, 10),
        notes: values.notes?.trim() || null,
        is_closed: Boolean(values.closeRequest),
        metadata: {
            branch_label: values.branches?.[0] ?? null,
        },
        lines: (values.items ?? [])
            .map((item, index) => ({
                id: item.__lineId ?? undefined,
                product_id: item.__productId ?? null,
                unit_id: item.__unitId ?? null,
                department_id: item.__departmentId ?? null,
                item_name: item.name?.trim() || null,
                item_code: item.code?.trim() || null,
                quantity: parseNumericInput(item.quantity),
                line_date: normalizeDisplayDate(item.requestDate) || normalizeDisplayDate(values.requestDate) || null,
                notes: item.notes?.trim() || null,
                sort_order: index,
            }))
            .filter((line) => line.product_id || line.item_name),
    };
}

export function validateItemRequestValues(values, config) {
    const requiredChecks = [
        { label: config.labels.requestDate, value: values.requestDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.itemSectionTitle, value: values.items, type: 'array' },
    ];

    for (const check of requiredChecks) {
        if (check.type === 'array') {
            if (!Array.isArray(check.value) || check.value.length < 1) {
                return `${check.label} wajib diisi.`;
            }
        } else if (!String(check.value ?? '').trim()) {
            return `${check.label} wajib diisi.`;
        }
    }

    const invalidItem = (values.items ?? []).find(
        (item) => !String(item.name ?? item.code ?? '').trim() || parseNumericInput(item.quantity) <= 0,
    );

    if (invalidItem) {
        return 'Setiap rincian barang wajib memiliki item dan kuantitas lebih dari 0.';
    }

    return '';
}

import { showPromptModal } from '@/components/ui/promptModal';

export async function promptItemRequestItem(record, currentItem = null, fallbackDate = '') {
    const itemName = record?.name ?? currentItem?.name ?? 'barang';
    const result = await showPromptModal(`Input Rincian Permintaan - ${itemName}`, [
        {
            name: 'quantity',
            label: 'Kuantitas',
            type: 'number',
            defaultValue: currentItem?.quantity ?? '1',
            required: true,
        },
        {
            name: 'requestDate',
            label: 'Tanggal Diminta (dd/mm/yyyy)',
            type: 'text',
            defaultValue: currentItem?.requestDate ?? fallbackDate ?? '',
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

    const requestDate = result.requestDate;

    return {
        id: currentItem?.id ?? `draft-item-${Date.now()}`,
        __lineId: currentItem?.__lineId ?? null,
        __productId: record?.id ?? currentItem?.__productId ?? null,
        __unitId: record?.default_unit_id ?? currentItem?.__unitId ?? null,
        __departmentId: currentItem?.__departmentId ?? null,
        name: record?.name ?? currentItem?.name ?? '',
        code: record?.code ?? currentItem?.code ?? '',
        quantity: String(quantity),
        unit: record?.default_unit?.name ?? currentItem?.unit ?? '',
        requestDate: requestDate.trim(),
        department: cloneList(currentItem?.department),
        notes: currentItem?.notes ?? '',
    };
}
