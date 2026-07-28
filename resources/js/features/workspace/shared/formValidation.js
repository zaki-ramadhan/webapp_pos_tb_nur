export function normalizeComparableValue(value, seen = new WeakSet()) {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === 'function') {
        return undefined;
    }

    if (typeof value === 'object') {
        if (seen.has(value)) {
            return undefined;
        }
        if (value.$$typeof || value.nodeType || typeof value.then === 'function') {
            return undefined;
        }
        seen.add(value);

        if (Array.isArray(value)) {
            return value.map((item) => normalizeComparableValue(item, seen));
        }

        return Object.keys(value)
            .sort()
            .reduce((result, key) => {
                const lowerKey = key.toLowerCase();
                if (
                    lowerKey === 'linelookup' ||
                    lowerKey === 'lookup' ||
                    lowerKey === 'search' ||
                    lowerKey === 'keyword' ||
                    lowerKey.endsWith('lookup')
                ) {
                    return result;
                }
                const norm = normalizeComparableValue(value[key], seen);
                if (norm !== undefined) {
                    result[key] = norm;
                }
                return result;
            }, {});
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === 'true' || trimmed === '1') return true;
        if (trimmed === 'false' || trimmed === '0' || trimmed === '') return false;
        return trimmed;
    }

    if (value === 1) return true;
    if (value === 0 || value === false) return false;

    return value;
}

export function areComparableValuesEqual(left, right) {
    try {
        return JSON.stringify(normalizeComparableValue(left)) === JSON.stringify(normalizeComparableValue(right));
    } catch {
        return false;
    }
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
