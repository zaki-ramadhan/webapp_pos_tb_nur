import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import {
    formatCurrencyValue,
    buildLookupLabel,
    buildFilterOptions,
    parseNumericInput,
} from '@/features/workspace/shared/transactionFormatters';
import { buildCurrencyValue } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

function buildCashReceiptTotal(lineItems = []) {
    return lineItems.reduce((sum, item) => sum + parseNumericInput(item.amount), 0);
}

export function applyCashReceiptLineItems(values, lineItems) {
    const totalAmount = buildCashReceiptTotal(lineItems);

    return {
        ...values,
        lineItems,
        totalValue: `Rp ${formatCurrencyValue(totalAmount)}`,
    };
}

export function buildCashReceiptFilters(baseFilters = [], rows = []) {
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

export function buildCashReceiptRow(record) {
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
        payer: record?.metadata?.payer ?? '',
    };
}

export function buildCashReceiptRecord(record = {}, config) {
    const lineItems = (record.lines ?? []).map((line, index) => ({
        id: String(line.id ?? `line-${index + 1}`),
        __lineId: line.id ?? null,
        __accountId: line.account_id ?? null,
        accountCode: line.account?.code ?? line.reference_code ?? '',
        accountName: line.account?.name ?? line.description ?? line.reference_code ?? `Baris ${index + 1}`,
        amount: formatCurrencyValue(line.total_amount ?? 0),
    }));
    const primaryAccountLabel = buildLookupLabel(record.primaryAccount ?? {}, 'code');
    const bankLabel = record.metadata?.cash_bank_label ?? primaryAccountLabel;

    return applyCashReceiptLineItems(
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
            payer: record.metadata?.payer ?? '',
            voided: Boolean(record.flags?.voided),
            branches: record.branch?.name ? [record.branch.name] : (record.metadata?.branch_label ? [record.metadata.branch_label] : []),
            notes: record.notes ?? '',
            lineLookup: '',
            saveTone: 'muted',
            reconcileStatus: record.metadata?.reconcile_status ?? '',
            reconcileDate: record.metadata?.reconcile_date ?? '',
            printStatus: record.metadata?.print_status ?? '',
        },
        lineItems,
    );
}

export function buildCashReceiptDetailRecordFromRow(row = {}, config) {
    if (row.__backendRecord) {
        return buildCashReceiptRecord(row.__backendRecord, config);
    }

    const amount = row.amount ?? '0';

    return {
        bankAccounts: row.cashBankFull ? [row.cashBankFull] : [],
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? '',
        documentNumber: row.number ?? '',
        checkNumber: row.checkNumber ?? '',
        payer: row.payer ?? '',
        voided: row.voided ?? false,
        __primaryAccountId: null,
        __branchId: null,
        branches: row.branch ? [row.branch] : ['JAKARTA'],
        notes: row.description ?? '',
        lineLookup: '',
        lineItems: row.lineItems ?? [
            {
                id: `${row.id}-line-1`,
                __lineId: null,
                __accountId: null,
                accountCode: row.accountCode ?? '811.000-01',
                accountName: row.accountName ?? row.description ?? '',
                amount,
            },
        ],
        totalValue: buildCurrencyValue(amount),
        saveTone: 'muted',
        reconcileStatus: row.reconcileStatus ?? 'Ya',
        reconcileDate: row.reconcileDate ?? '(11/02/2017)',
        printStatus: row.printStatus ?? 'Belum cetak/email',
    };
}

export function buildCashReceiptFormState(source = {}, config) {
    return applyCashReceiptLineItems(
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
            payer: source.payer ?? config.draft?.payer ?? '',
            voided: source.voided ?? config.draft?.voided ?? false,
            branches: [...(source.branches ?? config.draft?.branches ?? [])],
            notes: source.notes ?? config.draft?.notes ?? '',
            lineLookup: source.lineLookup ?? '',
            saveTone: source.saveTone ?? config.draft?.saveTone ?? 'primary',
            reconcileStatus: source.reconcileStatus ?? config.draft?.reconcileStatus ?? '',
            reconcileDate: source.reconcileDate ?? config.draft?.reconcileDate ?? '',
            printStatus: source.printStatus ?? config.draft?.printStatus ?? '',
        },
        [...(source.lineItems ?? config.draft?.lineItems ?? [])],
    );
}

import { showPromptModal } from '@/components/ui/promptModal';

export async function promptCashReceiptLineItem(record, currentItem = null) {
    const label = buildLookupLabel(record ?? currentItem ?? {});
    const result = await showPromptModal(`Input Nilai Penerimaan - ${label}`, [
        {
            name: 'amount',
            label: 'Nilai Penerimaan',
            type: 'number',
            defaultValue: currentItem?.amount ?? '0',
            required: true,
        },
    ], Boolean(currentItem));

    if (!result) {
        return null;
    }

    if (result.__action === 'delete') {
        return { action: 'delete' };
    }

    const amount = parseNumericInput(result.amount);

    if (amount <= 0) {
        throw new Error('Nilai penerimaan harus lebih dari 0.');
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
