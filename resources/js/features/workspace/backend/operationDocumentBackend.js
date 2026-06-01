import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

const DOCUMENT_PREFIXES = {
    'sales-quote': 'SQ',
    'sales-order': 'SO',
    'sales-delivery': 'SD',
    'sales-invoice': 'SI',
    'sales-return': 'SR',
    'purchase-order': 'PO',
    'goods-receipt': 'GR',
    'purchase-invoice': 'PI',
    'purchase-return': 'PR',
};

export const OPERATION_DOCUMENT_BACKEND_CONFIG = {
    'sales-quote': { resource: 'sales-quotes', partnerResource: 'customers', partnerField: 'customer_id' },
    'sales-order': { resource: 'sales-orders', partnerResource: 'customers', partnerField: 'customer_id' },
    'sales-delivery': { resource: 'sales-deliveries', partnerResource: 'customers', partnerField: 'customer_id' },
    'sales-invoice': { resource: 'sales-invoices', partnerResource: 'customers', partnerField: 'customer_id' },
    'sales-return': { resource: 'sales-returns', partnerResource: 'customers', partnerField: 'customer_id' },
    'purchase-order': { resource: 'purchase-orders', partnerResource: 'suppliers', partnerField: 'supplier_id' },
    'goods-receipt': { resource: 'goods-receipts', partnerResource: 'suppliers', partnerField: 'supplier_id' },
    'purchase-invoice': { resource: 'purchase-invoices', partnerResource: 'suppliers', partnerField: 'supplier_id' },
    'purchase-return': { resource: 'purchase-returns', partnerResource: 'suppliers', partnerField: 'supplier_id' },
    'budget': { resource: 'budgets', partnerResource: 'accounts', partnerField: 'primary_account_id' },
    'payroll-entry': { resource: 'payroll-entries', partnerResource: 'accounts', partnerField: 'primary_account_id' },
    'asset-change': { resource: 'asset-changes', partnerResource: 'fixed-assets', partnerField: 'fixed_asset_id' },
    'asset-disposal': { resource: 'asset-disposals', partnerResource: 'fixed-assets', partnerField: 'fixed_asset_id' },
    'asset-move': { resource: 'asset-moves', partnerResource: 'fixed-assets', partnerField: 'fixed_asset_id' },
};

