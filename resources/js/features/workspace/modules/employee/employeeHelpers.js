import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

export function emptyStringToNull(value) {
    const normalizedValue = String(value ?? '').trim();

    return normalizedValue === '' ? null : normalizedValue;
}

export function parseCurrencyInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

export function parseNullableCurrencyInput(value) {
    return String(value ?? '').trim() ? parseCurrencyInput(value) : null;
}

export function validateEmployeeWebsite(value) {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return '';
    }

    try {
        const parsedUrl = new URL(normalizedValue);

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return 'Website harus diawali http:// atau https://.';
        }

        if (!parsedUrl.hostname || !parsedUrl.hostname.includes('.')) {
            return 'Masukkan domain website yang valid.';
        }

        return '';
    } catch {
        return 'Masukkan URL lengkap, misalnya https://dicoding.com.';
    }
}

export function buildEmployeeCode(employeeIdType) {
    const prefixMap = {
        Karyawan: 'EMP',
        Kontrak: 'CTR',
        Magang: 'INT',
    };
    const prefix = prefixMap[employeeIdType] ?? 'EMP';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `${prefix}-${year}${month}${day}${time}`;
}
