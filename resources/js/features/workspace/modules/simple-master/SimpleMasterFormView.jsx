import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import {
    finishCrudLoadingToast,
    showCrudErrorToast,
    showCrudLoadingToast,
    showCrudSuccessToast,
    showCrudValidationToast,
} from '@/features/workspace/shared/crudFeedback';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
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

    useEffect(() => {
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [initialValues]);

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
    const isDirty = useMemo(() => !areComparableValuesEqual(values, initialValues), [initialValues, values]);
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
            setStatus({ tone: 'error', message: validationMessage });
            showCrudValidationToast(validationMessage);
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
        <>
            <div className="relative flex min-h-full flex-col">
                <div className="px-1 pt-0.5">
                    <SectionTab label={form.sectionLabel} tone="accent" className="h-[34px]" />
                </div>

                <div className="flex min-h-[642px] flex-col gap-4 rounded-[4px] border border-[#cfd6e2] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-start xl:px-4 xl:py-4">
                    <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                        <CrudStatusMessage status={status} />

                        <div className="space-y-4">
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
                    </div>

                    <div className="flex shrink-0 flex-row justify-end gap-3 lg:flex-col">
                        {buildSimpleMasterDockActions(form, isDetailMode).map((action) => (
                            <DockActionButton
                                key={action.id}
                                label={saving ? 'Memproses...' : action.label}
                                tone={action.tone}
                                icon={renderSimpleMasterDockIcon(action.icon)}
                                onClick={saving ? undefined : () => handleAction(action.id)}
                                disabled={action.id === 'save' ? saveDisabled : saving}
                                className={saving ? 'pointer-events-none opacity-70' : ''}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                title={`Hapus ${form.sectionLabel ?? 'data'}`}
                message={`Data "${detailRow?.name ?? detailRow?.tabLabel ?? detailRow?.id ?? 'ini'}" akan dihapus. Lanjutkan?`}
                confirmLabel="Hapus"
                confirmVariant="danger"
                confirmLoading={saving}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}
