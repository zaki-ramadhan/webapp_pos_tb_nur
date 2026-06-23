export function getAuthFormMessage(errors) {
    return errors.auth ?? '';
}

export function applyClientErrors(form, errors) {
    form.clearErrors();

    for (const [field, message] of Object.entries(errors)) {
        form.setError(field, message);
    }
}

export function getFirstInlineError(errors, keys = []) {
    for (const key of keys) {
        if (errors[key]) {
            return errors[key];
        }
    }

    const firstEntry = Object.entries(errors).find(([key]) => key !== 'auth');

    return firstEntry?.[1] ?? '';
}

export function validateLoginForm(data) {
    const errors = {};

    if (!data.identifier.trim()) {
        errors.identifier = 'Email atau nomor handphone wajib diisi.';
    }

    if (!data.password) {
        errors.password = 'Password wajib diisi.';
    }

    return errors;
}

export function validateRegisterForm(data, { showPhoneField = false } = {}) {
    const errors = {};
    const email = (data.email ?? '').trim();

    if (!data.name.trim()) {
        errors.name = 'Nama lengkap wajib diisi.';
    }

    if (!email) {
        errors.email = 'Email wajib diisi.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        errors.email = 'Format email tidak valid.';
    }

    if (showPhoneField && data.phone) {
        if (data.phone.length > 50) {
            errors.phone = 'Nomor handphone terlalu panjang.';
        } else if (!/^(?:\+?62|0)?8\d{7,11}$/.test(data.phone.replace(/[\s()-]/g, ''))) {
            errors.phone = 'Gunakan nomor handphone Indonesia yang aktif, misalnya 08123456789 atau +628123456789.';
        }
    }

    if (!data.password) {
        errors.password = 'Password wajib diisi.';
    } else if (data.password.length < 8) {
        errors.password = 'Password minimal 8 karakter.';
    }

    return errors;
}

export function validateForgotPasswordForm(data) {
    const errors = {};
    const email = (data.email ?? '').trim();

    if (!email) {
        errors.email = 'Email wajib diisi.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        errors.email = 'Format email tidak valid.';
    }

    return errors;
}

export function validateResetPasswordForm(data) {
    const errors = {};
    const email = (data.email ?? '').trim();

    if (!email) {
        errors.email = 'Email wajib diisi.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        errors.email = 'Format email tidak valid.';
    }

    if (!data.password) {
        errors.password = 'Password baru wajib diisi.';
    } else if (data.password.length < 8) {
        errors.password = 'Password baru minimal 8 karakter.';
    }

    if (!data.password_confirmation) {
        errors.password_confirmation = 'Konfirmasi password baru wajib diisi.';
    } else if (data.password_confirmation !== data.password) {
        errors.password_confirmation = 'Konfirmasi password baru tidak cocok.';
    }

    return errors;
}
