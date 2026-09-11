import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import {
    buildLookupLabel,
    formatCurrencyLabel,
    formatCurrencyValue,
    parseNumericInput,
} from '@/features/workspace/shared/transactionFormatters';

export { buildLookupLabel, formatCurrencyLabel, formatCurrencyValue, parseNumericInput };

function buildSummaryRows(totalAmount, status, printStatus = 'Belum cetak/email') {
    return [
        ['Total', formatCurrencyLabel(totalAmount)],
        ['Uang Muka Terpakai/Retur', 'Rp 0'],
        ['Sisa Uang Muka', formatCurrencyLabel(totalAmount)],
        ['Pembayaran', 'Rp 0'],
        ['Retur', 'Rp 0'],
        ['Hutang', formatCurrencyLabel(totalAmount)],
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

export function resolveDepositStatus(record) {
    const rawStatus = String(record?.status ?? '').toLowerCase();
    if (rawStatus === 'void' || rawStatus === 'batal' || rawStatus === 'cancelled') {
        return 'Batal';
    }
    if (rawStatus === 'draft') {
        return 'Draft';
    }
    const totalAmount = Number(record?.total_amount ?? record?.paid_amount ?? 0);
    const outstandingAmount = record?.outstanding_amount !== undefined ? Number(record?.outstanding_amount) : null;
    const usedAmount = record?.used_amount !== undefined ? Number(record?.used_amount) : (record?.applied_amount !== undefined ? Number(record?.applied_amount) : null);

    if (rawStatus === 'lunas' || (outstandingAmount !== null && outstandingAmount <= 0 && totalAmount > 0)) {
        return 'Lunas';
    }
    if (rawStatus === 'sebagian' || (usedAmount !== null && usedAmount > 0 && (outstandingAmount === null || outstandingAmount > 0))) {
        return 'Sebagian';
    }
    return 'Belum Lunas';
}

export function buildPurchaseDepositRow(record) {
    const totalAmount = Number(record?.total_amount ?? record?.paid_amount ?? 0);
    const dateLabel = formatIsoDate(record?.entry_date ?? record?.date ?? record?.created_at) || '';
    const supplierName = record?.supplier?.name ?? record?.supplier_name ?? record?.party_name ?? '';
    const documentNumber = record?.document_number ?? record?.number ?? '';
    const invoiceNumber = record?.reference_number ?? record?.metadata?.invoice_number ?? record?.invoice_number ?? '';
    const notes = record?.notes ?? record?.description ?? '';
    const status = resolveDepositStatus(record);
    let age = 0;
    if (record?.metadata?.age !== undefined && record?.metadata?.age !== null) {
        age = Number(record.metadata.age);
    } else if (record?.entry_date) {
        const entryTime = new Date(record.entry_date).getTime();
        const nowTime = Date.now();
        const diffDays = Math.floor(Math.max(0, nowTime - entryTime) / (1000 * 60 * 60 * 24));
        age = Number.isFinite(diffDays) ? diffDays : 0;
    }

    return {
        id: String(record?.id ?? ''),
        number: documentNumber,
        name: documentNumber,
        tabLabel: documentNumber,
        invoiceNumber,
        date: dateLabel,
        dateFilter: record?.entry_date ?? '',
        supplier: supplierName,
        supplierShort: supplierName,
        supplierFilter: supplierName,
        notes,
        status,
        statusFilter: status,
        age,
        ageValue: age,
        total: totalAmount ? totalAmount.toLocaleString('id-ID') : '0',
        totalValue: totalAmount,
        statusIcon: status === 'Lunas' ? 'paid' : 'draft',
        __backendRecord: record,
    };
}

export function buildPurchaseDepositRecord(record = {}, config = {}) {
    const totalAmount = Number(record?.total_amount ?? record?.paid_amount ?? 0);
    const subtotalAmount = Number(record?.subtotal ?? totalAmount);
    const status = resolveDepositStatus(record);
    const isLunas = status === 'Lunas';
    const printStatus = record?.metadata?.print_status ?? 'Belum cetak/email';
    const statusStamp = isLunas ? 'LUNAS' : (status === 'Batal' ? 'BATAL' : (status === 'Draft' ? '' : 'BELUM LUNAS'));
    const statusTone = isLunas ? 'green' : (status === 'Batal' ? 'gray' : 'red');

    const supplier = record?.supplier?.name
        ? [buildLookupLabel(record.supplier)]
        : record?.supplier_name
        ? [record.supplier_name]
        : [];

    const bankAccount = record?.primary_account?.name
        ? [buildLookupLabel(record.primary_account)]
        : [];

    return {
        ...config.draft,
        __backendRecordId: record?.id ?? null,
        __supplierId: record?.supplier_id ?? record?.supplier?.id ?? null,
        supplier,
        entryDate: formatIsoDate(record?.entry_date) || config.draft?.entryDate,
        autoNumber: false,
        numberingType: record?.numbering_type ?? config.draft?.numberingType ?? 'Uang Muka Pembelian',
        documentNumber: record?.document_number ?? '',
        depositAmount: subtotalAmount ? subtotalAmount.toLocaleString('id-ID') : '0',
        __taxId: record?.tax_id ?? null,
        taxName: record?.tax ? buildLookupLabel(record.tax) : '',
        taxEnabled: Boolean(record?.tax_id),
        taxIncluded: Boolean(record?.metadata?.tax_included),
        taxInvoiceDate: formatIsoDate(record?.metadata?.tax_invoice_date ?? record?.entry_date),
        taxTransactionType: record?.metadata?.tax_transaction_type ?? 'Faktur Pajak',
        taxInvoiceNumber: record?.metadata?.tax_invoice_number ?? '',
        taxRate: record?.tax ? parseFloat(record.tax.rate) : 0,
        __bankAccountId: record?.primary_account_id ?? null,
        bankAccounts: bankAccount,
        address: record?.metadata?.address ?? record?.supplier?.billing_address ?? record?.supplier?.address ?? '',
        notes: record?.notes ?? '',
        status,
        rawStatus: record?.status ?? status,
        summary: buildSummaryRows(totalAmount, status, printStatus),
        approvalStamp: record?.metadata?.approval_stamp ?? '',
        statusStamp: isLunas ? 'LUNAS' : 'BELUM LUNAS',
        statusTone: isLunas ? 'green' : 'red',
        processButtonLabel: 'Proses',
        dockActions: config.draft?.dockActions ?? [],
        subtotal: formatCurrencyLabel(subtotalAmount),
        taxTotalFormatted: formatCurrencyLabel(record?.tax_total ?? 0),
        total: formatCurrencyLabel(totalAmount),
        printStatus,
    };
}

export function buildPurchaseDepositFormState(source = {}, config = {}) {
    const depositAmount = source.depositAmount ?? config.draft?.depositAmount ?? '0';
    const totalAmount = parseNumericInput(depositAmount);
    const status = source.summary?.find?.(([label]) => label === 'Status')?.[1] ?? source.status ?? 'Draft';
    const printStatus = source.printStatus ?? config.draft?.printStatus ?? 'Belum cetak/email';

    return {
        __backendRecordId: source.__backendRecordId ?? null,
        __supplierId: source.__supplierId ?? null,
        supplier: [...(source.supplier ?? config.draft?.supplier ?? [])],
        entryDate: source.entryDate ?? config.draft?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.draft?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.draft?.numberingType ?? 'Uang Muka Pembelian',
        documentNumber: source.documentNumber ?? config.draft?.documentNumber ?? '',
        depositAmount,
        __taxId: source.__taxId ?? null,
        taxName: source.taxName ?? '',
        taxEnabled: source.taxEnabled ?? config.draft?.taxEnabled ?? false,
        taxIncluded: source.taxIncluded ?? config.draft?.taxIncluded ?? true,
        taxInvoiceDate: source.taxInvoiceDate ?? source.entryDate ?? '',
        taxTransactionType: source.taxTransactionType ?? 'Faktur Pajak',
        taxInvoiceNumber: source.taxInvoiceNumber ?? '',
        taxRate: source.taxRate ?? 0,
        __bankAccountId: source.__bankAccountId ?? null,
        bankAccounts: [...(source.bankAccounts ?? config.draft?.bankAccounts ?? [])],
        address: source.address ?? config.draft?.address ?? '',
        notes: source.notes ?? config.draft?.notes ?? '',
        summary: source.summary ?? buildSummaryRows(totalAmount, status, printStatus),
        approvalStamp: source.approvalStamp ?? config.draft?.approvalStamp ?? '',
        statusStamp: source.statusStamp ?? config.draft?.statusStamp ?? '',
        statusTone: source.statusTone ?? config.draft?.statusTone ?? 'gray',
        processButtonLabel: source.processButtonLabel ?? config.draft?.processButtonLabel ?? 'Proses',
        dockActions: source.dockActions ?? config.draft?.dockActions ?? [],
        subtotal: source.subtotal ?? formatCurrencyLabel(totalAmount),
        taxTotalFormatted: source.taxTotalFormatted ?? 'Rp 0',
        total: source.total ?? formatCurrencyLabel(totalAmount),
        printStatus,
    };
}

export function buildGeneratedPurchaseDepositNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    return `UMP.${year}.${month}.${time}`;
}

export function buildPurchaseDepositPayload(values) {
    const baseAmount = parseNumericInput(values.depositAmount);
    const taxRate = (values.taxEnabled && values.__taxId) ? (values.taxRate ?? 0) / 100 : 0;

    let taxTotal = 0;
    let totalAmount = baseAmount;

    if (taxRate > 0) {
        if (values.taxIncluded) {
            taxTotal = Math.round(baseAmount - (baseAmount / (1 + taxRate)));
            totalAmount = baseAmount;
        } else {
            taxTotal = Math.round(baseAmount * taxRate);
            totalAmount = baseAmount + taxTotal;
        }
    }

    return {
        supplier_id: values.__supplierId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedPurchaseDepositNumber(),
        numbering_type: values.numberingType?.trim() || null,
        status: totalAmount > 0 ? 'Belum Lunas' : 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        subtotal: baseAmount,
        tax_total: taxTotal,
        total_amount: totalAmount,
        paid_amount: 0,
        outstanding_amount: totalAmount,
        primary_account_id: values.__bankAccountId ?? null,
        notes: values.notes?.trim() || null,
        tax_id: values.taxEnabled ? (values.__taxId ?? null) : null,
        metadata: {
            address: values.address?.trim() || null,
            print_status: values.printStatus ?? 'Belum cetak/email',
            tax_included: Boolean(values.taxIncluded),
            tax_invoice_date: normalizeDisplayDate(values.taxInvoiceDate) || null,
            tax_transaction_type: values.taxTransactionType ?? null,
            tax_invoice_number: values.taxTransactionType === 'Faktur Pajak' ? (values.taxInvoiceNumber?.trim() || null) : null,
        },
    };
}

export function validatePurchaseDepositValues(values, config = {}) {
    const labels = config.labels || {};
    const supplierLabel = labels.supplier || 'Pemasok';
    const entryDateLabel = labels.entryDate || 'Tanggal';
    const documentNumberLabel = labels.documentNumber || 'No Form #';
    const depositAmountLabel = labels.depositAmount || 'Uang Muka';

    if (!values.supplier || !values.supplier.length || !values.__supplierId) {
        return `${supplierLabel} wajib dipilih.`;
    }
    if (!String(values.entryDate ?? '').trim()) {
        return `${entryDateLabel} wajib diisi.`;
    }
    if (!values.autoNumber && !String(values.documentNumber ?? '').trim()) {
        return `${documentNumberLabel} wajib diisi.`;
    }
    if (parseNumericInput(values.depositAmount) <= 0) {
        return `${depositAmountLabel} wajib lebih dari 0.`;
    }
    if (values.taxEnabled && (!values.taxName || !values.__taxId)) {
        return 'PPN wajib diisi jika Kena Pajak dicentang.';
    }
    if (values.taxEnabled && values.__taxId && values.taxTransactionType === 'Faktur Pajak' && values.taxInvoiceNumber) {
        const raw = values.taxInvoiceNumber.trim();
        if (!/^[0-9.-]+$/.test(raw)) {
            return 'Nomor Faktur Pajak hanya boleh berisi angka, titik, dan strip.';
        }
        const cleaned = raw.replace(/\D/g, '');
        if (cleaned.length !== 16) {
            return 'Nomor Faktur Pajak harus terdiri dari 16 digit angka.';
        }
    }
    return '';
}
