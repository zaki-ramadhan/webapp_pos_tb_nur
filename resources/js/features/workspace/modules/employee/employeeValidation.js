import { validateEmployeeWebsite, parseNullableCurrencyInput } from './employeeHelpers';

export function validateEmployeeFields(values) {
    const errors = {};

    if (!String(values.fullName ?? '').trim()) {
        errors.full_name = 'Nama lengkap wajib diisi.';
    }

    if (values.autoEmployeeId) {
        if (!String(values.employeeIdType ?? '').trim()) {
            errors.employee_id_type = 'Tipe ID karyawan wajib dipilih.';
        }
    } else {
        if (!String(values.employeeCode ?? '').trim()) {
            errors.employee_code = 'ID karyawan wajib diisi jika penomoran otomatis dinonaktifkan.';
        }
    }

    if (values.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(values.email).trim())) {
        errors.email = 'Format email tidak valid. Pastikan menggunakan domain DNS lengkap (contoh: nama@domain.com).';
    }

    const websiteError = validateEmployeeWebsite(values.website);
    if (websiteError) {
        errors.website = websiteError;
    }

    // Alamat
    if (values.postalCode) {
        const postalClean = String(values.postalCode).trim();
        if (!/^\d{5}$/.test(postalClean)) {
            errors.postal_code = 'Kode pos harus terdiri dari 5 digit angka.';
        }
    }

    // Pajak
    if (values.subjectToIncomeTax) {
        if (values.taxNumber) {
            const strippedNpwp = String(values.taxNumber).replace(/[^0-9]/g, '');
            if (strippedNpwp.length !== 15 && strippedNpwp.length !== 16) {
                errors.tax_number = 'Format NPWP tidak valid. NPWP harus terdiri dari 15 atau 16 digit angka.';
            }
        }

        if (values.previousIncome) {
            const parsedIncome = parseNullableCurrencyInput(values.previousIncome);
            if (parsedIncome === null || isNaN(parsedIncome) || parsedIncome < 0) {
                errors.previous_income = 'Penghasilan sebelumnya harus berupa nominal angka valid.';
            }
        }

        if (values.previousTax) {
            const parsedTax = parseNullableCurrencyInput(values.previousTax);
            if (parsedTax === null || isNaN(parsedTax) || parsedTax < 0) {
                errors.previous_tax = 'PPh sebelumnya harus berupa nominal angka valid.';
            }
        }
    }

    // Bank
    const hasAnyBankField = [values.bankName, values.bankAccountNumber, values.bankAccountHolder]
        .some((value) => String(value ?? '').trim());

    if (hasAnyBankField) {
        if (!String(values.bankName ?? '').trim()) {
            errors['bank_accounts.0.bank_name'] = 'Nama bank wajib diisi jika rekening gaji digunakan.';
        }
        if (!String(values.bankAccountNumber ?? '').trim()) {
            errors['bank_accounts.0.account_number'] = 'Nomor rekening wajib diisi jika rekening gaji digunakan.';
        }
        if (!String(values.bankAccountHolder ?? '').trim()) {
            errors['bank_accounts.0.account_name'] = 'Atas nama rekening wajib diisi jika rekening gaji digunakan.';
        }
    }

    return errors;
}

export function validateEmployeeValues(values) {
    const errors = validateEmployeeFields(values);
    const keys = Object.keys(errors);
    return keys.length > 0 ? errors[keys[0]] : '';
}
