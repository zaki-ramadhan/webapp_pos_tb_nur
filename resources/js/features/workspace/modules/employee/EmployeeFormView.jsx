import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import { AttachmentSelectButton } from './employeeControls';
import {
    buildEmployeeFormValues,
    buildEmployeePayload,
    buildEmployeeSnapshot,
    validateEmployeeValues,
    validateEmployeeWebsite,
} from '@/features/workspace/modules/employee/employeeViewShared';
import {
    EmployeeAddressTab,
    EmployeeBankTab,
    EmployeeGeneralTab,
    EmployeeTaxTab,
} from './EmployeeSections';

export default function EmployeeFormView({
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
    const [activeTabId, setActiveTabId] = useState(form.tabs?.[0]?.id ?? 'employee-general');
    const initialValues = useMemo(() => buildEmployeeFormValues(form, detailRow), [detailRow, form]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const isDetailMode = Boolean(detailRow);
    const [errors, setErrors] = useState(() => ({
        website: validateEmployeeWebsite(initialValues.website ?? ''),
    }));

    useEffect(() => {
        setActiveTabId(form.tabs?.[0]?.id ?? 'employee-general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
        setErrors({
            website: validateEmployeeWebsite(initialValues.website ?? ''),
        });
    }, [form, initialValues]);

    function handleChange(field, nextValue) {
        if (field === 'website') {
            setErrors((currentErrors) => ({
                ...currentErrors,
                website: validateEmployeeWebsite(nextValue),
            }));
        }

        if (field === 'branch') {
            const selectedBranch = (form.lookupOptions?.branches ?? []).find((option) => option.label === nextValue);

            setValues((currentValues) => ({
                ...currentValues,
                branch: nextValue,
                __branchId: selectedBranch?.id ?? null,
            }));
            return;
        }

        if (field === 'department') {
            const selectedDepartment = (form.lookupOptions?.departments ?? []).find((option) => option.label === nextValue);

            setValues((currentValues) => ({
                ...currentValues,
                department: nextValue,
                __departmentId: selectedDepartment?.id ?? null,
            }));
            return;
        }

        if (field === 'autoEmployeeId') {
            setValues((currentValues) => ({
                ...currentValues,
                autoEmployeeId: nextValue,
                employeeCode: nextValue ? '' : currentValues.employeeCode,
            }));
            return;
        }

        if (field === 'subjectToIncomeTax') {
            setValues((currentValues) => ({
                ...currentValues,
                subjectToIncomeTax: nextValue,
                taxAllowanceApplies: nextValue ? 'Ya' : 'Tidak',
            }));
            return;
        }

        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const validationMessage = useMemo(() => validateEmployeeValues(values), [values]);
    const isDirty = useMemo(
        () => !areComparableValuesEqual(buildEmployeeSnapshot(values), buildEmployeeSnapshot(initialValues)),
        [initialValues, values],
    );
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
            loadingMessage: isDetailMode ? 'Sedang memperbarui karyawan.' : 'Sedang menyimpan karyawan.',
            successMessage: isDetailMode ? 'Karyawan berhasil diperbarui.' : 'Karyawan berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = buildEmployeePayload(values);
                const response = isDetailMode && values.__backendRecordId
                    ? await updateBackendResource('employees', values.__backendRecordId, payload)
                    : await createBackendResource('employees', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetailMode && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.full_name ?? values.fullName.trim(),
                        tabLabel: record.full_name ?? values.fullName.trim(),
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
            loadingMessage: 'Sedang menghapus karyawan.',
            successMessage: 'Karyawan berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('employees', values.__backendRecordId),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={form.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[740px] flex-col gap-5 px-4 py-4 xl:flex-row">
                <div className="min-w-0 flex-1">
                    <CrudStatusMessage status={status} className="mb-4" />

                    <div className="rounded-[6px] border border-[#d8dde7] bg-white px-3 py-3 sm:px-4 sm:py-4">
                        {activeTabId === 'employee-address' ? (
                            <EmployeeAddressTab values={values} onChange={handleChange} />
                        ) : activeTabId === 'employee-tax' ? (
                            <EmployeeTaxTab form={form} values={values} onChange={handleChange} />
                        ) : activeTabId === 'employee-bank' ? (
                            <EmployeeBankTab form={form} values={values} onChange={handleChange} />
                        ) : (
                            <EmployeeGeneralTab form={form} values={values} errors={errors} onChange={handleChange} />
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 flex-row justify-start gap-3 self-start xl:flex-col">
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
                    <AttachmentSelectButton label={form.attachmentLabel} />
                </div>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Karyawan"
                message="Data karyawan ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}
