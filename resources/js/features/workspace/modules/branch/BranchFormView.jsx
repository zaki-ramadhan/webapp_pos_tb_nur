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
import { BranchGeneralTab, BranchUsersTab } from './BranchSections';
import {
    buildBranchCode,
    buildBranchSnapshot,
    buildDefaultValues,
    validateBranchValues,
} from './branchShared';

export default function BranchFormView({
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

    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'branch-general');
    const initialValues = useMemo(() => buildDefaultValues(form, detailRow), [detailRow, form]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const isDetailMode = Boolean(detailRow);

    const isDirty = useMemo(
        () => !areComparableValuesEqual(buildBranchSnapshot(values), buildBranchSnapshot(initialValues)),
        [initialValues, values],
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'branch-general');
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
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const validationMessage = useMemo(() => validateBranchValues(values, form), [form, values]);
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
            loadingMessage: isDetailMode ? 'Sedang memperbarui cabang.' : 'Sedang menyimpan cabang.',
            successMessage: isDetailMode ? 'Cabang berhasil diperbarui.' : 'Cabang berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    code: buildBranchCode(values.name, values.__code),
                    name: values.name.trim(),
                    phone: values.phone.trim() || null,
                    street: values.street.trim() || null,
                    city: values.city.trim() || null,
                    postal_code: values.postalCode.trim() || null,
                    province: values.province.trim() || null,
                    country: values.country.trim() || null,
                    is_active: true,
                    user_ids: [], // Handled standardly
                };

                const response = isDetailMode && values.__backendRecordId
                    ? await updateBackendResource('branches', values.__backendRecordId, payload)
                    : await createBackendResource('branches', payload);

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
            loadingMessage: 'Sedang menghapus cabang.',
            successMessage: 'Cabang berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('branches', values.__backendRecordId),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    return (
        <div className="flex h-full min-h-0 flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="shrink-0">
                <PreferencesTabs
                    tabs={form.tabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                />
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-5 px-4 py-4 lg:flex-row lg:items-stretch overflow-hidden">
                <div className="min-w-0 flex-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    <CrudStatusMessage status={status} className="mb-4 shrink-0" />

                    {activeTabId === 'branch-users' ? (
                        <BranchUsersTab form={form} values={values} onChange={handleChange} />
                    ) : (
                        <BranchGeneralTab values={values} onChange={handleChange} />
                    )}
                </div>

                <div className="flex justify-end gap-3 lg:shrink-0 lg:flex-col lg:self-start">
                    <DockSaveButton
                        label={saving ? 'Memproses...' : form.saveLabel}
                        disabled={saveDisabled}
                        onClick={handleSave}
                    />
                    {isDetailMode ? (
                        <DockActionButton
                            label={saving ? 'Memproses...' : 'Hapus'}
                            tone="danger"
                            icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                            disabled={saving}
                            onClick={requestDelete}
                        />
                    ) : null}
                </div>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Cabang"
                message="Cabang ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}
