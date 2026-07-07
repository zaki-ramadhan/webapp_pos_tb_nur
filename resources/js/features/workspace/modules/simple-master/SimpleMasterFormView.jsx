import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    getBackendResource,
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
    const [fetchedRow, setFetchedRow] = useState(null);

    const detailRow = useMemo(() => {
        const localRow = findSimpleMasterDetailRow(table?.rows, activeLevel2Tab);
        return fetchedRow || localRow;
    }, [table?.rows, activeLevel2Tab, fetchedRow]);

    useEffect(() => {
        setFetchedRow(null);
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        if (!recordId || !backendConfig?.resource) return;

        let active = true;
        async function fetchDetail() {
            try {
                const record = await getBackendResource(backendConfig.resource, recordId);
                if (active && record) {
                    setFetchedRow(record);
                }
            } catch (err) {
                // Ignore
            }
        }
        fetchDetail();
        return () => { active = false; };
    }, [activeLevel2Tab?.recordId, activeLevel2Tab?.tabType, backendConfig?.resource]);

    const isDetailMode = Boolean(detailRow);
    const [values, setValues] = useState(() => buildSimpleMasterFormValues(form, detailRow));
    const [hasSaved, setHasSaved] = useState(false);
    const initialValues = useMemo(() => buildSimpleMasterFormValues(form, detailRow), [detailRow, form]);

    const isDirty = useMemo(() => !hasSaved && !areComparableValuesEqual(values, initialValues), [initialValues, values, hasSaved]);

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
        values,
        setValues,
    });

    function handleChange(fieldId, nextValue) {
        setHasSaved(false);
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
    const {
        status,
        setStatus,
        saving,
        setSaving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        saveDisabled,
    } = useTransactionForm({ validationMessage, isDirty });

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

            setHasSaved(true);
            await onRefresh?.();
            if (isDetailMode && record) {
                setFetchedRow(record);
                if (activeLevel2Tab?.id) {
                    const row = backendConfig.toRow(record);
                    window.dispatchEvent(
                        new CustomEvent('workspace:update-tab-label', {
                            detail: {
                                pageId: page.id,
                                tabId: activeLevel2Tab.id,
                                label: row[backendConfig.labelField] ?? row.name ?? row.tabLabel ?? record.name,
                            },
                        })
                    );
                }
            }
            const successMessage = isDetailMode ? 'Data berhasil diperbarui.' : 'Data berhasil dibuat.';
            setStatus({ tone: 'success', message: successMessage });
            finishCrudLoadingToast(loadingToastId, successMessage);

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
            finishCrudLoadingToast(loadingToastId, successMessage);
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
            validationMessage={validationMessage}
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
            <div className={`grid grid-cols-1 gap-y-3.5 ${page.id === 'item-unit' || page.id === 'item-brand' ? 'max-w-[480px]' : 'md:grid-cols-2 gap-x-8 max-w-[980px]'}`}>
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
