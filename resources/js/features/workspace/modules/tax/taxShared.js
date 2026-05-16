import { buildAccountLookupLabel } from '@/features/workspace/shared/AccountLookupControls';

export const TAX_TYPE_LABELS = {
    vat: 'Pajak Pertambahan Nilai',
    pph23: 'Pajak Penghasilan Ps.23',
    pph21: 'Pajak Penghasilan Ps.21',
};

export function mapTaxRow(record) {
    return {
        ...record,
        id: String(record.id),
        tabLabel: record.name ?? String(record.id),
        typeValue: record.tax_type ?? '',
        typeLabel: TAX_TYPE_LABELS[record.tax_type] ?? record.tax_type ?? '-',
        description: record.name ?? '',
        percentage: String(record.rate ?? ''),
        salesAccount: record.output_account ? buildAccountLookupLabel(record.output_account) : '',
        purchaseAccount: record.input_account ? buildAccountLookupLabel(record.input_account) : '',
    };
}

export function buildFormValues(defaults = {}) {
    return {
        type: defaults.type ?? '',
        description: defaults.description ?? '',
        percentage: defaults.percentage ?? '',
        salesAccount: defaults.salesAccount ?? '',
        salesAccountId: defaults.salesAccountId ?? null,
        purchaseAccount: defaults.purchaseAccount ?? '',
        purchaseAccountId: defaults.purchaseAccountId ?? null,
        __backendRecordId: defaults.__backendRecordId ?? null,
    };
}
