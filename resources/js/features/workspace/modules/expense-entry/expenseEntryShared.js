import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { validateRequiredChecks } from '@/features/workspace/shared/formValidation';

export function formatCurrencyValue(value) {
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
    const code = String(record?.[codeKey] ?? record?.account ?? '').trim();
    const name = String(record?.name ?? record?.accountName ?? record?.title ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

function buildExpenseTotal(lineItems = []) {
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

export function applyExpenseLineItems(values, lineItems) {
    const totalAmount = buildExpenseTotal(lineItems);

    return {
        ...values,
        lineItems,
        totalValue: formatCurrencyLabel(totalAmount),
    };
}

export function buildExpenseEntryFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'date') {
            return {
                ...filter,
                rowKey: 'dateFilter',
                options: buildFilterOptions('Tanggal', rows, 'dateFilter'),
            };
        }

        if (filter.id === 'status') {
            return {
                ...filter,
                rowKey: 'statusFilter',
                options: buildFilterOptions('Status', rows, 'statusFilter', 'status'),
            };
        }

        return filter;
    });
}

export function buildExpenseEntryRow(record) {
    const totalAmount = Number(record?.total_amount ?? 0);
    const paidAmount = Number(record?.paid_amount ?? 0);
    const entryDate = formatIsoDate(record?.entry_date);
    const dueDate = formatIsoDate(record?.due_date);

    return {
        id: String(record?.id ?? ''),
        __backendRecord: record,
        documentNumber: record?.document_number ?? '',
        entryDate,
        dueDate,
        total: formatCurrencyValue(totalAmount),
        paid: formatCurrencyValue(paidAmount),
        status: record?.status ?? 'Sedang diproses',
        note: record?.notes ?? '',
        dateFilter: entryDate,
        statusFilter: record?.status ?? 'Sedang diproses',
    };
}

export function buildExpenseEntryRecord(record = {}, config) {
    const lineItems = (record.lines ?? []).map((line, index) => ({
        id: String(line.id ?? `line-${index + 1}`),
        __lineId: line.id ?? null,
        __accountId: line.account_id ?? null,
        account: line.account?.code ?? line.reference_code ?? '',
        accountName: line.account?.name ?? line.description ?? line.reference_code ?? `Baris ${index + 1}`,
        amount: formatCurrencyValue(line.total_amount ?? 0),
        notes: line.attributes?.notes ?? '',
    }));
    const totalAmount = Number(record.total_amount ?? 0);
    const paidAmount = Number(record.paid_amount ?? 0);
    const primaryAccountLabel = buildLookupLabel(record.primary_account ?? {}, 'code');

    return applyExpenseLineItems(
        {
            __backendRecordId: record.id ?? null,
            __liabilityAccountId: record.primary_account_id ?? null,
            __branchId: null,
            liabilityAccounts: primaryAccountLabel ? [primaryAccountLabel] : [],
            entryDate: formatIsoDate(record.entry_date),
            autoNumber: false,
            numberingType: record.numbering_type ?? config.draft?.numberingType ?? 'Pencatatan Beban',
            documentNumber: record.document_number ?? '',
            dueDate: formatIsoDate(record.due_date),
            branches: [],
            notes: record.notes ?? '',
            lineLookup: '',
            paidAmount: formatCurrencyLabel(paidAmount),
            status: record.status ?? 'Sedang diproses',
            saveTone: 'muted',
        },
        lineItems,
    );
}

export function buildFormState(source = {}) {
    return applyExpenseLineItems(
        {
            __backendRecordId: source.__backendRecordId ?? null,
            __liabilityAccountId: source.__liabilityAccountId ?? null,
            __branchId: null,
            liabilityAccounts: [...(source.liabilityAccounts ?? [])],
            entryDate: source.entryDate ?? '',
            autoNumber: source.autoNumber ?? true,
            numberingType: source.numberingType ?? '',
            documentNumber: source.documentNumber ?? '',
            dueDate: source.dueDate ?? '',
            branches: [],
            notes: source.notes ?? '',
            lineLookup: source.lineLookup ?? '',
            paidAmount: source.paidAmount ?? 'Rp 0',
            status: source.status ?? '-',
            saveTone: source.saveTone ?? 'primary',
        },
        [...(source.lineItems ?? [])],
    );
}

export function buildGeneratedExpenseEntryNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `EXP.${year}.${month}.${day}.${time}`;
}

export function buildExpenseEntryPayload(values) {
    const lineItems = (values.lineItems ?? []).map((item, index) => ({
        id: item.__lineId ?? undefined,
        account_id: item.__accountId ?? null,
        description: item.accountName?.trim() || null,
        reference_code: item.account?.trim() || null,
        total_amount: parseNumericInput(item.amount),
        sort_order: index,
        attributes: {
            notes: item.notes?.trim() || null,
        },
    }));
    const totalAmount = buildExpenseTotal(values.lineItems ?? []);
    const paidAmount = parseNumericInput(values.paidAmount);

    return {
        branch_id: null,
        primary_account_id: values.__liabilityAccountId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedExpenseEntryNumber(),
        numbering_type: values.numberingType?.trim() || null,
        status: values.status?.trim() || 'Sedang diproses',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        due_date: normalizeDisplayDate(values.dueDate) || null,
        notes: values.notes?.trim() || null,
        paid_amount: paidAmount,
        total_amount: totalAmount,
        metadata: {
            liability_account_label: values.liabilityAccounts?.[0] ?? null,
            branch_label: null,
        },
        lines: lineItems.filter(
            (item) => item.account_id || item.description || item.reference_code || item.total_amount > 0,
        ),
    };
}

export function validateExpenseEntryValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.liabilityAccount, value: values.liabilityAccounts, type: 'array' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.dueDate, value: values.dueDate },
        { label: config.lineSectionTitle, value: values.lineItems, type: 'array' },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    const invalidLine = (values.lineItems ?? []).find(
        (item) =>
            !String(item.accountName ?? item.account ?? '').trim()
            || parseNumericInput(item.amount) <= 0,
    );

    if (invalidLine) {
        return 'Setiap rincian beban wajib memiliki akun dan nilai lebih dari 0.';
    }

    return '';
}


