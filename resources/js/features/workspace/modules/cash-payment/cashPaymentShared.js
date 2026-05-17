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
    const code = String(record?.[codeKey] ?? record?.accountCode ?? '').trim();
    const name = String(record?.name ?? record?.accountName ?? record?.title ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

function buildPaymentTotalAmount(lineItems = []) {
    return lineItems.reduce((sum, item) => sum + parseNumericInput(item.amount), 0);
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

export function applyCashPaymentLineItems(values, lineItems) {
    const totalAmount = buildPaymentTotalAmount(lineItems);

    return {
        ...values,
        lineItems,
        totalValue: formatCurrencyLabel(totalAmount),
    };
}

export function buildCashPaymentFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'date') {
            return {
                ...filter,
                rowKey: 'dateFilter',
                options: buildFilterOptions('Tanggal', rows, 'dateFilter'),
            };
        }

        if (filter.id === 'bank') {
            return {
                ...filter,
                rowKey: 'bankFilter',
                options: buildFilterOptions('Kas/Bank', rows, 'bankFilter'),
            };
        }

        return filter;
    });
}

export function buildCashPaymentRow(record) {
    const primaryAccountLabel = buildLookupLabel(record?.primaryAccount ?? {}, 'code');
    const bankLabel = record?.metadata?.cash_bank_label ?? primaryAccountLabel;
    const totalAmount = Number(record?.total_amount ?? record?.paid_amount ?? 0);
    const entryDate = formatIsoDate(record?.entry_date);

    return {
        id: String(record?.id ?? ''),
        __backendRecord: record,
        number: record?.document_number ?? '',
        date: entryDate,
        cashBank: bankLabel,
        cashBankFull: bankLabel,
        checkNumber: record?.metadata?.check_number ?? '',
        description: record?.notes ?? '',
        amount: formatCurrencyValue(totalAmount),
        dateFilter: entryDate,
        bankFilter: bankLabel,
        branch: record?.branch?.name ?? record?.metadata?.branch_label ?? '',
    };
}

export function buildCashPaymentRecord(record = {}, config) {
    const lineItems = (record.lines ?? []).map((line, index) => ({
        id: String(line.id ?? `line-${index + 1}`),
        __lineId: line.id ?? null,
        __accountId: line.account_id ?? null,
        accountCode: line.account?.code ?? line.reference_code ?? '',
        accountName: line.account?.name ?? line.description ?? line.reference_code ?? `Baris ${index + 1}`,
        amount: formatCurrencyValue(line.total_amount ?? 0),
    }));
    const totalAmount = Number(record.total_amount ?? record.paid_amount ?? 0);
    const primaryAccountLabel = buildLookupLabel(record.primaryAccount ?? {}, 'code');
    const bankLabel = record.metadata?.cash_bank_label ?? primaryAccountLabel;

    return applyCashPaymentLineItems(
        {
            __backendRecordId: record.id ?? null,
            __primaryAccountId: record.primary_account_id ?? null,
            __branchId: record.branch_id ?? null,
            bankAccounts: bankLabel ? [bankLabel] : [],
            entryDate: formatIsoDate(record.entry_date),
            autoNumber: false,
            numberingType: record.numbering_type ?? config.numberingOptions?.[0] ?? '',
            documentNumber: record.document_number ?? '',
            checkNumber: record.metadata?.check_number ?? '',
            recipient: record.metadata?.recipient ?? '',
            voided: Boolean(record.flags?.voided),
            branches: record.branch?.name ? [record.branch.name] : (record.metadata?.branch_label ? [record.metadata.branch_label] : []),
            notes: record.notes ?? '',
            lineLookup: '',
            saveTone: 'muted',
            kapNumber: record.metadata?.kap_number ?? '',
            kjsNumber: record.metadata?.kjs_number ?? '',
            ntpn: record.metadata?.ntpn ?? '',
            reconcileStatus: record.metadata?.reconcile_status ?? '',
            printStatus: record.metadata?.print_status ?? '',
        },
        lineItems,
    );
}

export function buildDetailRecordFromRow(row = {}, config) {
    if (row.__backendRecord) {
        return buildCashPaymentRecord(row.__backendRecord, config);
    }

    const amount = row.amount ?? '0';
    const bank = row.cashBankFull ?? row.cashBank ?? '';
    const branch = row.branch ?? 'JAKARTA';

    return {
        bankAccounts: bank ? [bank] : [],
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? '',
        documentNumber: row.number ?? '',
        checkNumber: row.checkNumber ?? '',
        recipient: row.recipient ?? '',
        voided: row.voided ?? false,
        __branchId: null,
        __primaryAccountId: null,
        branches: branch ? [branch] : [],
        notes: row.description ?? '',
        lineLookup: '',
        lineItems: row.lineItems ?? [
            {
                id: `${row.id}-line-1`,
                __lineId: null,
                __accountId: null,
                accountCode: row.accountCode ?? '215.000-02',
                accountName: row.accountName ?? row.description ?? '',
                amount,
            },
        ],
        totalValue: formatCurrencyLabel(amount),
        saveTone: 'muted',
        kapNumber: row.kapNumber ?? '',
        kjsNumber: row.kjsNumber ?? '',
        ntpn: row.ntpn ?? '',
        reconcileStatus: row.reconcileStatus ?? 'Belum',
        printStatus: row.printStatus ?? 'Belum cetak/email',
    };
}

