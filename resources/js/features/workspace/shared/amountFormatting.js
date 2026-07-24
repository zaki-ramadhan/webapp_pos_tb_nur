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
            const hasIndonesianThousandSep = /^-?\d{1,3}\.\d{3}$/.test(trimmed);
            if (!hasIndonesianThousandSep) {
                const num = Number(trimmed);
                return Number.isFinite(num) ? num : emptyValue;
            }
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

export function formatDisplayValue(val) {
    if (val === null || val === undefined || val === '') return val;
    if (typeof val === 'number') {
        return formatAmountInput(val, { allowDecimal: true, allowNegative: true });
    }
    if (typeof val === 'string') {
        const trimmed = val.trim();

      // Dates (e.g. 23/07/2026 or 2026-07-23)

        if (/^\d{1,4}[/-]\d{1,2}[/-]\d{1,4}$/.test(trimmed)) return val;

      // Document codes / references (e.g. IR.2026.07.23.001, SP-00001, BSH-404)

        if (/^[A-Za-z0-9_-]+\.[\d\.]+$|^[A-Za-z0-9_-]+-\d+$/i.test(trimmed) && /[A-Za-z_-]/.test(trimmed)) return val;

      // Currency values (e.g. Rp 1000 or -Rp 1000)

        if (/^-?Rp\s*\d[\d\.,]*$/i.test(trimmed)) {
            const isNegative = trimmed.startsWith('-');
            const rawNum = trimmed.replace(/^-?Rp\s*/i, '');
            const parsed = parseAmountInput(rawNum, { allowDecimal: true, emptyValue: null });
            if (parsed !== null) {
                return `${isNegative ? '-Rp ' : 'Rp '}${formatAmountInput(parsed, { allowDecimal: true })}`;
            }
        }

      // Parenthesized count / quantity (e.g. "1 Barang (11111)")

        if (/\([0-9]+\)/.test(trimmed)) {
            return trimmed.replace(/\((\d+)\)/g, (match, p1) => {
                const parsed = parseAmountInput(p1, { allowDecimal: true, emptyValue: null });
                return parsed !== null ? `(${formatAmountInput(parsed)})` : match;
            });
        }

      // Pure numeric strings (e.g. 1000 or 1000.5)

        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            const parsed = parseAmountInput(trimmed, { allowDecimal: true, emptyValue: null });
            if (parsed !== null) {
                return formatAmountInput(parsed, { allowDecimal: true, allowNegative: true });
            }
        }
    }
    return val;
}

export function formatCurrencyValue(value) {
    const numericValue = parseAmountInput(value, { emptyValue: 0 }) ?? 0;
    return formatAmountInput(numericValue, { allowDecimal: true });
}

export function parseNumericInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

export function buildLookupLabel(record, codeKey = 'code') {
    const code = String(record?.[codeKey] ?? record?.accountCode ?? '').trim();
    const name = String(record?.name ?? record?.accountName ?? record?.title ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

export function buildFilterOptions(labelPrefix, rows, rowKey, labelKey = rowKey) {
    const values = [...new Set(rows.map((row) => row[rowKey]).filter(Boolean))];

    return [
        { value: 'all', label: `${labelPrefix}: Semua` },
        ...values.map((value) => ({
            value,
            label: `${labelPrefix}: ${rows.find((row) => row[rowKey] === value)?.[labelKey] ?? value}`,
        })),
    ];
}

export function formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return '';
    const numBytes = Number(bytes);
    if (numBytes < 1024) return `${numBytes} B`;
    if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(1)} KB`;
    return `${(numBytes / (1024 * 1024)).toFixed(1)} MB`;
}


