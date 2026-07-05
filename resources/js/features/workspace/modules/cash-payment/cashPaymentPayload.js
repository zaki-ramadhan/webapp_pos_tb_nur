import { normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import {
    buildLookupLabel,
    formatCurrencyValue,
    parseNumericInput,
} from '@/features/workspace/shared/transactionFormatters';
import { buildGeneratedDocNumber } from '@/features/workspace/shared/documentNumberUtils';
import { buildPaymentTotalAmount } from './cashPaymentCalculations';

export function buildGeneratedCashPaymentNumber() {
    return buildGeneratedDocNumber('CP');
}

export function buildCashPaymentPayload(values) {
    const lineItems = (values.lineItems ?? []).map((item, index) => ({
        id: item.__lineId ?? undefined,
        account_id: item.__accountId ?? null,
        description: item.accountName?.trim() || null,
        reference_code: item.accountCode?.trim() || null,
        total_amount: parseNumericInput(item.amount),
        sort_order: index,
        attributes: {
            notes: item.notes?.trim() || null,
            deferred: Boolean(item.deferred),
            deferred_account_id: item.deferredAccountId ?? null,
            deferred_account_label: item.deferredAccountLabel?.trim() || null,
            deferred_duration: parseInt(item.deferredDuration, 10) || 0,
            deferred_start_type: item.deferredStartType || 'period',
            deferred_start_month: item.deferredStartMonth ?? 6,
            deferred_start_year: item.deferredStartYear ?? 2026,
        },
    }));
    const totalAmount = buildPaymentTotalAmount(values.lineItems ?? []);

    return {
        branch_id: values.__branchId ?? 1,
        primary_account_id: values.__primaryAccountId ?? null,
        related_document_id: values.__relatedDocumentId ?? null,
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

import { showPromptModal } from '@/components/ui/promptModal';

export async function promptCashPaymentLineItem(record, currentItem = null) {
    const label = buildLookupLabel(record ?? currentItem ?? {});
    const result = await showPromptModal(`Input Nilai Pembayaran - ${label}`, [
        {
            name: 'amount',
            label: 'Nilai Pembayaran',
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
