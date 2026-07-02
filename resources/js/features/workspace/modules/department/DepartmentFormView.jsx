import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import DepartmentFormContent from './DepartmentFormContent';
import {
    applyDepartmentFormChange,
    buildDefaultValues,
    buildDepartmentCode,
    buildDepartmentSnapshot,
    validateDepartmentValues,
} from './departmentFormShared';

export default function DepartmentFormView({
    pageId,
    form,
    tableRows = [],
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return tableRows.find((row) => String(row.id) === String(recordId)) ?? null;
    }, [activeLevel2Tab, tableRows]);
    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'department-general');
    const initialValues = useMemo(() => buildDefaultValues(form, detailRow), [detailRow, form]);
    const [values, setValues] = useState(() => initialValues);
    const [hasSaved, setHasSaved] = useState(false);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const isDetailMode = Boolean(detailRow);
    const parentDepartmentOptions = useMemo(
        () => (form.lookupOptions?.parentDepartments ?? [])
            .filter((row) => String(row.id) !== String(values.__backendRecordId ?? ''))
            .map((row) => ({
                id: row.id,
                label: row.name,
                code: row.code,
                searchText: [row.name, row.code].filter(Boolean).join(' '),
            })),
        [form.lookupOptions, values.__backendRecordId],
    );
    const branchOptions = useMemo(
        () => (form.lookupOptions?.branches ?? []).map((option) => ({
            ...option,
            branchIds: [option.id],
        })),
        [form.lookupOptions],
    );
    const userOptions = useMemo(
        () => (form.lookupOptions?.users ?? []).map((option) => ({
            ...option,
            branchIds: option.branchIds ?? [],
        })),
        [form.lookupOptions],
    );

    const isDirty = useMemo(
        () => !hasSaved && !areComparableValuesEqual(buildDepartmentSnapshot(values), buildDepartmentSnapshot(initialValues)),
        [initialValues, values, hasSaved],
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'department-general');
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

    function handleChange(field, nextValue) {
        setHasSaved(false);
        setValues((currentValues) => applyDepartmentFormChange(currentValues, field, nextValue));
    }

    const validationMessage = useMemo(() => validateDepartmentValues(values, form), [form, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage && (validationMessage.includes('wajib diisi') || validationMessage.includes('wajib dipilih') || validationMessage.includes('wajib diisi minimal 1')));

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetailMode ? 'Sedang memperbarui departemen.' : 'Sedang menyimpan departemen.',
            successMessage: isDetailMode ? 'Departemen berhasil diperbarui.' : 'Departemen berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    code: buildDepartmentCode(values.name, values.__code),
                    name: values.name.trim(),
                    notes: values.description.trim() || null,
                    parent_department_id: values.isSubDepartment ? values.parentDepartmentId : null,
                    is_active: true,
                    user_ids: values.allUsers ? [] : values.selectedUserIds,
                };
                const response = isDetailMode && values.__backendRecordId
                    ? await updateBackendResource('departments', values.__backendRecordId, payload)
                    : await createBackendResource('departments', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                setHasSaved(true);
                if (isDetailMode && record && activeLevel2Tab?.id) {
                    window.dispatchEvent(
                        new CustomEvent('workspace:update-tab-label', {
                            detail: {
                                pageId: pageId ?? (typeof page !== 'undefined' ? page?.id : null),
                                tabId: activeLevel2Tab.id,
                                label: record?.name ?? record?.full_name ?? record?.countryName ?? record?.country_name ?? record?.number ?? values?.name ?? values?.fullName ?? values?.groupName ?? '',
                            },
                        })
                    );
                }
                await onRefresh?.();

                if (!isDetailMode && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.name ?? values.name.trim(),
                        tabLabel: record.name ?? values.name.trim(),
                    });
                }
            },
        });
    }

    function requestDelete() {
        if (!values.__backendRecordId || saving) {
            return;
        }

        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus departemen.',
            successMessage: 'Departemen berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('departments', values.__backendRecordId),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    return (
        <ModuleFormTemplate
            validationMessage={validationMessage}
            form={form}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={handleSave}
        >
            <DepartmentFormContent
                activeTabId={activeTabId}
                form={form}
                values={values}
                onChange={handleChange}
                branchOptions={branchOptions}
                userOptions={userOptions}
                parentDepartmentOptions={parentDepartmentOptions}
            />

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.name}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}
