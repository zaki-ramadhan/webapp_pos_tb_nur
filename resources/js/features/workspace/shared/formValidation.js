export function normalizeComparableValue(value) {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeComparableValue(item));
    }

    if (value && typeof value === 'object') {
        return Object.keys(value)
            .sort()
            .reduce((result, key) => {
                result[key] = normalizeComparableValue(value[key]);
                return result;
            }, {});
    }

    if (typeof value === 'string') {
        return value.trim();
    }

    return value ?? null;
}

export function areComparableValuesEqual(left, right) {
    return JSON.stringify(normalizeComparableValue(left)) === JSON.stringify(normalizeComparableValue(right));
}

export function validateRequiredChecks(checks = []) {
    for (const check of checks) {
        if (!check) {
            continue;
        }

        const label = String(check.label ?? 'Field').trim();
        const type = check.type ?? 'text';
        const value = check.value;

        if (type === 'lookup') {
            if (value === null || value === undefined || value === '') {
                return `${label} wajib dipilih.`;
            }

            continue;
        }

        if (type === 'array') {
            if (!Array.isArray(value) || value.length < (check.minItems ?? 1)) {
                return `${label} wajib diisi.`;
            }

            continue;
        }

        if (type === 'number') {
            const normalizedValue = String(value ?? '').trim();

            if (normalizedValue === '') {
                return check.message ?? `${label} wajib diisi.`;
            }

            const numericValue = Number(value);

            if (!Number.isFinite(numericValue) || numericValue < (check.min ?? 0)) {
                return check.message ?? `${label} tidak valid.`;
            }

            continue;
        }

        if (String(value ?? '').trim() === '') {
            return `${label} wajib diisi.`;
        }
    }

    return '';
}

export function resolveDocumentRequirementValue(autoNumber, numberingType, documentNumber) {
    return autoNumber ? numberingType : documentNumber;
}

export function resolveSaveDisabledState({
    checks = [],
    initialComparable = null,
    currentComparable = null,
    saving = false,
}) {
    const validationMessage = validateRequiredChecks(checks);
    const isDirty =
        initialComparable === null || currentComparable === null
            ? true
            : !areComparableValuesEqual(initialComparable, currentComparable);

    return {
        validationMessage,
        isDirty,
        saveDisabled: Boolean(saving || validationMessage || !isDirty),
    };
}
