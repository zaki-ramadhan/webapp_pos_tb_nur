import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { buildCurrencyValue, TransactionToolbarIconButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import {
    RefreshIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

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

function buildSalesReceiptTotal(invoices = []) {
    return invoices.reduce((sum, invoice) => sum + parseNumericInput(invoice.payment ?? invoice.paid ?? invoice.invoiceTotal), 0);
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

export function applySalesReceiptInvoices(values, invoices) {
    const totalAmount = buildSalesReceiptTotal(invoices);

    return {
        ...values,
        invoices,
        paymentAmount: formatCurrencyValue(totalAmount),
    };
}

export function buildSalesReceiptFormState(source = {}) {
    return applySalesReceiptInvoices({
        ...source,
        customer: [...(source.customer ?? [])],
        bankAccounts: [...(source.bankAccounts ?? [])],
        invoices: [...(source.invoices ?? [])],
        branches: [...(source.branches ?? [])],
        dockActions: [...(source.dockActions ?? [])],
        amountButtons: [...(source.amountButtons ?? [])],
    }, [...(source.invoices ?? [])]);
}

export function buildSalesReceiptSummaryValue(value = '0') {
    if (value === '' || value == null || String(value) === '0') {
        return '0';
    }

    return buildCurrencyValue(value);
}

export function buildInvoiceSectionTitle(label, count = 0) {
    if (!count) {
        return label;
    }

    return `${label} (${count})`;
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
    const primaryAccountLabel = record?.primaryAccount ? buildLookupLabel(record.primaryAccount, 'code') : '';
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
        const invoiceDate = formatIsoDate(line.line_date ?? record.entry_date);

        return {
            id: String(line.id ?? `invoice-${index + 1}`),
            __lineId: line.id ?? null,
            __relatedDocumentId: null,
            invoiceNumber,
            invoiceDate,
            invoiceTotal: formatCurrencyLabel(amount),
            outstanding: formatCurrencyLabel(amount),
            paid: formatCurrencyLabel(amount),
            discount: 'Rp 0',
            payment: formatCurrencyLabel(amount),
            modal: {
                invoiceNumber,
                invoiceDate,
                outstanding: formatCurrencyLabel(amount),
                payment: formatCurrencyValue(amount),
                discountAccount: [],
                discountAmount: '',
                discountNotes: '',
                department: [],
                discountRows: [],
            },
        };
    });
    const bankLabel = record?.metadata?.bank_label ?? (record?.primaryAccount ? buildLookupLabel(record.primaryAccount, 'code') : '');

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

export function buildGeneratedSalesReceiptNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `SR.${year}.${month}.${day}.${time}`;
}

export function buildSalesReceiptPayload(values) {
    const totalAmount = buildSalesReceiptTotal(values.invoices ?? []);
    const lines = (values.invoices ?? []).map((invoice, index) => ({
        id: invoice.__lineId ?? undefined,
        description: invoice.invoiceNumber?.trim() || null,
        reference_code: invoice.invoiceNumber?.trim() || null,
        total_amount: parseNumericInput(invoice.payment ?? invoice.paid ?? invoice.invoiceTotal),
        sort_order: index,
    }));

    return {
        customer_id: values.__customerId ?? null,
        primary_account_id: values.__bankAccountId ?? null,
        branch_id: values.__branchId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedSalesReceiptNumber(),
        numbering_type: values.numberingType?.trim() || null,
        payment_method: values.paymentMethod?.trim() || null,
        status: values.voided ? 'Void' : 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        check_date: normalizeDisplayDate(values.checkDate) || null,
        notes: values.notes?.trim() || null,
        paid_amount: totalAmount,
        total_amount: totalAmount,
        flags: {
            voided: Boolean(values.voided),
        },
        metadata: {
            bank_label: values.bankAccounts?.[0] ?? null,
            branch_label: values.branches?.[0] ?? null,
            check_number: values.checkNumber?.trim() || null,
            reconcile_status: values.reconcileStatus?.trim() || null,
            print_status: values.printStatus?.trim() || null,
            use_credit: false,
        },
        lines: lines.filter((line) => line.description || line.reference_code || line.total_amount > 0),
    };
}

export function validateSalesReceiptValues(values, config) {
    const requiredChecks = [
        { label: config.labels.customer, value: values.customer, type: 'array' },
        { label: config.labels.bank, value: values.bankAccounts, type: 'array' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.branch, value: values.branches, type: 'array' },
        { label: 'Faktur', value: values.invoices, type: 'array' },
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

    const invalidInvoice = (values.invoices ?? []).find((invoice) => parseNumericInput(invoice.payment ?? invoice.paid ?? invoice.invoiceTotal) <= 0);

    if (invalidInvoice) {
        return 'Setiap faktur penerimaan wajib memiliki nilai pembayaran lebih dari 0.';
    }

    return '';
}

export function ReadonlyTextarea({ value, rows = 3, className = '' }) {
    return (
        <textarea
            value={value}
            rows={rows}
            readOnly
            className={`w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none ${className}`.trim()}
        />
    );
}

export function ReceiptAmountInput({ value, isDetail }) {
    const displayValue = !isDetail && String(value ?? '0') === '0' ? '' : String(value ?? '');

    return (
        <div className="flex h-[34px] overflow-hidden rounded-[4px] border border-[#cfd6e2] bg-white">
            {isDetail ? (
                <span className="inline-flex items-center border-r border-[#d8dde7] bg-[#f5f6f8] px-3 text-[15px] text-[#9aa3b1]">
                    Rp
                </span>
            ) : null}
            <span className={`inline-flex flex-1 items-center px-3 text-[16px] text-[#111827] ${isDetail ? 'justify-end font-semibold' : ''}`.trim()}>
                {displayValue}
            </span>
        </div>
    );
}

export function ReceiptAmountActionButton({ type }) {
    const icon =
        type === 'refresh' ? (
            <RefreshIcon className="h-4.5 w-4.5 text-[#2353a0]" />
        ) : (
            <TableActionIcon className="h-4.5 w-4.5 text-[#2353a0]" />
        );
    const label = type === 'refresh' ? 'Segarkan nilai pembayaran' : 'Tampilkan bantuan pembayaran';

    return (
        <TransactionToolbarIconButton label={label} className="h-[34px] w-[40px]">
            {icon}
        </TransactionToolbarIconButton>
    );
}

export function ReceiptSummaryFooter({ paymentAmount }) {
    const items = [
        { id: 'payment', label: 'Nilai Pembayaran', value: buildSalesReceiptSummaryValue(paymentAmount) },
        { id: 'paid', label: 'Faktur Dibayar', value: buildSalesReceiptSummaryValue(paymentAmount) },
    ];

    return (
        <div className="flex justify-end">
            <div className="grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] md:grid-cols-2">
                {items.map((item) => (
                    <div key={item.id} className="border-b border-[#e4e8f0] px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 md:px-5">
                        <div className="text-[17px] text-[#1f2436]">{item.label}</div>
                        <div className="mt-2 text-right text-[18px] font-semibold text-[#111827]">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
