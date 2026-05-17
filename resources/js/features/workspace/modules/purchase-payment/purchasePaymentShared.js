import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { validateRequiredChecks } from '@/features/workspace/shared/formValidation';

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

function buildPurchasePaymentTotal(invoices = []) {
    return invoices.reduce((sum, invoice) => sum + parseNumericInput(invoice.payment ?? invoice.pay ?? invoice.total), 0);
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

export function applyPurchasePaymentInvoices(values, invoices) {
    const totalAmount = buildPurchasePaymentTotal(invoices);
    const totalLabel = formatCurrencyLabel(totalAmount);

    return {
        ...values,
        invoices,
        invoiceTitle: invoices.length ? `Faktur (${invoices.length})` : 'Faktur',
        paymentAmount: formatCurrencyValue(totalAmount),
        paymentAmountPrefix: totalAmount > 0 ? 'Rp' : '',
        paymentAmountDisplay: formatCurrencyValue(totalAmount),
        footerPaymentValue: totalLabel,
        footerInvoiceValue: totalLabel,
    };
}

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

export function buildGeneratedPurchasePaymentNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `PP.${year}.${month}.${day}.${time}`;
}

export function buildPurchasePaymentPayload(values) {
    const totalAmount = buildPurchasePaymentTotal(values.invoices ?? []);
    const lines = (values.invoices ?? []).map((invoice, index) => ({
        id: invoice.__lineId ?? undefined,
        description: invoice.formNumber?.trim() || invoice.number?.trim() || null,
        reference_code: invoice.number?.trim() || invoice.formNumber?.trim() || null,
        total_amount: parseNumericInput(invoice.payment ?? invoice.pay ?? invoice.total),
        sort_order: index,
    }));

    return {
        supplier_id: values.__supplierId ?? null,
        primary_account_id: values.__bankAccountId ?? null,
        branch_id: values.__branchId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedPurchasePaymentNumber(),
        numbering_type: values.numberingType?.trim() || null,
        payment_method: values.paymentMethod?.trim() || null,
        status: values.voided ? 'Void' : 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        check_date: normalizeDisplayDate(values.dueDatePph) || null,
        notes: values.notes?.trim() || null,
        paid_amount: totalAmount,
        total_amount: totalAmount,
        flags: {
            voided: Boolean(values.voided),
        },
        metadata: {
            supplier_label: values.payee?.[0] ?? null,
            bank_label: values.bankAccounts?.[0] ?? null,
            branch_label: values.branches?.[0] ?? null,
            reconcile_status: values.reconcileStatus?.trim() || null,
            print_status: values.printStatus?.trim() || null,
            paid_with: values.paidWith?.trim() || null,
            paid_at: values.paidAt?.trim() || null,
        },
        lines: lines.filter((line) => line.description || line.reference_code || line.total_amount > 0),
    };
}

export function validatePurchasePaymentValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.payee, value: values.payee, type: 'array' },
        { label: config.labels.bank, value: values.bankAccounts, type: 'array' },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.entryDate, value: values.entryDate },
        { label: config.labels.branch, value: values.branches, type: 'array' },
        { label: 'Faktur', value: values.invoices, type: 'array' },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    const invalidInvoice = (values.invoices ?? []).find((invoice) => parseNumericInput(invoice.payment ?? invoice.pay ?? invoice.total) <= 0);

    if (invalidInvoice) {
        return 'Setiap faktur pembayaran wajib memiliki nilai pembayaran lebih dari 0.';
    }

    return '';
}
