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
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import SectionTab from '@/features/workspace/shared/SectionTab';
import { SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import { buildFormValues, mapTaxRow } from './taxShared';

function TaxFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[360px_minmax(0,600px)] lg:items-center">
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
            if (!values.percentage || isNaN(Number(values.percentage)) || Number(values.percentage) < 0) {
                fieldErrors.percentage = `${form.labels.percentage} wajib diisi dan harus bernilai 0 atau lebih.`;
            }
            if (!values.salesAccount) {
                fieldErrors.salesAccount = `${form.labels.salesAccount} wajib diisi.`;
            }
            if (!values.purchaseAccount) {
                fieldErrors.purchaseAccount = `${form.labels.purchaseAccount} wajib diisi.`;
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
                    code: null,
                    name: values.description.trim(),
                    tax_type: values.type,
                    rate: Number(values.percentage),
                    output_account_id: values.salesAccountId,
                    input_account_id: values.purchaseAccountId,
                    is_active: true,
                };
                const response = isDetailMode && values.__backendRecordId
                    ? await updateBackendResource('taxes', values.__backendRecordId, payload)
                    : await createBackendResource('taxes', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await page.onRefresh?.();

                if (!isDetailMode && record?.id && page.onOpenDetail) {
                    const row = mapTaxRow(record);

                    page.onOpenDetail({
                        recordId: row.id,
                        label: row.description,
                        tabLabel: row.tabLabel,
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
            loadingMessage: 'Sedang menghapus pajak.',
            successMessage: 'Pajak berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('taxes', values.__backendRecordId),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await page.onRefresh?.();
                page.onCloseDetail?.(values.__backendRecordId);
                page.onOpenContent?.();
            },
        });
    }

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
            <div className="px-1 pt-0.5 shrink-0">
                <SectionTab label={form.sectionLabel} tone="accent" className="h-[34px]" />
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-5 rounded-[4px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-stretch overflow-hidden">
                <div className="min-w-0 flex-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col">
                    <CrudStatusMessage status={status} className="mb-4 shrink-0" />

                    <div className="max-w-[980px] space-y-3">
                        <TaxFieldRow label={form.labels.type} required>
                            <SelectField
                                id="type"
                                name="type"
                                value={values.type}
                                onChange={(event) => handleChange('type', event.target.value)}
                                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
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
                                className="h-[34px] rounded-[4px] border-[#cfd6e2]"
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
                                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
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
                </div>

                <div className="flex justify-end lg:shrink-0 lg:self-start">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        <DockActionButton
                            label={saving ? 'Memproses...' : form.saveLabel}
                            tone="primary"
                            icon={<SaveIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                            onClick={handleSave}
                            disabled={saveDisabled}
                        />
                        {isDetailMode ? (
                            <DockActionButton
                                label={saving ? 'Memproses...' : form.deleteLabel}
                                tone="danger"
                                icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                                disabled={saving}
                                onClick={requestDelete}
                            />
                        ) : null}
                    </div>
                </div>
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
        </div>
    );
}
