import { parseNumericInput } from '@/features/workspace/backend/operationDocumentBackend';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';

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

export function formatCurrencyLabel(value) {
    const numericValue = Number(value ?? 0);
    if (numericValue < 0) {
        return `-Rp ${formatCurrencyValue(Math.abs(numericValue))}`;
    }
    return `Rp ${formatCurrencyValue(numericValue)}`;
}

export function buildLookupLabel(record, codeKey = 'code') {
    const code = String(record?.[codeKey] ?? '').trim();
    const name = String(record?.name ?? record?.title ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

export function applyComputedTotals(currentValues, nextItems) {
    const subtotalAmount = nextItems.reduce((sum, item) => sum + parseNumericInput(item.total), 0);
    const subtotalCosts = (currentValues.additionalCosts ?? []).reduce((sum, cost) => sum + parseNumericInput(cost.amount), 0);
    const discountAmount = currentValues.isDiscountOverridden
        ? parseNumericInput(currentValues.discountValue)
        : nextItems.reduce((sum, item) => sum + parseNumericInput(item.discountValue ?? item.discount), 0);
    const taxAmount = currentValues.taxEnabled ? Math.max(0, (subtotalAmount - discountAmount) * 0.1) : 0;
    const totalAmount = subtotalAmount - discountAmount + taxAmount + subtotalCosts;
    const nextSummary = Array.isArray(currentValues.summary)
        ? currentValues.summary.map(([label, value], index) => {
              if (index === 0 || String(label).toLowerCase() === 'total') {
                  return [label, formatCurrencyLabel(totalAmount)];
              }

              return [label, value];
          })
        : currentValues.summary;

    return {
        ...currentValues,
        items: nextItems,
        itemCountLabel: nextItems.length ? `${nextItems.length} ${currentValues.pageId ? 'Barang' : 'Rincian Barang'}` : 'Rincian Barang',
        subtotal: formatCurrencyLabel(subtotalAmount),
        discountValue: formatCurrencyValue(discountAmount),
        taxLabel: currentValues.taxEnabled ? currentValues.taxLabel || 'Pajak' : '',
        taxValue: currentValues.taxEnabled ? formatCurrencyLabel(taxAmount) : '',
        total: formatCurrencyLabel(totalAmount),
        summary: nextSummary,
    };
}

export function buildDocumentComparableSnapshot(values) {
    return {
        customer: values.customer,
        partnerId: values.__partnerId,
        entryDate: values.entryDate,
        documentNumber: values.documentNumber,
        autoNumber: values.autoNumber,
        numberingType: values.numberingType,
        paymentTerms: values.paymentTerms,
        paymentTermId: values.__paymentTermId,
        shippingDate: values.shippingDate,
        purchaseOrderNumber: values.purchaseOrderNumber,
        address: values.address,
        branches: values.branches,
        branchId: values.__branchId,
        notes: values.notes,
        shippingMethod: values.shippingMethod,
        shippingMethodId: values.__shippingMethodId,
        fob: values.fob,
        fobId: values.__fobId,
        taxEnabled: values.taxEnabled,
        taxIncluded: values.taxIncluded,
        discountValue: values.discountValue,
        isDiscountOverridden: values.isDiscountOverridden,
        relatedDocumentId: values.__relatedDocumentId,
        returnSource: values.returnSource,
        returnSourceReferences: values.returnSourceReferences,
        items: (values.items ?? []).map((item) => ({
            name: item.name,
            code: item.code,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            discountValue: item.discountValue ?? item.discount,
            total: item.total,
        })),
    };
}

export function validateSalesDocumentValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.customer, value: values.__partnerId, type: 'lookup' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: 'Rincian barang', value: values.items, type: 'array' },
        ...(config.headerTextField?.required ? [{ label: config.headerTextField.label, value: values[config.headerTextField.valueKey] }] : []),
        ...(config.headerSelectLookupField?.required && values[config.headerSelectLookupField.selectValueKey] !== 'Tanpa Faktur' ? [{ label: config.headerSelectLookupField.label, value: values.__relatedDocumentId, type: 'lookup' }] : []),
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    const invalidItem = (values.items ?? []).find(
        (item) =>
            !String(item?.name ?? '').trim()
            || Number.parseFloat(String(item?.quantity ?? '0').replace(',', '.')) <= 0
            || !String(item?.unit ?? '').trim(),
    );

    if (invalidItem) {
        return 'Setiap item wajib memiliki nama, kuantitas lebih dari 0, dan satuan.';
    }

    return '';
}

