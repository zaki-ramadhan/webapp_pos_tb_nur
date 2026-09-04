/**
 * Utilitas pemformatan dan normalisasi nomor telepon Indonesia.
 */

const PSTN_THREE_DIGIT_AREAS = new Set([
    '021', // Jakarta, Bodetabek
    '022', // Bandung
    '024', // Semarang
    '031', // Surabaya
    '061', // Medan
]);

const PSTN_FOUR_DIGIT_AREAS = new Set([
    '0231', '0232', '0233', '0234', // Wilayah III Cirebon (Cirebon, Kuningan, Majalengka, Indramayu)
    '0251', '0252', '0253', '0254', // Bogor, Lebak, Pandeglang, Serang
    '0260', '0261', '0262', '0263', '0264', '0265', '0266', '0267', // Priangan Timur & Barat
    '0271', '0272', '0273', '0274', // Solo, Klaten, Wonogiri, Yogyakarta
    '0281', '0282', '0283', '0284', '0285', '0286', // Banyumas, Cilacap, Tegal, Pemalang, Pekalongan
    '0291', '0292', '0293', '0294', '0295', '0296', '0297', '0298', // Kudus, Purwodadi, Magelang, Salatiga
]);

/**
 * Memformat nomor telepon untuk tampilan visual (UI tabel, detail, cetak).
 * Format seluler: 08xx-xxxx-xxxx
 * Format PSTN: 0231-xxxxxx atau 021-xxxxxxx
 * Jika terdeteksi email atau teks non-angka, nilai dikembalikan utuh tanpa diformat.
 */
export function formatPhoneDisplay(value) {
    if (value === null || value === undefined) return '';
    const str = String(value).trim();
    if (!str) return '';

    // Guard: Jika mengandung huruf atau karakter email (@), jangan diformat
    if (/[a-zA-Z@]/.test(str)) {
        return str;
    }

    let digits = str.replace(/\D/g, '');
    if (!digits) return str;

    // Normalisasi awalan: 628 -> 08, 62 -> 0
    if (digits.startsWith('62')) {
        digits = '0' + digits.slice(2);
    } else if (digits.startsWith('8') && digits.length >= 8) {
        digits = '0' + digits;
    }

    // Seluler Indonesia (08xx)
    if (digits.startsWith('08')) {
        if (digits.length <= 4) return digits;
        if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
        if (digits.length <= 12) return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
        return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12)}`;
    }

    // Telepon kabel / PSTN (02x, 03x, 04x, dll)
    if (digits.startsWith('0')) {
        const prefix3 = digits.slice(0, 3);
        if (PSTN_THREE_DIGIT_AREAS.has(prefix3)) {
            if (digits.length <= 3) return digits;
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        const prefix4 = digits.slice(0, 4);
        if (PSTN_FOUR_DIGIT_AREAS.has(prefix4) || digits.length > 9) {
            if (digits.length <= 4) return digits;
            return `${digits.slice(0, 4)}-${digits.slice(4)}`;
        }
        if (digits.length <= 3) return digits;
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }

    // Fallback nomor tanpa awalan 0
    if (digits.length > 8) {
        return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
    }

    return digits;
}

/**
 * Menormalkan nomor telepon menjadi angka bersih untuk penyimpanan database.
 * Contoh: "+62 877-2498-5885" -> "087724985885"
 * Nilai non-angka/email dikembalikan utuh.
 */
export function normalizePhoneNumber(value) {
    if (value === null || value === undefined) return '';
    const str = String(value).trim();
    if (!str) return '';

    // Guard: Jika mengandung huruf atau email (@), abaikan
    if (/[a-zA-Z@]/.test(str)) {
        return str;
    }

    let digits = str.replace(/\D/g, '');
    if (!digits) return '';

    if (digits.startsWith('62')) {
        digits = '0' + digits.slice(2);
    } else if (digits.startsWith('8') && digits.length >= 8) {
        digits = '0' + digits;
    }

    return digits;
}