export function buildFormState(source = {}, config) {
    return applyCashPaymentLineItems(
        {
            __backendRecordId: source.__backendRecordId ?? null,
            __primaryAccountId: source.__primaryAccountId ?? null,
            __branchId: source.__branchId ?? null,
            bankAccounts: [...(source.bankAccounts ?? config.draft?.bankAccounts ?? [])],
            entryDate: source.entryDate ?? config.draft?.entryDate ?? '',
            autoNumber: source.autoNumber ?? config.draft?.autoNumber ?? true,
            numberingType: source.numberingType ?? config.draft?.numberingType ?? '',
            documentNumber: source.documentNumber ?? config.draft?.documentNumber ?? '',
            checkNumber: source.checkNumber ?? config.draft?.checkNumber ?? '',
            recipient: source.recipient ?? config.draft?.recipient ?? '',
            voided: source.voided ?? config.draft?.voided ?? false,
            branches: [...(source.branches ?? config.draft?.branches ?? [])],
            notes: source.notes ?? config.draft?.notes ?? '',
            lineLookup: source.lineLookup ?? '',
            saveTone: source.saveTone ?? config.draft?.saveTone ?? 'primary',
            kapNumber: source.kapNumber ?? config.draft?.kapNumber ?? '',
            kjsNumber: source.kjsNumber ?? config.draft?.kjsNumber ?? '',
            ntpn: source.ntpn ?? config.draft?.ntpn ?? '',
            reconcileStatus: source.reconcileStatus ?? config.draft?.reconcileStatus ?? '',
            printStatus: source.printStatus ?? config.draft?.printStatus ?? '',
        },
        [...(source.lineItems ?? config.draft?.lineItems ?? [])],
    );
}

export function buildGeneratedCashPaymentNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `CP.${year}.${month}.${day}.${time}`;
}

export function buildCashPaymentPayload(values) {
    const lineItems = (values.lineItems ?? []).map((item, index) => ({
        id: item.__lineId ?? undefined,
        account_id: item.__accountId ?? null,
        description: item.accountName?.trim() || null,
        reference_code: item.accountCode?.trim() || null,
        total_amount: parseNumericInput(item.amount),
        sort_order: index,
    }));
    const totalAmount = buildPaymentTotalAmount(values.lineItems ?? []);

    return {
        branch_id: values.__branchId ?? null,
        primary_account_id: values.__primaryAccountId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedCashPaymentNumber(),
        numbering_type: values.numberingType?.trim() || null,
        payment_method: values.bankAccounts?.[0] ?? values.numberingType?.trim() ?? null,
        status: values.voided ? 'Void' : 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        notes: values.notes?.trim() || null,
        paid_amount: totalAmount,
        total_amount: totalAmount,
        flags: {
            voided: Boolean(values.voided),
        },
        metadata: {
            cash_bank_label: values.bankAccounts?.[0] ?? null,
            branch_label: values.branches?.[0] ?? null,
            check_number: values.checkNumber?.trim() || null,
            recipient: values.recipient?.trim() || null,
            kap_number: values.kapNumber?.trim() || null,
            kjs_number: values.kjsNumber?.trim() || null,
            ntpn: values.ntpn?.trim() || null,
            reconcile_status: values.reconcileStatus?.trim() || null,
            print_status: values.printStatus?.trim() || null,
        },
        lines: lineItems.filter(
            (item) => item.account_id || item.description || item.reference_code || item.total_amount > 0,
        ),
    };
}

export function validateCashPaymentValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.cashBank, value: values.bankAccounts, type: 'array' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.branch, value: values.branches, type: 'array' },
        { label: config.lineSectionTitle, value: values.lineItems, type: 'array' },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    const invalidLine = (values.lineItems ?? []).find(
        (item) =>
            !String(item.accountName ?? item.accountCode ?? '').trim()
            || parseNumericInput(item.amount) <= 0,
    );

    if (invalidLine) {
        return 'Setiap rincian pembayaran wajib memiliki akun dan nilai lebih dari 0.';
    }

    return '';
}

export function promptCashPaymentLineItem(record, currentItem = null) {
    const label = buildLookupLabel(record ?? currentItem ?? {});
    const amountValue = window.prompt(`Nilai pembayaran untuk ${label}`, currentItem?.amount ?? '0');

    if (amountValue === null) {
        return null;
    }

    const amount = parseNumericInput(amountValue);

    if (amount <= 0) {
        throw new Error('Nilai pembayaran harus lebih dari 0.');
    }

    return {
        id: currentItem?.id ?? `draft-line-${Date.now()}`,
        __lineId: currentItem?.__lineId ?? null,
        __accountId: record?.id ?? currentItem?.__accountId ?? null,
        accountCode: record?.code ?? currentItem?.accountCode ?? '',
        accountName: record?.name ?? currentItem?.accountName ?? '',
        amount: formatCurrencyValue(amount),
    };
}
