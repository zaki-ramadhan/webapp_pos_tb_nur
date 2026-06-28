import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

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

function formatCurrencyLabel(value) {
    return `Rp ${formatCurrencyValue(value)}`;
}

export function parseNumericInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

export function buildLookupLabel(record, codeKey = 'code') {
    const code = String(record?.[codeKey] ?? '').trim();
    const name = String(record?.name ?? record?.title ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

function buildSummaryRows(totalAmount, status, printStatus = 'Belum cetak/email') {
    return [
        ['Total', formatCurrencyLabel(totalAmount)],
        ['Uang Muka Terpakai/Retur', 'Rp 0'],
        ['Sisa Uang Muka', formatCurrencyLabel(totalAmount)],
        ['Pembayaran', 'Rp 0'],
        ['Retur', 'Rp 0'],
        ['Piutang', formatCurrencyLabel(totalAmount)],
        ['Status', status || 'Draft'],
        ['Dicetak/email', printStatus],
    ];
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

export function buildSalesDepositFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'date') {
            return { ...filter, rowKey: 'dateFilter', options: buildFilterOptions('Tanggal', rows, 'dateFilter') };
        }

        if (filter.id === 'customer') {
            return { ...filter, rowKey: 'customerFilter', options: buildFilterOptions('Pelanggan', rows, 'customerFilter') };
        }

        if (filter.id === 'status') {
            return { ...filter, rowKey: 'statusFilter', options: buildFilterOptions('Status', rows, 'statusFilter') };
        }

        return filter;
    });
}

export function buildSalesDepositRow(record) {
    const totalAmount = Number(record?.total_amount ?? record?.paid_amount ?? 0);
    const entryDate = formatIsoDate(record?.entry_date);
    const customerName = record?.customer?.name ?? '';
    const status = record?.status ?? 'Draft';

    return {
        id: String(record?.id ?? ''),
        __backendRecord: record,
        number: record?.document_number ?? '',
        name: record?.document_number ?? '',
        tabLabel: record?.document_number ?? '',
        date: entryDate,
        customer: customerName,
        customerShort: customerName,
        notes: record?.notes ?? '',
        status,
        requiredIdType: record?.metadata?.required_id_type ?? '',
        age: record?.metadata?.age ?? '0',
        total: formatCurrencyValue(totalAmount),
        statusIcon: status === 'Lunas' ? 'paid' : 'draft',
        dateFilter: entryDate,
        customerFilter: customerName,
        statusFilter: status,
    };
}

export function buildSalesDepositRecord(record = {}, config) {
    const totalAmount = Number(record?.total_amount ?? record?.paid_amount ?? 0);
    const status = record?.status ?? 'Draft';
    const printStatus = record?.metadata?.print_status ?? 'Belum cetak/email';

    return {
        __backendRecordId: record.id ?? null,
        __customerId: record.customer_id ?? null,
        __paymentTermId: record.payment_term_id ?? null,
        paymentTermName: record.payment_term ? buildLookupLabel(record.payment_term) : '',
        __branchId: null,
        customer: record.customer?.name ? [buildLookupLabel(record.customer)] : [],
        entryDate: formatIsoDate(record.entry_date),
        autoNumber: false,
        numberingType: record.numbering_type ?? config.draft?.numberingType ?? '',
        documentNumber: record.document_number ?? '',
        currency: record.currency?.code ?? 'IDR',
        depositAmount: formatCurrencyValue(totalAmount),
        purchaseOrderNumber: record.reference_number ?? '',
        __taxId: record.tax_id ?? null,
        taxName: record.tax ? buildLookupLabel(record.tax) : '',
        taxEnabled: Boolean(record.tax_id),
        taxIncluded: Boolean(record.metadata?.tax_included),
        paymentTerms: [],
        address: record.metadata?.address ?? '',
        branches: [],
        notes: record.notes ?? '',
        summary: buildSummaryRows(totalAmount, status, printStatus),
        usedDepositRows: [],
        approvalStamp: record.metadata?.approval_stamp ?? '',
        statusStamp: status.toUpperCase(),
        statusTone: status === 'Lunas' ? 'green' : 'gray',
        processButtonLabel: 'Proses',
        dockActions: config.detailRecords?.[record.document_number]?.dockActions ?? config.draft?.dockActions ?? [],
        subtotal: formatCurrencyLabel(totalAmount),
        total: formatCurrencyLabel(totalAmount),
        printStatus,
    };
}