function truncateText(value, limit = 20) {
    const normalizedValue = String(value ?? '').trim();

    if (normalizedValue.length <= limit) {
        return normalizedValue;
    }

    return `${normalizedValue.slice(0, limit - 3)}...`;
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

function buildFilterOptions(labelPrefix, rows, rowKey, valueKey = rowKey) {
    const values = [...new Set(rows.map((row) => row[rowKey]).filter(Boolean))];

    return [
        { value: 'all', label: `${labelPrefix}: Semua` },
        ...values.map((value) => ({
            value,
            label: `${labelPrefix}: ${rows.find((row) => row[rowKey] === value)?.[valueKey] ?? value}`,
        })),
    ];
}

export function buildOperationDocumentTableRows(pageId, records) {
    return records.map((record) => {
        const partnerName = record.customer?.name ?? record.supplier?.name ?? '';
        const totalText = formatCurrencyValue(record.total_amount ?? record.subtotal ?? record.paid_amount ?? 0);

        return {
            id: String(record.id),
            __backendRecord: record,
            number: record.document_number ?? '',
            documentNumber: record.document_number ?? '',
            date: formatIsoDate(record.entry_date),
            customer: partnerName,
            customerShort: truncateText(partnerName),
            shipping: record.shipping_method ?? '',
            shippingShort: truncateText(record.shipping_method ?? ''),
            notes: record.notes ?? '',
            status: record.status ?? 'Draft',
            requiredIdType: record.metadata?.required_id_type ?? '',
            age: record.metadata?.age_days ?? '',
            total: totalText,
            statusTone: String(record.status ?? '').toLowerCase().includes('lunas') || String(record.status ?? '').toLowerCase().includes('proses')
                ? 'processed'
                : String(record.status ?? '').toLowerCase().includes('sebagian')
                  ? 'partial'
                  : 'pending',
            dateFilter: formatIsoDate(record.entry_date),
            partnerFilter: partnerName,
            statusFilter: record.status ?? 'Draft',
            printedStatus: record.metadata?.printed_status ?? 'all',
            pageId,
        };
    });
}

export function buildOperationDocumentFilters(baseFilters, rows) {
    return (baseFilters ?? []).map((filter) => {
        if (filter.id === 'date') {
            return { ...filter, rowKey: 'dateFilter', options: buildFilterOptions('Tanggal', rows, 'dateFilter') };
        }

        if (filter.id === 'customer') {
            return { ...filter, rowKey: 'partnerFilter', options: buildFilterOptions('Pelanggan', rows, 'partnerFilter') };
        }

        if (filter.id === 'status') {
            return { ...filter, rowKey: 'statusFilter', options: buildFilterOptions('Status', rows, 'statusFilter') };
        }

        return filter;
    });
}

export function buildOperationDocumentRecord(record, config, pageId) {
    const partnerName = record.customer?.name ?? record.supplier?.name ?? '';
    const metadata = record.metadata ?? {};
    const taxValue = Number(record.tax_total ?? 0) > 0 ? `Rp ${formatCurrencyValue(record.tax_total)}` : '';
    const subtotalValue = Number(record.subtotal ?? 0) > 0 ? record.subtotal : record.total_amount ?? 0;
    const totalValue = record.total_amount ?? record.subtotal ?? 0;
    const lines = (record.lines ?? []).map((line, index) => ({
        id: String(line.id ?? `line-${index}`),
        __lineId: line.id ?? null,
        name: line.description ?? line.product?.name ?? line.reference_code ?? `Baris ${index + 1}`,
        code: line.reference_code ?? line.product?.code ?? '',
        quantity: String(line.quantity ?? ''),
        unit: line.unit?.name ?? '',
        price: formatCurrencyValue(line.unit_price ?? 0),
        discount: formatCurrencyValue(line.discount_amount ?? 0),
        discountValue: formatCurrencyValue(line.discount_amount ?? 0),
        total: formatCurrencyValue(line.total_amount ?? 0),
    }));

    return {
        __backendRecordId: record.id,
        __partnerId: record.customer_id ?? record.supplier_id ?? null,
        __paymentTermId: record.payment_term_id ?? null,
        __branchId: record.branch_id ?? null,
        __shippingMethodId: metadata.shipping_method_id ?? null,
        __fobId: metadata.fob_id ?? null,
        customer: partnerName ? [partnerName] : [],
        entryDate: formatIsoDate(record.entry_date),
        autoNumber: false,
        numberingType: record.numbering_type ?? config.numberingOptions?.[0] ?? '',
        documentNumber: record.document_number ?? '',
        currency: record.currency?.code ?? '',
        itemSearch: '',
        items: lines,
        itemCountLabel: lines.length ? `${lines.length} ${config.itemSectionTitle}` : config.itemSectionTitle,
        paymentTerms: record.payment_term?.name ? [record.payment_term.name] : [],
        purchaseOrderNumber: record.reference_number ?? '',
        address:
            metadata.address
            ?? record.customer?.shipping_address
            ?? record.customer?.billing_address
            ?? record.supplier?.billing_address
            ?? '',
        branches: record.branch?.name ? [record.branch.name] : [],
        notes: record.notes ?? '',
        taxEnabled: Number(record.tax_total ?? 0) > 0 || Boolean(record.tax_id),
        taxIncluded: Boolean(record.flags?.tax_included),
        shippingDate: formatIsoDate(record.shipping_date),
        shippingMethod: metadata.shipping_method_name ? [metadata.shipping_method_name] : [],
        fob: metadata.fob_name ? [metadata.fob_name] : [],
        costSearch: '',
        additionalCosts: [],
        summary: [
            ['Total', `Rp ${formatCurrencyValue(totalValue)}`],
            ['Status', record.status ?? 'Draft'],
        ],
        processedBy: record.related_document?.document_number
            ? {
                  number: record.related_document.document_number,
                  date: formatIsoDate(record.related_document.entry_date ?? record.related_document.document_date),
              }
            : null,
        approvalStamp: '',
        processStamp: record.status ? String(record.status).toUpperCase() : '',
        showProcessButton: false,
        processDisabled: true,
        subtotal: `Rp ${formatCurrencyValue(subtotalValue)}`,
        discountValue: formatCurrencyValue(record.discount_total ?? 0),
        discountPrefix: 'Rp',
        taxLabel: taxValue ? 'Pajak' : '',
        taxValue,
        total: `Rp ${formatCurrencyValue(totalValue)}`,
        saveTone: 'muted',
        pageId,
    };
}

export function parseNumericInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

export function buildGeneratedDocumentNumber(pageId) {
    const prefix = DOCUMENT_PREFIXES[pageId] ?? 'DOC';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `${prefix}.${year}.${month}.${day}.${time}`;
}

export function buildOperationDocumentPayload(values, pageId, backendConfig) {
    const lines = (values.items ?? [])
        .map((item, index) => ({
            id: item.__lineId ?? undefined,
            description: item.name?.trim() ?? '',
            reference_code: item.code?.trim() ?? '',
            quantity: parseNumericInput(item.quantity),
            unit_price: parseNumericInput(item.price),
            discount_amount: parseNumericInput(item.discountValue ?? item.discount),
            total_amount: parseNumericInput(item.total),
            sort_order: index,
        }))
        .filter((item) => item.description || item.reference_code || item.quantity > 0 || item.total_amount > 0);
    const subtotalAmount = lines.reduce((sum, line) => sum + Number(line.total_amount ?? 0), 0);
    const discountAmount = lines.reduce((sum, line) => sum + Number(line.discount_amount ?? 0), 0);
    const taxAmount = values.taxEnabled ? Math.max(0, (subtotalAmount - discountAmount) * 0.1) : 0;
    const totalAmount = Math.max(0, subtotalAmount - discountAmount + taxAmount);

    return {
        [backendConfig.partnerField]: values.__partnerId,
        payment_term_id: values.__paymentTermId ?? null,
        branch_id: values.__branchId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedDocumentNumber(pageId),
        reference_number: values.purchaseOrderNumber?.trim() || null,
        numbering_type: values.numberingType?.trim() || null,
        status: values.processStamp?.trim() || 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        shipping_date: normalizeDisplayDate(values.shippingDate) || null,
        notes: values.notes?.trim() || null,
        subtotal: subtotalAmount,
        discount_total: discountAmount,
        tax_total: taxAmount,
        total_amount: totalAmount,
        flags: {
            tax_included: Boolean(values.taxIncluded),
        },
        metadata: {
            address: values.address?.trim() || null,
            shipping_method_id: values.__shippingMethodId ?? null,
            shipping_method_name: values.shippingMethod?.[0] ?? null,
            fob_id: values.__fobId ?? null,
            fob_name: values.fob?.[0] ?? null,
        },
        lines,
    };
}
