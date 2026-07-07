import { useState } from 'react';

import { getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';
import { buildLookupLabel } from '@/features/workspace/shared/transactionFormatters';

function deriveFieldErrors(validationMessage) {
    if (!validationMessage) return null;
    const errors = {};
    const msg = validationMessage.toLowerCase();

    if (msg.includes('asal dan tujuan tidak boleh sama') || msg.includes('akun asal dan tujuan')) {
        errors.fromBankAccounts = validationMessage;
        errors.toBankAccounts = validationMessage;
        errors.fromBank = validationMessage;
        errors.toBank = validationMessage;
    }
    
    if (msg.includes('dari kas/bank') || msg.includes('kas/bank asal') || msg.includes('bank pengirim') || msg.includes('kas/bank pengirim') || msg.includes('kas/bank pembayar')) {
        errors.fromBankAccounts = validationMessage;
        errors.fromBank = validationMessage;
        errors.bankAccounts = validationMessage;
    }
    
    if (msg.includes('ke kas/bank') || msg.includes('kas/bank tujuan') || msg.includes('bank penerima') || msg.includes('bank tujuan')) {
        errors.toBankAccounts = validationMessage;
        errors.toBank = validationMessage;
        errors.bankAccounts = validationMessage;
    }
    
    if (msg.includes('nilai transfer') || msg.includes('transfer value') || msg.includes('nilai pembayaran') || msg.includes('nilai penerimaan') || msg.includes('deposit amount') || msg.includes('uang muka')) {
        errors.transferValue = validationMessage;
        errors.paymentAmount = validationMessage;
        errors.depositAmount = validationMessage;
        errors.amount = validationMessage;
    }
    
    if (msg.includes('tanggal') || msg.includes('date')) {
        errors.entryDate = validationMessage;
        errors.requestDate = validationMessage;
        errors.effectiveDate = validationMessage;
        errors.dueDate = validationMessage;
    }
    
    if (msg.includes('nomor') || msg.includes('document number') || msg.includes('no bukti')) {
        errors.documentNumber = validationMessage;
    }

    if (msg.includes('pemasok') || msg.includes('supplier')) {
        errors.supplier = validationMessage;
        errors.__supplierId = validationMessage;
    }

    if (msg.includes('pelanggan') || msg.includes('customer')) {
        errors.customer = validationMessage;
        errors.__partnerId = validationMessage;
    }

    if (msg.includes('gaji') || msg.includes('payroll')) {
        errors.payroll = validationMessage;
    }

    return Object.keys(errors).length > 0 ? errors : null;
}

export function useTransactionForm({
    validationMessage = null,
    fieldErrors = null,
    isDirty = false,
} = {}) {
    const resolvedFieldErrors = fieldErrors || deriveFieldErrors(validationMessage);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const saveDisabled = saving || !isDirty || Boolean(
        validationMessage && (
            validationMessage.includes('wajib diisi') ||
            validationMessage.includes('wajib dipilih') ||
            validationMessage.includes('wajib diisi minimal 1')
        )
    );

    async function selectLookup(resource, title, onApply, labelBuilder = buildLookupLabel, queryParams = {}) {
        try {
            const record = await promptSelectBackendRecord(resource, title, labelBuilder, queryParams);
 
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
            rejectCrudFormAction(validationMessage, { setStatus, fieldErrors: resolvedFieldErrors });
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
        saveDisabled,
    };
}

export function buildWorkspaceDockActions({
    dockActions,
    isDetail,
    saveDisabled,
    saving,
    onSave,
    onDelete,
    additionalMaps = {}
}) {
    return (dockActions ?? [])
        .filter((action) => (isDetail ? true : action.id !== 'delete'))
        .map((action) => {
            if (additionalMaps[action.id]) {
                return additionalMaps[action.id](action);
            }

            if (action.id === 'save') {
                return {
                    ...action,
                    tone: 'primary',
                    disabled: saveDisabled,
                    label: saving ? 'Memproses...' : action.label,
                    onClick: onSave,
                };
            }

            if (action.id === 'delete') {
                return {
                    ...action,
                    label: saving ? 'Memproses...' : action.label,
                    onClick: onDelete,
                };
            }

            return action;
        });
}
