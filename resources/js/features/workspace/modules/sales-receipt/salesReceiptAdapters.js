import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { buildLookupLabel, buildFilterOptions } from '@/features/workspace/shared/transactionFormatters';
import {
    applySalesReceiptInvoices,
    formatCurrencyLabel,
    formatCurrencyValue,
} from './salesReceiptCalculations';

export function buildSalesReceiptFormState(source = {}) {
    const paymentAmount = source.paymentAmount ?? '0';
    return applySalesReceiptInvoices({
        ...source,
        paymentAmount,
        paymentAmountForSummary: paymentAmount,
        customer: [...(source.customer ?? [])],
        bankAccounts: [...(source.bankAccounts ?? [])],
        invoices: [...(source.invoices ?? [])],
        branches: [...(source.branches ?? [])],
        dockActions: [...(source.dockActions ?? [])],
        amountButtons: [...(source.amountButtons ?? [])],
    }, [...(source.invoices ?? [])]);
}

export function buildSalesReceiptFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'date') {
            return {
                ...filter,
                rowKey: 'dateFilter',
                options: buildFilterOptions('Tanggal', rows, 'dateFilter'),
            };
        }

        if (filter.id === 'checkDate') {
            return {
                ...filter,
                rowKey: 'checkDateFilter',
                options: buildFilterOptions('Tanggal Cek', rows, 'checkDateFilter'),
            };
        }

        if (filter.id === 'paymentMethod') {
            return {
                ...filter,
                rowKey: 'paymentMethodFilter',
                options: buildFilterOptions('Metode Bayar', rows, 'paymentMethodFilter'),
            };
        }

        if (filter.id === 'bank') {
            return {
                ...filter,
                rowKey: 'bankFilter',
                options: buildFilterOptions('Bank', rows, 'bankFilter'),
            };
        }

        if (filter.id === 'customer') {
            return {
                ...filter,
                rowKey: 'customerFilter',
                options: buildFilterOptions('Terima dari', rows, 'customerFilter'),
            };
        }

        return filter;
    });
}

export function buildSalesReceiptRow(record) {
    const primaryAccountLabel = record?.primary_account ? buildLookupLabel(record.primary_account, 'code') : '';
    const bankLabel = record?.metadata?.bank_label ?? primaryAccountLabel;
    const totalAmount = Number(record?.paid_amount ?? record?.total_amount ?? 0);
    const entryDate = formatIsoDate(record?.entry_date);
    const checkDate = formatIsoDate(record?.check_date);

    return {
        id: String(record?.id ?? ''),
        __backendRecord: record,
        number: record?.document_number ?? '',
        date: entryDate,
        checkNumber: record?.metadata?.check_number ?? '',
        checkDate,
        customer: record?.customer?.name ?? '',
        customerShort: record?.customer?.name ?? '',
        bank: bankLabel,
        notes: record?.notes ?? '',
        useCredit: record?.metadata?.use_credit ? 'Ya' : 'Tidak',
        paymentAmount: formatCurrencyValue(totalAmount),
        paymentMethod: record?.payment_method ?? '',
        dateFilter: entryDate,
        checkDateFilter: checkDate,
        paymentMethodFilter: record?.payment_method ?? '',
        bankFilter: bankLabel,
        customerFilter: record?.customer?.name ?? '',
    };
}

export function buildSalesReceiptInvoiceFromRecord(record) {
    const totalAmount = Number(record?.total_amount ?? 0);
    const outstandingAmount = Number(record?.outstanding_amount ?? totalAmount);
    const paidAmount = Number(record?.paid_amount ?? Math.min(outstandingAmount, totalAmount));
    const invoiceNumber = record?.reference_number ?? record?.document_number ?? '';
    const invoiceDate = formatIsoDate(record?.entry_date);

    return {
        id: String(record?.id ?? ''),
        __lineId: null,
        __relatedDocumentId: record?.id ?? null,
        invoiceNumber,
        invoiceDate,
        invoiceTotal: formatCurrencyLabel(totalAmount),
        outstanding: formatCurrencyLabel(outstandingAmount),
        paid: formatCurrencyLabel(paidAmount),
        discount: 'Rp 0',
        payment: formatCurrencyLabel(paidAmount),
        modal: {
            invoiceNumber,
            invoiceDate,
            outstanding: formatCurrencyLabel(outstandingAmount),
            payment: formatCurrencyValue(paidAmount),
            discountAccount: [],
            discountAmount: '',
            discountNotes: '',
            department: [],
            discountRows: [],
        },
    };
}

