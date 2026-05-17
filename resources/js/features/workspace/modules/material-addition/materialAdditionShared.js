import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';

export function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

export function cloneItems(items = []) {
    return items.map((item) => ({
        ...item,
        unitLookup: cloneList(item.unitLookup ?? item.unit),
        warehouse: cloneList(item.warehouse),
        department: cloneList(item.department),
        serialNumbers: [...(item.serialNumbers ?? [])],
    }));
}

export function cloneAdditionalCosts(rows = []) {
    return rows.map((row) => ({ ...row }));
}

export function buildFormValues(source = {}) {
    return {
        ...source,
        branches: cloneList(source.branches),
        items: cloneItems(source.items),
        additionalCosts: cloneAdditionalCosts(source.additionalCosts),
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
    const normalizedValue = Number.parseFloat(String(value ?? '0').replace(/[^\d.-]/g, ''));

    return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

export function buildLookupLabel(record, codeKey = 'code') {
    const code = String(record?.[codeKey] ?? '').trim();
    const name = String(record?.name ?? record?.title ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
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

function buildItemCountLabel(items = []) {
    if (!items.length) {
        return 'Rincian Barang';
    }

    const totalQuantity = items.reduce((sum, item) => sum + parseNumericInput(item.quantity), 0);

    return `${items.length} Barang (${totalQuantity})`;
}

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

export function applyMaterialAdditionItems(values, items) {
    return {
        ...values,
        items,
        itemCountLabel: buildItemCountLabel(items),
    };
}

export function applyMaterialAdditionCharges(values, additionalCosts) {
    return {
        ...values,
        additionalCosts,
    };
}

export function buildGeneratedMaterialAdditionNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `MA.${year}.${month}.${day}.${time}`;
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

export function validateMaterialAdditionValues(values, config) {
    const requiredChecks = [
        { label: config.labels.date, value: values.date },
        { label: config.labels.workOrderNumber, value: values.workOrderNumber },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.branch, value: values.branches, type: 'array' },
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

    const invalidCharge = (values.additionalCosts ?? []).find(
        (charge) => (charge.name || charge.code || charge.amount) && parseNumericInput(charge.amount) <= 0,
    );

    if (invalidCharge) {
        return 'Nilai biaya lainnya harus lebih dari 0.';
    }

    return '';
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
