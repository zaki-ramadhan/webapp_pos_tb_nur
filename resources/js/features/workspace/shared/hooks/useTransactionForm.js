import { useState } from 'react';

import { getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';
import { buildLookupLabel } from '@/features/workspace/shared/transactionFormatters';

export function useTransactionForm({
    validationMessage = null,
    fieldErrors = null,
} = {}) {
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    async function selectLookup(resource, title, onApply, labelBuilder = buildLookupLabel) {
        try {
            const record = await promptSelectBackendRecord(resource, title, labelBuilder);

            if (!record) {
                return;
            }

            onApply(record);
            setStatus({ tone: '', message: '' });
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error, error.message) });
        }
    }

    async function handleSave({ execute, loadingMessage, successMessage, onSuccess }) {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus, fieldErrors });
            return { ok: false, errorMessage: validationMessage };
        }

        return await executeCrudFormAction({
            loadingMessage,
            successMessage,
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            execute,
            onSuccess,
        });
    }

    function requestDelete() {
        if (saving) {
            return;
        }
        setDeleteConfirmationOpen(true);
    }

    async function handleDelete({ execute, loadingMessage, successMessage, onSuccess }) {
        return await executeCrudFormAction({
            loadingMessage,
            successMessage,
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
            execute,
            onSuccess,
        });
    }

    return {
        status,
        setStatus,
        saving,
        setSaving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        selectLookup,
        handleSave,
        requestDelete,
        handleDelete,
    };
}
