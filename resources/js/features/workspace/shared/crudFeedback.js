import {
    dismissToast,
    showErrorToast,
    showLoadingToast,
    showSuccessToast,
    showWarningToast,
    updateToastToSuccess,
} from '@/components/feedback/toast';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';

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
    return showSystemErrorModal({
        title: 'Terjadi Permasalahan pada Pemrosesan',
        description: 'Silakan perbaiki permasalahan berikut ini:',
        messages: Array.isArray(message) ? message : undefined,
        message: typeof message === 'string' ? message : (Array.isArray(message) ? undefined : String(message ?? '')),
    });
}

export const showCrudValidationModal = showCrudValidationToast;

export function finishCrudLoadingToast(toastId, message = 'Data berhasil disimpan.') {
    if (toastId) {
        updateToastToSuccess(toastId, { message });
    } else {
        dismissToast(toastId);
    }
}

export function dismissCrudLoadingToast(toastId) {
    if (toastId) {
        dismissToast(toastId);
    }
}

export async function executeImportPendingAction({
    loadingMessage = 'Sedang memproses...',
    successMessage = 'Berhasil memindahkan data.',
    errorMessage = 'Gagal memindahkan data.',
    action,
}) {
    const toastId = showCrudLoadingToast(loadingMessage);
    try {
        const result = await action();
        finishCrudLoadingToast(toastId, successMessage);
        return result;
    } catch (err) {
        console.error(err);
        dismissToast(toastId);
        showCrudErrorToast(errorMessage);
        throw err;
    }
}
