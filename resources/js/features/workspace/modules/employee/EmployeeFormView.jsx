import { useEffect, useMemo, useRef, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import { AttachmentSelectButton } from './employeeControls';
import EmployeeAttachmentModal from './EmployeeAttachmentModal';
import {
    buildEmployeeFormValues,
    buildEmployeePayload,
    buildEmployeeSnapshot,
    validateEmployeeFields,
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
    const detailRowId = detailRow?.id ?? null;
    const tabs = useMemo(() => {
        return form.tabs && form.tabs.length > 0 ? form.tabs : [
            { id: 'employee-general', label: 'Karyawan' },
            { id: 'employee-address', label: 'Alamat' },
            { id: 'employee-tax', label: 'Pajak Penghasilan' },
            { id: 'employee-bank', label: 'Rekening Gaji' }
        ];
    }, [form.tabs]);
    const [activeTabId, setActiveTabId] = useState(tabs[0].id);
    const initialValues = useMemo(() => buildEmployeeFormValues(form, detailRow), [detailRow]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
    const isDetailMode = Boolean(detailRow);
    const [errors, setErrors] = useState(() => ({
        website: validateEmployeeWebsite(initialValues.website ?? ''),
    }));

    const isDirty = useMemo(
        () => !areComparableValuesEqual(buildEmployeeSnapshot(values), buildEmployeeSnapshot(initialValues)),
        [initialValues, values],
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId(tabs[0].id);
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
        setAttachmentModalOpen(false);
        setErrors({
            website: validateEmployeeWebsite(initialValues.website ?? ''),
        });
        window.dispatchEvent(new CustomEvent('form-validation-clear'));
    }, [activeTabInstanceId]);

    useFormValuesSync({
        initialValues,
        recordId: detailRowId,
        isDirty,
        setValues,
        onSync: (syncedValues) => {
            setErrors({
                website: validateEmployeeWebsite(syncedValues.website ?? ''),
            });
        },
    });

    function handleChange(field, nextValue) {
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }

        if (field === 'website') {
            setErrors((currentErrors) => ({
                ...currentErrors,
                website: validateEmployeeWebsite(nextValue),
            }));
        }

        if (field === 'user') {
            setValues((currentValues) => ({
                ...currentValues,
                user: nextValue ? (nextValue.label && nextValue.email ? `${nextValue.label} (${nextValue.email})` : (nextValue.label ?? '')) : '',
                __userId: nextValue?.id ?? null,
            }));
            return;
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
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function handleSave() {
        const fieldErrors = validateEmployeeFields(values);
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            rejectCrudFormAction(validationMessage || 'Tolong lengkapi semua kolom yang wajib diisi.', { setStatus });
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
        <ModuleFormTemplate
            form={{
                tabs: tabs,
                saveLabel: form.saveLabel,
            }}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={handleSave}
            actionsSlot={
                <>
                    {isDetailMode ? (
                        <DockActionButton
                            label={saving ? 'Memproses...' : 'Hapus'}
                            tone="danger"
                            icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                            disabled={saving}
                            onClick={requestDelete}
                        />
                    ) : null}
                </>
            }
        >
            <div className="flex-1 min-h-0">
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

            <EmployeeAttachmentModal
                open={attachmentModalOpen}
                onClose={() => setAttachmentModalOpen(false)}
                values={values}
                setValues={setValues}
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
