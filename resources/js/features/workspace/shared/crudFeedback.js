import {
    dismissToast,
    showErrorToast,
    showLoadingToast,
    showSuccessToast,
    showWarningToast,
    updateToastToSuccess,
} from '@/components/feedback/toast';

export function showCrudLoadingToast(message) {
    return showLoadingToast({
        title: 'Memproses',
        message,
    });
}

export function showCrudSuccessToast(message) {
    showSuccessToast({
        title: 'Berhasil',
        message,
    });
}

export function showCrudErrorToast(message) {
    showErrorToast({
        title: 'Gagal',
        message,
    });
}

export function showCrudValidationToast(message) {
    showWarningToast({
        title: 'Periksa Form',
        message,
    });
}

export function finishCrudLoadingToast(toastId, message = 'Data berhasil disimpan.') {
    if (toastId) {
        updateToastToSuccess(toastId, { message });
    } else {
        dismissToast(toastId);
    }
}
