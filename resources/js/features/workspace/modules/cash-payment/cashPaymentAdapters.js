import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import {
    buildFilterOptions,
    buildLookupLabel,
    formatCurrencyValue,
} from '@/features/workspace/shared/transactionFormatters';
import {
    applyCashPaymentLineItems,
    formatCurrencyLabel,
} from './cashPaymentCalculations';

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
        __branchId: branch === 'SURABAYA' ? 2 : (branch === 'JAKARTA' ? 1 : (config.draft?.__branchId ?? 1)),
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
            __primaryAccountId: source.__primaryAccountId ?? config.draft?.__primaryAccountId ?? null,
            __branchId: source.__branchId ?? config.draft?.__branchId ?? null,
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
