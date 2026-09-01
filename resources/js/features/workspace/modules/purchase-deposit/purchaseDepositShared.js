import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

function formatCurrencyValue(value) {
    const numericValue = Number(value ?? 0);
    if (!Number.isFinite(numericValue)) return '0';
    return numericValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function formatCurrencyLabel(value) {
    return `Rp ${formatCurrencyValue(value)}`;
}

export function parseNumericInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

export function buildLookupLabel(record, codeKey = 'code') {
    const code = String(record?.[codeKey] ?? '').trim();
    const name = String(record?.name ?? record?.title ?? '').trim();
    if (code && name) return `[${code}] ${name}`;
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

export function buildPurchaseDepositFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'date') {
            return { ...filter, rowKey: 'dateFilter', options: buildFilterOptions('Tanggal', rows, 'dateFilter') };
        }
        if (filter.id === 'supplier') {
            return { ...filter, rowKey: 'supplierFilter', options: buildFilterOptions('Pemasok', rows, 'supplierFilter') };
        }
        if (filter.id === 'status') {
            return { ...filter, rowKey: 'statusFilter', options: buildFilterOptions('Status', rows, 'statusFilter') };
        }
        return filter;
    });
}

export function buildPurchaseDepositRow(record) {
    const totalAmount = Number(record?.total_amount ?? record?.paid_amount ?? 0);
    const dateLabel = formatIsoDate(record?.entry_date ?? record?.date ?? record?.created_at);
    const supplierName = record?.supplier?.name ?? record?.supplier_name ?? record?.party_name ?? '-';

    return {
        id: String(record.id),
        number: record.document_number ?? record.number ?? '',
        date: dateLabel,
        dateFilter: record.entry_date ?? '',
        supplierShort: supplierName,
        supplierFilter: supplierName,
        notes: record.notes ?? record.description ?? '',
        status: record.status ?? 'Draft',
        statusFilter: record.status ?? 'Draft',
        total: formatCurrencyLabel(totalAmount),
        __backendRecord: record,
    };
}

export function buildPurchaseDepositRecord(record = {}, config = {}) {
    const supplier = record.supplier
        ? [{ id: record.supplier.id, label: buildLookupLabel(record.supplier), name: record.supplier.name }]
        : record.supplier_id
        ? [{ id: record.supplier_id, label: record.supplier_name ?? `[SUPP-${record.supplier_id}]`, name: record.supplier_name }]
        : [];

    const totalAmount = Number(record.total_amount ?? record.paid_amount ?? 0);
    const formattedAmount = totalAmount ? totalAmount.toLocaleString('id-ID') : '0';

    return {
        ...config.draft,
        __backendRecordId: record.id ?? null,
        supplier,
        supplier_id: record.supplier_id ?? null,
        entryDate: formatIsoDate(record.entry_date) || config.draft?.entryDate,
        documentNumber: record.document_number ?? '',
        autoNumber: !record.document_number,
        depositAmount: formattedAmount,
        notes: record.notes ?? '',
        address: record.metadata?.address ?? record.supplier?.billing_address ?? '',
        status: record.status ?? 'Draft',
    };
}

export function buildGeneratedPurchaseDepositNumber() {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `UMP.${datePart}.${randomPart}`;
}

export function buildPurchaseDepositPayload(values) {
    const totalAmount = parseNumericInput(values.depositAmount);
    const supplierId = values.supplier?.[0]?.id ?? values.supplier_id ?? null;

    return {
        supplier_id: supplierId ? Number(supplierId) : null,
        entry_date: normalizeDisplayDate(values.entryDate),
        document_number: values.documentNumber?.trim() || null,
        status: values.status ?? 'Draft',
        subtotal: totalAmount,
        total_amount: totalAmount,
        paid_amount: totalAmount,
        outstanding_amount: totalAmount,
        notes: values.notes?.trim() || null,
        metadata: {
            address: values.address?.trim() || null,
            print_status: 'Belum cetak/email',
        },
    };
}

export function validatePurchaseDepositValues(values, config) {
    if (!values.supplier || !values.supplier.length) {
        return 'Pemasok wajib dipilih.';
    }
    if (!String(values.entryDate ?? '').trim()) {
        return 'Tanggal wajib diisi.';
    }
    if (!values.autoNumber && !String(values.documentNumber ?? '').trim()) {
        return 'Nomor Uang Muka wajib diisi.';
    }
    if (parseNumericInput(values.depositAmount) <= 0) {
        return 'Jumlah uang muka wajib lebih dari 0.';
    }
    return '';
}
