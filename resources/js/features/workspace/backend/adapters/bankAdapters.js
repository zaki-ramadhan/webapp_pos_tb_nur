import { normalizeDisplayDate, formatIsoDate } from './dateHelpers';

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

export function openSourceDocument(row) {
    if (!row) return;

    const documentId = row.document_id || row.id;
    const documentType = row.document_type || row.documentType;

    if (!documentId || !documentType) return;

    const docTypeToPageId = {
        general_journal: 'general-journal',
        bank_transfer: 'bank-transfer',
        cash_receipt: 'cash-receipt',
        sales_receipt: 'sales-receipt',
        cash_payment: 'cash-payment',
        purchase_payment: 'purchase-payment',
        expense_entry: 'expense-entry',
        payroll_entry: 'payroll-entry',
        sales_invoice: 'sales-invoice',
        purchase_invoice: 'purchase-invoice',
        sales_deposit: 'sales-deposit',
        sales_order: 'sales-order',
        purchase_order: 'purchase-order',
        item_request: 'item-request',
        inventory_adjustment: 'inventory-adjustment',
        stock_opname: 'stock-opname',
    };

    const pageId = docTypeToPageId[documentType] || String(documentType).replace(/_/g, '-');
    const targetRecordId = String(documentId);
    const label = row.sourceNumber || row.documentNumber || row.document_number || `Dokumen ${targetRecordId}`;

    window.dispatchEvent(
        new CustomEvent('workspace:open-page', {
            detail: {
                pageId,
                recordId: targetRecordId,
                label,
                tabLabel: label,
            },
        }),
    );
}

export function mapBankRows(pageId, records) {
    return records.map((record, index) => {
        const base = {
            id: record.id,
            document_id: record.document_id ?? record.id ?? null,
            document_type: record.document_type ?? null,
            document_number: record.document_number ?? record.source_number ?? '',
        };

        if (pageId === 'bank-history') {
            return {
                ...base,
                date: formatIsoDate(record.date),
                sourceNumber: record.source_number ?? record.document_number ?? '',
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
                ...base,
                date: formatIsoDate(record.date),
                documentNumber: record.document_number ?? record.source_number ?? '',
                transactionType: record.transaction_type ?? '',
                description: record.description ?? '',
                debit: record.debit ?? '',
                credit: record.credit ?? '',
                status: record.status ?? '',
                balance: record.balance ?? '',
            };
        }

        return {
            ...base,
            date: record.date ?? '',
            description: record.description ?? '',
            mutation: record.mutation ?? '',
            type: record.type ?? '',
            balance: record.balance ?? '',
            index: index + 1,
        };
    });
}
