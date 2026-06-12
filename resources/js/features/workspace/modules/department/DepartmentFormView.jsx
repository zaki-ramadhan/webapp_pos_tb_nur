import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { TrashIcon } from '@/features/workspace/shared/Icons';
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
        () => !areComparableValuesEqual(buildDepartmentSnapshot(values), buildDepartmentSnapshot(initialValues)),
        [initialValues, values],
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'department-general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeTabInstanceId]);

    useEffect(() => {
        if (!isDirty) {
            setValues(initialValues);
        }
    }, [initialValues, isDirty]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => applyDepartmentFormChange(currentValues, field, nextValue));
    }

    const validationMessage = useMemo(() => validateDepartmentValues(values, form), [form, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

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
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="shrink-0">
                <PreferencesTabs
                    tabs={form.tabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                />
            </div>

            <div className="flex flex-1 min-h-0 flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] overflow-hidden">
                <div className="flex flex-1 min-h-0 flex-col gap-5 px-4 py-4 lg:flex-row lg:items-stretch overflow-hidden">
                    <div className="order-2 min-w-0 flex-1 lg:order-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col">
                        <CrudStatusMessage status={status} className="mb-4 shrink-0" />

                        <div className="flex-1 min-h-0 flex flex-col">
                            <DepartmentFormContent
                                activeTabId={activeTabId}
                                form={form}
                                values={values}
                                onChange={handleChange}
                                branchOptions={branchOptions}
                                userOptions={userOptions}
                                parentDepartmentOptions={parentDepartmentOptions}
                            />
                        </div>
                    </div>

                    <div className="order-1 flex justify-end gap-3 lg:order-2 lg:shrink-0 lg:self-start lg:flex-col">
                        <DockSaveButton
                            label={saving ? 'Memproses...' : form.saveLabel}
                            disabled={saveDisabled}
                            onClick={handleSave}
                        />
                    </div>
                </div>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Departemen"
                message="Departemen ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}
