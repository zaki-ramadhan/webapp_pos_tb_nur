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
