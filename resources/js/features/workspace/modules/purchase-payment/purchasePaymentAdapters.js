import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import {
    buildFilterOptions,
    buildLookupLabel,
    formatCurrencyValue,
} from '@/features/workspace/shared/transactionFormatters';
import {
    applyPurchasePaymentInvoices,
    formatCurrencyLabel,
} from './purchasePaymentCalculations';

export function buildPurchasePaymentFilters(baseFilters = [], rows = []) {
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

        if (filter.id === 'method') {
            return {
                ...filter,
                rowKey: 'methodFilter',
                options: buildFilterOptions('Metode Bayar', rows, 'methodFilter'),
            };
        }

        if (filter.id === 'bank') {
            return {
                ...filter,
                rowKey: 'bankFilter',
                options: buildFilterOptions('Bank', rows, 'bankFilter'),
            };
        }

        if (filter.id === 'supplier') {
            return {
                ...filter,
                rowKey: 'supplierFilter',
                options: buildFilterOptions('Pembayaran ke', rows, 'supplierFilter'),
            };
        }

        return filter;
    });
}

export function buildPurchasePaymentRow(record) {
    const primaryAccountLabel = record?.primaryAccount
        ? buildLookupLabel(record.primaryAccount, 'code')
        : '';
    const bankLabel = record?.metadata?.bank_label ?? primaryAccountLabel;
    const paymentAmount = Number(record?.paid_amount ?? record?.total_amount ?? 0);
    const entryDate = formatIsoDate(record?.entry_date);
    const checkDate = formatIsoDate(record?.check_date);

    return {
        id: String(record?.id ?? ''),
        __backendRecord: record,
        number: record?.document_number ?? '',
        date: entryDate,
        checkNumber: record?.metadata?.check_number ?? '',
        checkDate,
        supplier: record?.supplier?.name ?? '',
        bank: bankLabel,
        notes: record?.notes ?? '',
        paymentAmount: formatCurrencyValue(paymentAmount),
        method: record?.payment_method ?? '',
        branch: record?.branch?.name ?? record?.metadata?.branch_label ?? '',
        dateFilter: entryDate,
        checkDateFilter: checkDate,
        methodFilter: record?.payment_method ?? '',
        bankFilter: bankLabel,
        supplierFilter: record?.supplier?.name ?? '',
    };
}

export function buildPurchasePaymentRecordFromBackend(record = {}, config) {
    const invoices = (record.lines ?? []).map((line, index) => {
        const amount = formatCurrencyLabel(line.total_amount ?? 0);
        const number = line.reference_code ?? line.description ?? `INV-${index + 1}`;

        return {
            id: String(line.id ?? `invoice-${index + 1}`),
            __lineId: line.id ?? null,
            __relatedDocumentId: null,
            number,
            formNumber: number,
            date: formatIsoDate(line.line_date ?? record.entry_date),
            total: amount,
            outstanding: amount,
            pay: amount,
            discount: 'Rp 0',
            payment: amount,
            pphChecked: false,
            pphLabel: '',
            pphAmount: 'Rp 0',
            withholdingProof: '',
            discountAccount: '',
            discountValue: '',
            discountNotes: '',
            department: '',
        };
    });

    return applyPurchasePaymentInvoices(
        {
            __backendRecordId: record.id ?? null,
            __supplierId: record.supplier_id ?? null,
            __bankAccountId: record.primary_account_id ?? null,
            __branchId: record.branch_id ?? null,
            payee: record.supplier?.name ? [buildLookupLabel(record.supplier)] : [],
            bankAccounts: record.metadata?.bank_label ? [record.metadata.bank_label] : (record.primaryAccount ? [buildLookupLabel(record.primaryAccount, 'code')] : []),
            entryDate: formatIsoDate(record.entry_date),
            autoNumber: false,
            numberingType: record.numbering_type ?? config.draft?.numberingType ?? '',
            documentNumber: record.document_number ?? '',
            currency: record.currency?.code ?? config.draft?.currency ?? '',
            invoiceSearch: '',
            paymentMethod: record.payment_method ?? config.draft?.paymentMethod ?? 'Tunai',
            dueDatePph: formatIsoDate(record.check_date ?? record.due_date),
            notes: record.notes ?? '',
            voided: Boolean(record.flags?.voided),
            branches: record.branch?.name ? [record.branch.name] : (record.metadata?.branch_label ? [record.metadata.branch_label] : []),
            reconcileStatus: record.metadata?.reconcile_status ?? '',
            printStatus: record.metadata?.print_status ?? '',
            paidWith: record.payment_method ?? '',
            paidAt: formatIsoDate(record.entry_date),
            showSecondaryAmountButton: false,
            modal: config.draft?.modal ?? null,
            dockActions: config.detailRecords?.[record.document_number]?.dockActions ?? config.draft?.dockActions ?? [],
        },
        invoices,
    );
}