export function validateSalesDocumentFields(values, config) {
    const fieldErrors = {};

    if (!values.__partnerId) {
        fieldErrors.customer = `${config.labels.customer} wajib diisi.`;
    }
    if (!values.entryDate) {
        fieldErrors.entryDate = `${config.labels.entryDate} wajib diisi.`;
    }
    if (values.autoNumber) {
        if (!values.numberingType) {
            fieldErrors.numberingType = 'Tipe penomoran wajib dipilih.';
        }
    } else {
        if (!values.documentNumber) {
            fieldErrors.documentNumber = `${config.labels.documentNumber} wajib diisi.`;
        }
    }
    if (config.headerTextField?.required && !values[config.headerTextField.valueKey]) {
        fieldErrors[config.headerTextField.valueKey] = `${config.headerTextField.label} wajib diisi.`;
    }
    if (config.headerSelectLookupField?.required && values[config.headerSelectLookupField.selectValueKey] !== 'Tanpa Faktur' && !values.__relatedDocumentId) {
        fieldErrors[config.headerSelectLookupField.valueKey] = `${config.headerSelectLookupField.label} wajib diisi.`;
    }

    return fieldErrors;
}

import { showPromptModal } from '@/components/ui/promptModal';

export async function promptItemEditor(item = null) {
    const result = await showPromptModal(item ? 'Edit Rincian Barang' : 'Tambah Rincian Barang', [
        {
            name: 'name',
            label: 'Nama Barang',
            type: 'text',
            defaultValue: item?.name ?? '',
            required: true,
        },
        {
            name: 'code',
            label: 'Kode Barang',
            type: 'text',
            defaultValue: item?.code ?? '',
        },
        {
            name: 'quantity',
            label: 'Kuantitas',
            type: 'number',
            defaultValue: item?.quantity ?? '1',
            required: true,
        },
        {
            name: 'unit',
            label: 'Satuan',
            type: 'text',
            defaultValue: item?.unit ?? 'PCS',
            required: true,
        },
        {
            name: 'price',
            label: 'Harga Satuan',
            type: 'number',
            defaultValue: item?.price ?? '0',
            required: true,
        },
        {
            name: 'discountValue',
            label: 'Diskon Nominal',
            type: 'number',
            defaultValue: item?.discountValue ?? item?.discount ?? '0',
            required: true,
        },
    ]);

    if (!result) {
        return null;
    }

    const trimmedName = result.name.trim();
    if (!trimmedName) {
        throw new Error('Nama barang wajib diisi.');
    }

    const code = result.code ?? '';
    const quantity = result.quantity ?? '1';
    const unit = result.unit ?? 'PCS';
    const price = result.price ?? '0';
    const discountValue = result.discountValue ?? '0';

    const quantityAmount = parseNumericInput(quantity);
    const unitPriceAmount = parseNumericInput(price);
    const discountAmount = parseNumericInput(discountValue);
    const totalAmount = Math.max(0, quantityAmount * unitPriceAmount - discountAmount);

    return {
        id: item?.id ?? `draft-item-${Date.now()}`,
        __lineId: item?.__lineId ?? null,
        name: trimmedName,
        code: code.trim(),
        quantity: String(quantityAmount || 0),
        unit: unit.trim() || 'PCS',
        price: formatCurrencyValue(unitPriceAmount),
        discount: formatCurrencyValue(discountAmount),
        discountValue: formatCurrencyValue(discountAmount),
        total: formatCurrencyValue(totalAmount),
    };
}

export async function applyPromptItemUpdate(item, updateItems, setStatus) {
    try {
        const nextItem = await promptItemEditor(item);

        if (!nextItem) {
            return;
        }

        updateItems((items) =>
            item ? items.map((entry) => (entry.id === item.id ? nextItem : entry)) : [...items, nextItem],
        );
        showSuccessToast({
            message: item ? 'Item diperbarui.' : 'Item ditambahkan ke dokumen.',
        });
    } catch (error) {
        showErrorToast({ message: error.message });
    }
}

export function resolveSalesDocumentDirty(values, initialSnapshot) {
    return !areComparableValuesEqual(buildDocumentComparableSnapshot(values), initialSnapshot);
}

export async function promptCostEditor(cost = null) {
    const result = await showPromptModal(cost ? 'Edit Biaya Lainnya' : 'Tambah Biaya Lainnya', [
        {
            name: 'name',
            label: 'Nama Biaya',
            type: 'text',
            defaultValue: cost?.name ?? '',
            required: true,
            disabled: true,
        },
        {
            name: 'code',
            label: 'Kode Akun',
            type: 'text',
            defaultValue: cost?.code ?? '',
            disabled: true,
        },
        {
            name: 'amount',
            label: 'Jumlah',
            type: 'number',
            defaultValue: cost?.amount ?? '0',
            required: true,
        },
    ]);

    if (!result) {
        return null;
    }

    const amountValue = parseNumericInput(result.amount);

    return {
        ...cost,
        amount: formatCurrencyValue(amountValue),
    };
}

