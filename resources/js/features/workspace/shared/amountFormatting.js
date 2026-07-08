export function sanitizeAmountInput(value, { allowDecimal = true, allowNegative = false, isInput = false } = {}) {
    let strValue = String(value ?? '').trim();

    // Strip empty decimal suffixes (,00, ,0) so they are not shown to lay users
    if (!isInput) {
        strValue = strValue.replace(/,00?$/, '');
    }

    // Convert database standard decimal string (e.g. 125000.50) to Indonesian standard (125000,50)
    // Only convert if the dot is a true database decimal dot (not an Indonesian thousand separator)
    if (!isInput && /^-?\d+\.\d+$/.test(strValue)) {
        const parts = strValue.split('.');
        if (parts.length === 2) {
            const [integerPart, fractionPart] = parts;
            const cleanInteger = integerPart.replace(/^-/, '');
            if (fractionPart.length < 3 || cleanInteger.length > 3) {
                strValue = strValue.replace('.', ',');
                // Strip empty decimal suffixes that were converted from database decimals
                strValue = strValue.replace(/,00?$/, '');
            }
        }
    }

    let normalizedValue = strValue
        .replace(/Rp/gi, '')
        .replace(/\s+/g, '')
        .replace(/\./g, '')
        .replace(/[^\d,-]/g, '');

    let negativePrefix = '';

    if (allowNegative && normalizedValue.startsWith('-')) {
        negativePrefix = '-';
    }

    normalizedValue = normalizedValue.replace(/-/g, '');

    if (!allowDecimal) {
        const integerOnly = normalizedValue.replace(/,/g, '').replace(/\D/g, '').slice(0, 15);
        return integerOnly ? `${negativePrefix}${integerOnly}` : negativePrefix;
    }

    const [rawIntegerPart = '', ...rawFractionParts] = normalizedValue.split(',');
    const integerPart = rawIntegerPart.replace(/\D/g, '').slice(0, 15);
    const fractionPart = rawFractionParts.join('').replace(/\D/g, '').slice(0, 6);

    if (!integerPart && !fractionPart) {
        return negativePrefix;
    }

    if (!integerPart && fractionPart) {
        return `${negativePrefix}0,${fractionPart}`;
    }

    return fractionPart ? `${negativePrefix}${integerPart},${fractionPart}` : `${negativePrefix}${integerPart}`;
}

export function formatAmountInput(value, options = {}) {
    const sanitizedValue = sanitizeAmountInput(value, options);

    if (!sanitizedValue || sanitizedValue === '-') {
        return sanitizedValue;
    }

    const isNegative = sanitizedValue.startsWith('-');
    const unsignedValue = isNegative ? sanitizedValue.slice(1) : sanitizedValue;
    const [rawIntegerPart = '0', rawFractionPart = ''] = unsignedValue.split(',');
    const integerPart = rawIntegerPart.replace(/^0+(?=\d)/, '') || '0';
    const groupedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formattedValue = rawFractionPart ? `${groupedIntegerPart},${rawFractionPart}` : groupedIntegerPart;

    return isNegative ? `-${formattedValue}` : formattedValue;
}

export function parseAmountInput(value, { allowDecimal = true, allowNegative = false, emptyValue = null } = {}) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : emptyValue;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            const num = Number(trimmed);
            return Number.isFinite(num) ? num : emptyValue;
        }
    }

    const sanitizedValue = sanitizeAmountInput(value, { allowDecimal, allowNegative, isInput: true });

    if (!sanitizedValue || sanitizedValue === '-') {
        return emptyValue;
    }

    const isNegative = sanitizedValue.startsWith('-');
    const unsignedValue = isNegative ? sanitizedValue.slice(1) : sanitizedValue;
    const [integerPart = '0', fractionPart = ''] = unsignedValue.split(',');
    const numericString = fractionPart ? `${integerPart}.${fractionPart}` : integerPart;
    const parsedValue = Number(`${isNegative ? '-' : ''}${numericString}`);

    return Number.isFinite(parsedValue) ? parsedValue : emptyValue;
}
