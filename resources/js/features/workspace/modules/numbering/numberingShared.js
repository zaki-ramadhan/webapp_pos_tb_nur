export function buildDefaultValues(form) {
    return {
        name: form.defaults?.name ?? '',
        transactionType: form.defaults?.transactionType ?? form.transactionTypeOptions?.[0]?.value ?? '',
        numberingType: form.defaults?.numberingType ?? form.numberingTypeOptions?.[0]?.value ?? '',
        counterDigits: String(form.defaults?.counterDigits ?? 5),
        componentPicker: form.defaults?.componentPicker ?? form.componentOptions?.[0]?.value ?? '',
        selectedComponents: form.defaults?.selectedComponents ?? [],
        userScopeAll: Boolean(form.userAccess?.allUsersChecked),
    };
}

export function findLabelByValue(options = [], value) {
    return options.find((option) => option.value === value)?.label ?? value;
}

export function findCodeByValue(options = [], value) {
    return options.find((option) => option.value === value)?.code ?? '';
}

export function buildNumberingPreview(form, values) {
    if (!values.name.trim()) {
        return '-';
    }

    const digits = Number(values.counterDigits) || 0;
    const counter = String(1).padStart(Math.max(1, digits), '0');
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const transactionCode = findCodeByValue(form.transactionTypeOptions, values.transactionType);
    const components = values.selectedComponents.length
        ? values.selectedComponents
        : values.componentPicker
          ? [values.componentPicker]
          : [];

    const componentValues = components.map((componentId) => {
        switch (componentId) {
            case 'year':
                return year;
            case 'month':
                return month;
            case 'transaction-code':
                return transactionCode;
            default:
                return findLabelByValue(form.componentOptions, componentId);
        }
    });

    const separator = values.numberingType === 'fixed' ? '-' : '/';
    const leftParts = [transactionCode, ...componentValues].filter(Boolean);

    return [...leftParts, counter].join(separator);
}
