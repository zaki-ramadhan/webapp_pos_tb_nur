import {
    finishCrudLoadingToast,
    dismissCrudLoadingToast,
    showCrudErrorToast,
    showCrudLoadingToast,
    showCrudSuccessToast,
    showCrudValidationToast,
} from '@/features/workspace/shared/crudFeedback';

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

    if (fieldErrors && typeof fieldErrors === 'object') {
        dispatchValidationErrors(fieldErrors);
    }

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
        const errorMessage = getErrorMessage?.(error) ?? error?.message ?? 'Terjadi kesalahan.';

        // Tampilkan error validasi
        const serverFieldErrors = error?.response?.data?.errors;
        if (serverFieldErrors && typeof serverFieldErrors === 'object') {
            // Format error per field
            const flat = Object.fromEntries(
                Object.entries(serverFieldErrors).map(([key, value]) => [
                    key,
                    Array.isArray(value) ? (value[0] ?? '') : String(value),
                ]),
            );
            dispatchValidationErrors(flat);
        }

        dismissCrudLoadingToast(loadingToastId);
        setStatus?.({
            tone: 'error',
            message: errorMessage,
        });
        showCrudErrorToast(errorMessage);

        return {
            ok: false,
            error,
            errorMessage,
        };
    } finally {
        setSaving(false);
    }
}