export function buildPurchasePaymentInvoiceFromRecord(record) {
    const totalLabel = formatCurrencyLabel(record?.total_amount ?? record?.paid_amount ?? record?.subtotal ?? 0);

    return {
        id: String(record?.id ?? ''),
        __lineId: null,
        __relatedDocumentId: record?.id ?? null,
        number: record?.reference_number ?? record?.document_number ?? '',
        formNumber: record?.document_number ?? '',
        date: formatIsoDate(record?.entry_date),
        total: totalLabel,
        outstanding: formatCurrencyLabel(record?.outstanding_amount ?? record?.total_amount ?? 0),
        pay: totalLabel,
        discount: 'Rp 0',
        payment: totalLabel,
        pphChecked: false,
        pphLabel: '',
        pphAmount: 'Rp 0',
        withholdingProof: '',
        discountAccount: '',
        discountValue: '',
        discountNotes: '',
        department: '',
    };
}

export function buildFormState(source = {}, config) {
    return applyPurchasePaymentInvoices({
        __backendRecordId: source.__backendRecordId ?? null,
        __supplierId: source.__supplierId ?? null,
        __bankAccountId: source.__bankAccountId ?? null,
        __branchId: source.__branchId ?? null,
        payee: [...(source.payee ?? config.draft?.payee ?? [])],
        bankAccounts: [...(source.bankAccounts ?? config.draft?.bankAccounts ?? [])],
        paymentAmount: source.paymentAmount ?? config.draft?.paymentAmount ?? '',
        paymentAmountPrefix: source.paymentAmountPrefix ?? config.draft?.paymentAmountPrefix ?? '',
        paymentAmountDisplay: source.paymentAmountDisplay ?? config.draft?.paymentAmountDisplay ?? '0',
        entryDate: source.entryDate ?? config.draft?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.draft?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.draft?.numberingType ?? '',
        documentNumber: source.documentNumber ?? config.draft?.documentNumber ?? '',
        currency: source.currency ?? config.draft?.currency ?? '',
        invoiceSearch: source.invoiceSearch ?? config.draft?.invoiceSearch ?? '',
        invoices: [...(source.invoices ?? config.draft?.invoices ?? [])],
        invoiceTitle: source.invoiceTitle ?? config.draft?.invoiceTitle ?? 'Faktur',
        paymentMethod: source.paymentMethod ?? config.draft?.paymentMethod ?? 'Tunai',
        dueDatePph: source.dueDatePph ?? config.draft?.dueDatePph ?? '',
        notes: source.notes ?? config.draft?.notes ?? '',
        voided: source.voided ?? config.draft?.voided ?? false,
        branches: [...(source.branches ?? config.draft?.branches ?? [])],
        reconcileStatus: source.reconcileStatus ?? config.draft?.reconcileStatus ?? '',
        printStatus: source.printStatus ?? config.draft?.printStatus ?? '',
        paidWith: source.paidWith ?? config.draft?.paidWith ?? '',
        paidAt: source.paidAt ?? config.draft?.paidAt ?? '',
        footerPaymentValue: source.footerPaymentValue ?? config.draft?.footerPaymentValue ?? '0',
        footerInvoiceValue: source.footerInvoiceValue ?? config.draft?.footerInvoiceValue ?? '0',
        showSecondaryAmountButton: source.showSecondaryAmountButton ?? config.draft?.showSecondaryAmountButton ?? true,
        modal: source.modal ?? config.draft?.modal ?? null,
        dockActions: source.dockActions ?? config.draft?.dockActions ?? [],
    }, [...(source.invoices ?? config.draft?.invoices ?? [])]);
}
