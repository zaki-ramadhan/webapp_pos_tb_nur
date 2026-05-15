import {
    finishCrudLoadingToast,
    showCrudErrorToast,
    showCrudLoadingToast,
    showCrudSuccessToast,
    showCrudValidationToast,
} from '@/features/workspace/shared/crudFeedback';

export function rejectCrudFormAction(message, { setStatus = null } = {}) {
    if (!message) {
        return false;
    }

    setStatus?.({
        tone: 'error',
        message,
    });
    showCrudValidationToast(message);

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
    onStart?.();

    try {
        const result = await execute();

        await onSuccess?.(result);
        finishCrudLoadingToast(loadingToastId);

        if (successMessage) {
            setStatus?.({
                tone: 'success',
                message: successMessage,
            });
            showCrudSuccessToast(successMessage);
        }

        return {
            ok: true,
            result,
        };
    } catch (error) {
        const errorMessage = getErrorMessage?.(error) ?? error?.message ?? 'Terjadi kesalahan.';

        finishCrudLoadingToast(loadingToastId);
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
