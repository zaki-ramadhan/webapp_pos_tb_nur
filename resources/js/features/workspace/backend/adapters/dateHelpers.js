function padNumber(value) {
    return String(value).padStart(2, '0');
}

export function normalizeDisplayDate(value) {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
        return normalizedValue;
    }

    const parts = normalizedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

    if (!parts) {
        const parsedDate = new Date(normalizedValue);

        if (Number.isNaN(parsedDate.getTime())) {
            return '';
        }

        return `${parsedDate.getFullYear()}-${padNumber(parsedDate.getMonth() + 1)}-${padNumber(parsedDate.getDate())}`;
    }

    const [, day, month, year] = parts;

    return `${year}-${padNumber(month)}-${padNumber(day)}`;
}

export function formatIsoDate(value) {
    const normalizedValue = normalizeDisplayDate(value);

    if (!normalizedValue) {
        return '';
    }

    const [year, month, day] = normalizedValue.split('-');

    return `${day}/${month}/${year}`;
}

export function formatDateTime(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function formatDateTimeVerbose(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(date);
}

export function titleizeKey(value) {
    return String(value ?? '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function buildSelectOptions(values, allLabelPrefix, emptyLabel = null) {
    const options = [{ value: 'all', label: `${allLabelPrefix}: Semua` }];

    values.forEach(({ value, label }) => {
        if (!value) {
            return;
        }

        options.push({
            value,
            label: `${allLabelPrefix}: ${label}`,
        });
    });

    if (emptyLabel) {
        options.push({
            value: 'empty',
            label: `${allLabelPrefix}: ${emptyLabel}`,
        });
    }

    return options;
}

export function emptyStringToNull(value) {
    const normalizedValue = String(value ?? '').trim();

    return normalizedValue === '' ? null : normalizedValue;
}
