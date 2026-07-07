import {
    finishCrudLoadingToast,
    dismissCrudLoadingToast,
    showCrudErrorToast,
    showCrudLoadingToast,
    showCrudSuccessToast,
    showCrudValidationToast,
} from '@/features/workspace/shared/crudFeedback';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';

function dispatchValidationErrors(errors) {
    window.dispatchEvent(new CustomEvent('form-validation-error', { detail: errors ?? {} }));
}

function clearValidationErrors() {
    window.dispatchEvent(new CustomEvent('form-validation-clear'));
}

export function rejectCrudFormAction(message, { setStatus = null, fieldErrors = null } = {}) {
    if (!message) {
        return false;
    }

    showCrudValidationToast(message);

    let modalMessages = [];
    if (fieldErrors && typeof fieldErrors === 'object') {
        dispatchValidationErrors(fieldErrors);
        modalMessages = Array.from(new Set(Object.values(fieldErrors).filter(Boolean)));
    }

    showSystemErrorModal({
        title: 'Terjadi Permasalahan pada Pemrosesan',
        description: 'Silakan perbaiki permasalahan berikut ini:',
        message: modalMessages.length === 0 ? message : '',
        messages: modalMessages,
        confirmLabel: 'OK',
    });

    return false;
}

export async function executeCrudFormAction({
    loadingMessage,
    successMessage,
    execute,
    setSaving,
    setStatus = null,
    getErrorMessage = null,
    onSuccess = null,
    onStart = null,
}) {
    const loadingToastId = showCrudLoadingToast(loadingMessage);

    setSaving(true);
    setStatus?.({ tone: '', message: '' });
    clearValidationErrors();
    onStart?.();

    try {
        const result = await execute();

        await onSuccess?.(result);

        if (successMessage) {
            setStatus?.({
                tone: 'success',
                message: successMessage,
            });
            finishCrudLoadingToast(loadingToastId, successMessage);
        } else {
            finishCrudLoadingToast(loadingToastId);
        }

        return {
            ok: true,
            result,
        };
    } catch (error) {
        const serverFieldErrors = error?.response?.data?.errors;
        if (serverFieldErrors && serverFieldErrors.stock_warning) {
            dismissCrudLoadingToast(loadingToastId);
            setSaving(false);
            return {
                ok: false,
                isStockWarning: true,
                warningData: serverFieldErrors.stock_warning,
            };
        }

        const errorMessage = getErrorMessage?.(error) ?? error?.message ?? 'Terjadi kesalahan.';

        // Tampilkan error validasi
        let modalMessages = [];
        if (serverFieldErrors && typeof serverFieldErrors === 'object') {
            // Format error per field
            const flat = Object.fromEntries(
                Object.entries(serverFieldErrors).map(([key, value]) => [
                    key,
                    Array.isArray(value) ? (value[0] ?? '') : String(value),
                ]),
            );
            dispatchValidationErrors(flat);
            modalMessages = Array.from(new Set(Object.values(flat).filter(Boolean)));
        }

        dismissCrudLoadingToast(loadingToastId);
        setStatus?.({
            tone: 'error',
            message: errorMessage,
        });
        showCrudErrorToast(errorMessage);

        showSystemErrorModal({
            title: 'Terjadi Permasalahan pada Pemrosesan',
            description: 'Silakan perbaiki permasalahan berikut ini:',
            message: modalMessages.length === 0 ? errorMessage : '',
            messages: modalMessages,
            confirmLabel: 'OK',
        });

        return {
            ok: false,
            error,
            errorMessage,
        };
    } finally {
        setSaving(false);
    }
}
