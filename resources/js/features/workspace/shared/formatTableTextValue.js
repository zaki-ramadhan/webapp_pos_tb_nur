export default function formatTableTextValue(value) {
    if (value === null || value === undefined) {
        return '-';
    }

    if (typeof value === 'string' && value.trim() === '') {
        return '-';
    }

    return value;
}
