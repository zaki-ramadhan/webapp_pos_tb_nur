import { normalizeDisplayDate } from './dateHelpers';

export const BACKEND_BANK_RESOURCES = {
    'bank-statement': 'bank-statements',
    'bank-history': 'bank-histories',
    'bank-reconciliation': 'bank-reconciliations',
};

export function buildBankFilters(values) {
    return {
        search: values.keyword?.trim() ?? '',
        start_date: normalizeDisplayDate(values.startDate),
        end_date: normalizeDisplayDate(values.endDate),
        per_page: 100,
    };
}

export function mapBankRows(pageId, records) {
    return records.map((record, index) => {
        if (pageId === 'bank-history') {
            return {
                id: record.id,
                date: record.date ?? '',
                sourceNumber: record.source_number ?? '',
                checkNumber: record.check_number ?? '',
                transactionType: record.transaction_type ?? '',
                description: record.description ?? '',
                mutation: record.mutation ?? '',
                type: record.type ?? '',
                debit: record.debit ?? '',
                credit: record.credit ?? '',
                balance: record.balance ?? '',
                index: record.index ?? index + 1,
            };
        }

        if (pageId === 'bank-reconciliation') {
            return {
                id: record.id,
                date: record.date ?? '',
                documentNumber: record.document_number ?? '',
                transactionType: record.transaction_type ?? '',
                description: record.description ?? '',
                debit: record.debit ?? '',
                credit: record.credit ?? '',
                status: record.status ?? '',
                balance: record.balance ?? '',
            };
        }

        return {
            id: record.id,
            date: record.date ?? '',
            description: record.description ?? '',
            mutation: record.mutation ?? '',
            type: record.type ?? '',
            balance: record.balance ?? '',
            index: index + 1,
        };
    });
}