export function buildSalesReceiptRecord(record = {}, config) {
    const invoices = (record.lines ?? []).map((line, index) => {
        const amount = Number(line.total_amount ?? 0);
        const invoiceNumber = line.reference_code ?? line.description ?? `INV-${index + 1}`;
        const invoiceDate = line.attributes?.invoice_date ?? formatIsoDate(line.line_date ?? record.entry_date);
        
        const outstandingAmount = line.attributes?.outstanding_amount ?? amount;
        const paidAmount = line.attributes?.paid_amount ?? amount;
        const discountAmount = Number(line.discount_amount ?? 0);

        const discountAccountLabel = line.account ? buildLookupLabel(line.account, 'code') : '';
        const departmentLabel = line.department ? buildLookupLabel(line.department, 'name') : '';

        return {
            id: String(line.id ?? `invoice-${index + 1}`),
            __lineId: line.id ?? null,
            __relatedDocumentId: null,
            invoiceNumber,
            invoiceDate,
            invoiceTotal: formatCurrencyLabel(outstandingAmount),
            outstanding: formatCurrencyLabel(outstandingAmount),
            paid: formatCurrencyLabel(paidAmount),
            discount: formatCurrencyLabel(discountAmount),
            payment: formatCurrencyLabel(amount),
            modal: {
                invoiceNumber,
                invoiceDate,
                outstanding: formatCurrencyLabel(outstandingAmount),
                payment: formatCurrencyValue(amount),
                __discountAccountId: line.account_id ?? null,
                discountAccount: discountAccountLabel ? [discountAccountLabel] : [],
                discountAmount: discountAmount > 0 ? String(discountAmount) : '',
                discountNotes: line.attributes?.discount_notes ?? '',
                __departmentId: line.department_id ?? null,
                department: departmentLabel ? [departmentLabel] : [],
                discountRows: [],
            },
        };
    });
    const bankLabel = record?.metadata?.bank_label ?? (record?.primary_account ? buildLookupLabel(record.primary_account, 'code') : '');

    return applySalesReceiptInvoices({
        __backendRecordId: record.id ?? null,
        __customerId: record.customer_id ?? null,
        __bankAccountId: record.primary_account_id ?? null,
        __branchId: record.branch_id ?? null,
        customer: record.customer?.name ? [buildLookupLabel(record.customer)] : [],
        bankAccounts: bankLabel ? [bankLabel] : [],
        entryDate: formatIsoDate(record.entry_date),
        autoNumber: false,
        numberingType: record.numbering_type ?? config.numberingOptions?.[0] ?? '',
        documentNumber: record.document_number ?? '',
        currency: record.currency?.code ?? config.draft?.currency ?? '',
        paymentAmount: formatCurrencyValue(record.paid_amount ?? record.total_amount ?? 0),
        invoiceSearch: '',
        invoices,
        paymentMethod: record.payment_method ?? config.draft?.paymentMethod ?? 'Tunai',
        checkNumber: record.metadata?.check_number ?? '',
        checkDate: formatIsoDate(record.check_date),
        voided: Boolean(record.flags?.voided),
        branches: record.branch?.name ? [record.branch.name] : (record.metadata?.branch_label ? [record.metadata.branch_label] : []),
        notes: record.notes ?? '',
        reconcileStatus: record.metadata?.reconcile_status ?? '',
        printStatus: record.metadata?.print_status ?? '',
        amountButtons: ['refresh'],
        dockActions: config.detailRecords?.[record.document_number]?.dockActions ?? config.draft?.dockActions ?? [],
    }, invoices);
}
