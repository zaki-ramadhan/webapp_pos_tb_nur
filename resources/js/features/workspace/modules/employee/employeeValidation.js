import { validateEmployeeWebsite } from './employeeHelpers';

export function validateEmployeeValues(values) {
    if (!String(values.fullName ?? '').trim()) {
        return 'Nama lengkap wajib diisi.';
    }

    if (!String(values.employeeIdType ?? '').trim()) {
        return 'Tipe ID karyawan wajib dipilih.';
    }

    if (values.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(values.email).trim())) {
        return 'Format email tidak valid. Pastikan menggunakan domain DNS lengkap (contoh: nama@domain.com).';
    }

    const websiteError = validateEmployeeWebsite(values.website);

    if (websiteError) {
        return websiteError;
    }

    const hasAnyBankField = [values.bankName, values.bankAccountNumber, values.bankAccountHolder]
        .some((value) => String(value ?? '').trim());

    if (hasAnyBankField) {
        if (!String(values.bankName ?? '').trim()) {
            return 'Nama bank wajib diisi jika rekening gaji digunakan.';
        }

        if (!String(values.bankAccountNumber ?? '').trim()) {
            return 'Nomor rekening wajib diisi jika rekening gaji digunakan.';
        }

        if (!String(values.bankAccountHolder ?? '').trim()) {
            return 'Atas nama rekening wajib diisi jika rekening gaji digunakan.';
        }
    }

    return '';
}
