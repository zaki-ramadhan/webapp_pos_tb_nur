import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';

import {
    finishCrudLoadingToast,
    showCrudErrorToast,
    showCrudLoadingToast,
    showCrudSuccessToast,
    showCrudValidationToast,
} from '@/features/workspace/shared/crudFeedback';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import SectionTab from '@/features/workspace/shared/SectionTab';
import { MasterFieldRow, StandaloneCheckboxField } from './SimpleMasterFormFields';
import {
    buildSimpleMasterDockActions,
    buildSimpleMasterFormValues,
    findSimpleMasterDetailRow,
    renderSimpleMasterDockIcon,
} from './simpleMasterShared.jsx';

export default function SimpleMasterFormView({
    page,
    activeLevel2Tab,
    backendConfig = null,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const { form, table } = page;
    const detailRow = findSimpleMasterDetailRow(table?.rows, activeLevel2Tab);
    const isDetailMode = Boolean(detailRow);
    const [values, setValues] = useState(() => buildSimpleMasterFormValues(form, detailRow));
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const initialValues = useMemo(() => buildSimpleMasterFormValues(form, detailRow), [detailRow, form]);

    const isDirty = useMemo(() => !areComparableValuesEqual(values, initialValues), [initialValues, values]);

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeTabInstanceId]);

    useFormValuesSync({
        initialValues,
        recordId: detailRow?.id ?? null,
        isDirty,
        setValues,
    });

    function handleChange(fieldId, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [fieldId]: nextValue,
        }));
    }

    const validationMessage = useMemo(() => {
        const requiredChecks = (form.fields ?? [])
            .filter((field) => field.required && field.type !== 'heading' && field.type !== 'checkbox')
            .map((field) => ({
                label: field.label,
                value: values[field.id],
                type: field.type === 'lookup' ? 'lookup' : 'text',
            }));
        const requiredValidationMessage = validateRequiredChecks(requiredChecks);

        if (requiredValidationMessage) {
            return requiredValidationMessage;
        }

        return backendConfig?.validate?.(values) ?? '';
    }, [backendConfig, form.fields, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    useWorkspaceDirtyRegistration({
        pageId: page.id,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleAction(actionId) {
        if (!backendConfig) {
            return;
        }

        if (actionId === 'delete') {
            if (!detailRow?.id) {
                return;
            }

            setDeleteConfirmationOpen(true);

            return;
        }

        if (validationMessage) {
            const requiredFields = (form.fields ?? [])
                .filter((field) => field.required && field.type !== 'heading' && field.type !== 'checkbox');
            const fieldErrors = {};
            requiredFields.forEach((field) => {
                const val = values[field.id];
                const isEmpty = field.type === 'lookup' ? !val : !String(val ?? '').trim();
                if (isEmpty) {
                    fieldErrors[field.id] = `${field.label} wajib diisi.`;
                }
            });

            rejectCrudFormAction(validationMessage, { setStatus, fieldErrors });
            return;
        }

        const loadingToastId = showCrudLoadingToast(isDetailMode ? 'Sedang memperbarui data.' : 'Sedang menyimpan data baru.');
        setSaving(true);

        try {
            const payload = backendConfig.toPayload(values);
            const response = isDetailMode && detailRow?.id
                ? await updateBackendResource(backendConfig.resource, detailRow.id, payload)
                : await createBackendResource(backendConfig.resource, payload);
            const record = response?.data ?? null;

            await onRefresh?.();
            const successMessage = isDetailMode ? 'Data berhasil diperbarui.' : 'Data berhasil dibuat.';
            setStatus({ tone: 'success', message: successMessage });
            finishCrudLoadingToast(loadingToastId);
            showCrudSuccessToast(successMessage);

            if (!isDetailMode && record && onOpenDetail) {
                const row = backendConfig.toRow(record);

                onOpenDetail({
                    recordId: row.id,
                    label: row[backendConfig.labelField] ?? row.name ?? row.id,
                    tabLabel: row.tabLabel ?? row[backendConfig.labelField] ?? row.name ?? row.id,
                });
            }
        } catch (error) {
            const errorMessage = getBackendErrorMessage(error);
            setStatus({ tone: 'error', message: errorMessage });
            finishCrudLoadingToast(loadingToastId);
            showCrudErrorToast(errorMessage);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!backendConfig || !detailRow?.id) {
            return;
        }

        const loadingToastId = showCrudLoadingToast('Sedang menghapus data.');
        setSaving(true);

        try {
            await deleteBackendResource(backendConfig.resource, detailRow.id);
            await onRefresh?.();
            const successMessage = 'Data berhasil dihapus.';
            setStatus({ tone: 'success', message: successMessage });
            finishCrudLoadingToast(loadingToastId);
            showCrudSuccessToast(successMessage);
            setDeleteConfirmationOpen(false);
            onCloseDetail?.(detailRow.id);
            onOpenContent?.();
        } catch (error) {
            const errorMessage = getBackendErrorMessage(error);
            setStatus({ tone: 'error', message: errorMessage });
            finishCrudLoadingToast(loadingToastId);
            showCrudErrorToast(errorMessage);
        } finally {
            setSaving(false);
        }
    }

    return (
        <ModuleFormTemplate
            form={form}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={() => handleAction('save')}
            actionsSlot={
                isDetailMode && form.deleteLabel ? (
                    <DockActionButton
                        label={saving ? 'Memproses...' : form.deleteLabel}
                        tone="danger"
                        icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                        disabled={saving}
                        onClick={() => handleAction('delete')}
                    />
                ) : null
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 max-w-[980px]">
                {(form.fields ?? []).map((field) => (
                    field.standalone ? (
                        <StandaloneCheckboxField
                            key={field.id}
                            field={field}
                            value={values[field.id]}
                            onChange={handleChange}
                        />
                    ) : (
                        <MasterFieldRow
                            key={field.id}
                            field={field}
                            value={values[field.id] ?? ''}
                            onChange={handleChange}
                        />
                    )
                ))}
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${detailRow?.name ?? detailRow?.tabLabel ?? detailRow?.id ?? 'ini'}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
            />
        </ModuleFormTemplate>
    );
}
