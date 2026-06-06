import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export function validateMaterialAdditionValues(values, config) {
    const requiredChecks = [
        { label: config.labels.date, value: values.date },
        { label: config.labels.workOrderNumber, value: values.workOrderNumber },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.branch, value: values.branches, type: 'array' },
        { label: config.itemSectionTitle, value: values.items, type: 'array' },
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

    const invalidItem = (values.items ?? []).find(
        (item) => !String(item.name ?? item.code ?? '').trim() || parseNumericInput(item.quantity) <= 0,
    );

    if (invalidItem) {
        return 'Setiap rincian barang wajib memiliki item dan kuantitas lebih dari 0.';
    }

    const invalidCharge = (values.additionalCosts ?? []).find(
        (charge) => (charge.name || charge.code || charge.amount) && parseNumericInput(charge.amount) <= 0,
    );

    if (invalidCharge) {
        return 'Nilai biaya lainnya harus lebih dari 0.';
    }

    return '';
}
