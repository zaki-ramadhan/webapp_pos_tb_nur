import { parseNumericInput } from '@/features/workspace/backend/operationDocumentBackend';
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
    return `Rp ${formatCurrencyValue(value)}`;
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
    const discountAmount = nextItems.reduce((sum, item) => sum + parseNumericInput(item.discountValue ?? item.discount), 0);
    const taxAmount = currentValues.taxEnabled ? Math.max(0, (subtotalAmount - discountAmount) * 0.1) : 0;
    const totalAmount = Math.max(0, subtotalAmount - discountAmount + taxAmount);
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
        poNumber: values.poNumber,
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
        { label: config.labels.branch, value: values.__branchId, type: 'lookup' },
        { label: 'Rincian barang', value: values.items, type: 'array' },
        ...(config.headerTextField?.required ? [{ label: config.headerTextField.label, value: values[config.headerTextField.valueKey] }] : []),
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

export function promptItemEditor(item = null) {
    const name = window.prompt('Nama barang', item?.name ?? '');

    if (name === null) {
        return null;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new Error('Nama barang wajib diisi.');
    }

    const code = window.prompt('Kode barang', item?.code ?? '') ?? '';
    const quantity = window.prompt('Kuantitas', item?.quantity ?? '1');

    if (quantity === null) {
        return null;
    }

    const unit = window.prompt('Satuan', item?.unit ?? 'PCS');

    if (unit === null) {
        return null;
    }

    const price = window.prompt('Harga satuan', item?.price ?? '0');

    if (price === null) {
        return null;
    }

    const discountValue = window.prompt('Diskon nominal', item?.discountValue ?? item?.discount ?? '0');

    if (discountValue === null) {
        return null;
    }

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

export function applyPromptItemUpdate(item, updateItems, setStatus) {
    try {
        const nextItem = promptItemEditor(item);

        if (!nextItem) {
            return;
        }

        updateItems((items) =>
            item ? items.map((entry) => (entry.id === item.id ? nextItem : entry)) : [...items, nextItem],
        );
        setStatus({
            tone: 'success',
            message: item ? 'Item diperbarui.' : 'Item ditambahkan ke dokumen.',
        });
    } catch (error) {
        setStatus({ tone: 'error', message: error.message });
    }
}

export function resolveSalesDocumentDirty(values, initialSnapshot) {
    return !areComparableValuesEqual(buildDocumentComparableSnapshot(values), initialSnapshot);
}