export function buildSalesDepositFormState(source = {}, config) {
    const depositAmount = source.depositAmount ?? config.draft?.depositAmount ?? '0';
    const totalAmount = parseNumericInput(depositAmount);
    const status = source.summary?.find?.(([label]) => label === 'Status')?.[1] ?? source.status ?? 'Draft';
    const printStatus = source.printStatus ?? config.draft?.printStatus ?? 'Belum cetak/email';

    return {
        __backendRecordId: source.__backendRecordId ?? null,
        __customerId: source.__customerId ?? null,
        __paymentTermId: source.__paymentTermId ?? null,
        paymentTermName: source.paymentTermName ?? '',
        __branchId: null,
        customer: [...(source.customer ?? config.draft?.customer ?? [])],
        entryDate: source.entryDate ?? config.draft?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.draft?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.draft?.numberingType ?? '',
        documentNumber: source.documentNumber ?? config.draft?.documentNumber ?? '',
        currency: source.currency ?? config.draft?.currency ?? '',
        depositAmount,
        purchaseOrderNumber: source.purchaseOrderNumber ?? config.draft?.purchaseOrderNumber ?? '',
        __taxId: source.__taxId ?? null,
        taxName: source.taxName ?? '',
        taxEnabled: source.taxEnabled ?? config.draft?.taxEnabled ?? false,
        taxIncluded: source.taxIncluded ?? config.draft?.taxIncluded ?? false,
        paymentTerms: [],
        address: source.address ?? config.draft?.address ?? '',
        branches: [],
        notes: source.notes ?? config.draft?.notes ?? '',
        summary: source.summary ?? buildSummaryRows(totalAmount, status, printStatus),
        usedDepositRows: [...(source.usedDepositRows ?? config.draft?.usedDepositRows ?? [])],
        approvalStamp: source.approvalStamp ?? config.draft?.approvalStamp ?? '',
        statusStamp: source.statusStamp ?? config.draft?.statusStamp ?? '',
        statusTone: source.statusTone ?? config.draft?.statusTone ?? 'gray',
        processButtonLabel: source.processButtonLabel ?? config.draft?.processButtonLabel ?? '',
        dockActions: source.dockActions ?? config.draft?.dockActions ?? [],
        subtotal: source.subtotal ?? formatCurrencyLabel(totalAmount),
        total: source.total ?? formatCurrencyLabel(totalAmount),
        printStatus,
    };
}

export function buildGeneratedSalesDepositNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `DP.${year}.${month}.${day}.${time}`;
}

export function buildSalesDepositPayload(values) {
    const totalAmount = parseNumericInput(values.depositAmount);

    return {
        customer_id: values.__customerId ?? null,
        payment_term_id: values.__paymentTermId ?? null,
        branch_id: null,
        document_number: values.documentNumber?.trim() || buildGeneratedSalesDepositNumber(),
        numbering_type: values.numberingType?.trim() || null,
        reference_number: values.purchaseOrderNumber?.trim() || null,
        status: totalAmount > 0 ? 'Belum Lunas' : 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        subtotal: totalAmount,
        total_amount: totalAmount,
        paid_amount: 0,
        outstanding_amount: totalAmount,
        notes: values.notes?.trim() || null,
        tax_id: values.taxEnabled ? (values.__taxId ?? null) : null,
        metadata: {
            address: values.address?.trim() || null,
            branch_label: null,
            print_status: values.printStatus ?? 'Belum cetak/email',
            tax_included: Boolean(values.taxIncluded),
        },
    };
}

export function validateSalesDepositValues(values, config) {
    const requiredChecks = [
        { label: config.labels.customer, value: values.customer, type: 'array' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.depositAmount, value: values.depositAmount },
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

    if (parseNumericInput(values.depositAmount) <= 0) {
        return `${config.labels.depositAmount} wajib lebih dari 0.`;
    }

    if (values.taxEnabled && (!values.taxName || !values.__taxId)) {
        return 'PPN wajib diisi jika Kena Pajak dicentang.';
    }

    return '';
}
