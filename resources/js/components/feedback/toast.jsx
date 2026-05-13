import { toast } from 'sonner';

function buildToastOptions(overrides = {}) {
    return {
        position: 'top-right',
        duration: 4200,
        ...overrides,
    };
}

export function showLoadingToast({ title = 'Memproses', message }) {
    return toast.loading(title, buildToastOptions({
        description: message,
        duration: Infinity,
    }));
}

export function showInfoToast({ title = 'Informasi', message }) {
    return toast.info(title, buildToastOptions({
        description: message,
    }));
}

export function showErrorToast({ title = 'Terjadi masalah', message }) {
    return toast.error(title, buildToastOptions({
        description: message,
    }));
}

export function showSuccessToast({ title = 'Berhasil', message }) {
    return toast.success(title, buildToastOptions({
        description: message,
    }));
}

export function showWarningToast({ title = 'Perhatian', message }) {
    return toast.warning(title, buildToastOptions({
        description: message,
    }));
}

export function updateToastToError(id, { title = 'Terjadi masalah', message }) {
    return toast.error(title, buildToastOptions({
        id,
        description: message,
    }));
}

export function dismissToast(id) {
    if (id) {
        toast.dismiss(id);
    }
}
