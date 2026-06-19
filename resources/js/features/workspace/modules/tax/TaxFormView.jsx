import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import { buildFormValues } from './taxShared';

function TaxFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,600px)] lg:items-center">
            <label className="text-xs sm:text-sm leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

export default function TaxFormView({ page, activeLevel2Tab }) {
    const form = page.form;
    const activeRecord = useMemo(
        () =>
            form.records?.find((record) => record.id === activeLevel2Tab?.recordId) ??
            null,
        [activeLevel2Tab?.recordId, form.records],
    );
    const isDetailMode = activeLevel2Tab?.tabType === 'detail' && activeRecord;
    const initialValues = useMemo(
        () => buildFormValues(isDetailMode ? activeRecord : form.createDefaults),
        [activeRecord, form.createDefaults, isDetailMode],
    );
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const isDirty = useMemo(
        () => !areComparableValuesEqual(values, initialValues),
        [initialValues, values],
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
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
        setValues((current) => ({
            ...current,
            [field]: nextValue,
        }));
    }

    const validationMessage = useMemo(() => validateRequiredChecks([
        { label: form.labels.type, value: values.type },
        { label: form.labels.description, value: values.description },
        { label: form.labels.percentage, value: values.percentage, type: 'number', min: 0 },
        { label: form.labels.salesAccount, value: values.salesAccount, type: 'lookup' },
        { label: form.labels.purchaseAccount, value: values.purchaseAccount, type: 'lookup' },
    ]), [form.labels, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    useWorkspaceDirtyRegistration({
        pageId: page.id,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (validationMessage) {
            const fieldErrors = {};
            if (!values.type) {
                fieldErrors.type = `${form.labels.type} wajib diisi.`;
            }
            if (!values.description?.trim()) {
                fieldErrors.description = `${form.labels.description} wajib diisi.`;
            }
            if (values.percentage == null || values.percentage === '') {
                fieldErrors.percentage = `${form.labels.percentage} wajib diisi.`;
            }
            rejectCrudFormAction(validationMessage, { setStatus, fieldErrors });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetailMode ? 'Sedang memperbarui pajak.' : 'Sedang menyimpan pajak.',
            successMessage: isDetailMode ? 'Pajak berhasil diperbarui.' : 'Pajak berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    type: values.type,
                    description: values.description.trim(),
                    rate_percent: parseFloat(values.percentage),
                    receivable_account_id: values.salesAccountId,
                    payable_account_id: values.purchaseAccountId,
                    is_active: true,
                };
                const response = isDetailMode && values.__backendRecordId
                    ? await updateBackendResource('taxes', values.__backendRecordId, payload)
                    : await createBackendResource('taxes', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                if (typeof window !== 'undefined' && typeof window.__triggerRefreshWorkspaceTable === 'function') {
                    window.__triggerRefreshWorkspaceTable('taxes');
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
            loadingMessage: 'Sedang menghapus pajak.',
            successMessage: 'Pajak berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('taxes', values.__backendRecordId),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                if (typeof window !== 'undefined' && typeof window.__triggerRefreshWorkspaceTable === 'function') {
                    window.__triggerRefreshWorkspaceTable('taxes');
                }
            },
        });
    }

    return (
        <ModuleFormTemplate
            form={form}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={handleSave}
            actionsSlot={
                isDetailMode ? (
                    <DockActionButton
                        label={saving ? 'Memproses...' : form.deleteLabel}
                        tone="danger"
                        icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                        disabled={saving}
                        onClick={requestDelete}
                    />
                ) : null
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 max-w-[980px]">
                <TaxFieldRow label={form.labels.type} required>
                    <SelectField
                        id="type"
                        name="type"
                        value={values.type}
                        onChange={(event) => handleChange('type', event.target.value)}
                        className="h-[34px] rounded-[4px] border-slate-400"
                        selectClassName="text-xs sm:text-sm text-[#1f2436]"
                    >
                        {form.typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                </TaxFieldRow>

                <TaxFieldRow label={form.labels.description} required>
                    <TextInput
                        id="description"
                        name="description"
                        value={values.description}
                        onChange={(event) => handleChange('description', event.target.value)}
                        className="h-[34px] rounded-[4px] border-slate-400"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                </TaxFieldRow>

                <TaxFieldRow label={form.labels.percentage} required>
                    <div className="flex items-center gap-3">
                        <TextInput
                            id="percentage"
                            name="percentage"
                            value={values.percentage}
                            onChange={(event) =>
                                handleChange('percentage', event.target.value.replace(/[^\d.]/g, ''))
                            }
                            containerClassName="w-[120px]"
                            className="h-[34px] rounded-[4px] border-slate-400"
                            inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
                        />
                        <span className="text-xs sm:text-sm text-[#1f2436]">%</span>
                    </div>
                </TaxFieldRow>

                <TaxFieldRow label={form.labels.salesAccount} required>
                    <AccountLookupField
                        id="salesAccount"
                        name="salesAccount"
                        value={values.salesAccount}
                        placeholder={form.accountPlaceholder}
                        searchLabel={form.salesAccountSearchLabel}
                        dialogTitle="Pilih Akun Penjualan"
                        onRemove={() => {
                            handleChange('salesAccount', '');
                            handleChange('salesAccountId', null);
                        }}
                        onSelectAccount={(record, label) => {
                            handleChange('salesAccount', label);
                            handleChange('salesAccountId', record?.id ?? null);
                        }}
                        heightClassName="h-[34px]"
                    />
                </TaxFieldRow>

                <TaxFieldRow label={form.labels.purchaseAccount} required>
                    <AccountLookupField
                        id="purchaseAccount"
                        name="purchaseAccount"
                        value={values.purchaseAccount}
                        placeholder={form.accountPlaceholder}
                        searchLabel={form.purchaseAccountSearchLabel}
                        dialogTitle="Pilih Akun Pembelian"
                        onRemove={() => {
                            handleChange('purchaseAccount', '');
                            handleChange('purchaseAccountId', null);
                        }}
                        onSelectAccount={(record, label) => {
                            handleChange('purchaseAccount', label);
                            handleChange('purchaseAccountId', record?.id ?? null);
                        }}
                        heightClassName="h-[34px]"
                    />
                </TaxFieldRow>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Pajak"
                message="Data pajak ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}
