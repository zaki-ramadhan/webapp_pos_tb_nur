/**
 * Regex komprehensif untuk mendeteksi seluruh variasi Unicode emoji:
 * - Karakter 4-byte UTF-8 (Unicode Supplementary Planes: \u{10000}-\u{10FFFF})
 * - Emoticons, Pictographs, Transport, Alchemical, Geometric
 * - Dingbats & Miscellaneous Symbols (\u{2600}-\u{27BF})
 * - Miscellaneous Symbols and Arrows (\u{2B00}-\u{2BFF})
 * - Miscellaneous Technical (\u{2300}-\u{23FF})
 * - Flags, Variation Selectors (\u{FE00}-\u{FE0F}), ZWJ (\u{200D}), ZWSP (\u{200B})
 * - Unicode property escape: Extended_Pictographic
 */
export const EMOJI_REGEX = /[\u{10000}-\u{10FFFF}]|[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2600}-\u{27BF}]|[\u{2B00}-\u{2BFF}]|[\u{FE00}-\u{FE0F}]|[\u{200B}-\u{200D}]|\p{Extended_Pictographic}/gu;

/**
 * Membersihkan nilai teks string dari emoji, script berbahaya, tag HTML/XML, dan null byte.
 */
export function sanitizeTextValue(val) {
    if (typeof val !== 'string') return val;

    return val
        .replace(/\0/g, '')
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/javascript\s*:/gi, '')
        .replace(EMOJI_REGEX, '');
}

/**
 * Menyaring objek / array payload secara rekursif sebelum dikirim ke server.
 * Mengecualikan field kata sandi (password).
 */
export function sanitizePayload(data, parentKey = '') {
    if (!data || typeof data !== 'object') {
        return typeof data === 'string' ? sanitizeTextValue(data) : data;
    }

    if (typeof FormData !== 'undefined' && data instanceof FormData) {
        return data;
    }

    if (typeof Blob !== 'undefined' && (data instanceof Blob || (typeof File !== 'undefined' && data instanceof File))) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((item) => sanitizePayload(item, parentKey));
    }

    const result = {};
    for (const [key, value] of Object.entries(data)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        const lowerKey = key.toLowerCase();

        if (lowerKey === 'password' || lowerKey.includes('password') || lowerKey.includes('current_password')) {
            result[key] = value;
            continue;
        }

        if (typeof value === 'string') {
            result[key] = sanitizeTextValue(value);
        } else if (value && typeof value === 'object' && !(typeof File !== 'undefined' && value instanceof File) && !(typeof Blob !== 'undefined' && value instanceof Blob)) {
            result[key] = sanitizePayload(value, fullKey);
        } else {
            result[key] = value;
        }
    }

    return result;
}
