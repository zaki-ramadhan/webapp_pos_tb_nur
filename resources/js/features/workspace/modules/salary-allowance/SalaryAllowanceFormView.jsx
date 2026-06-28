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
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { CloseIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import { buildSalaryAllowancePayload } from './salaryAllowanceShared';
import CheckboxField from '@/components/ui/CheckboxField';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';

export default function SalaryAllowanceFormView({
    pageId,
    activeLevel2Tab,
    config,
    entry,
    actions,
    editableDetail = false,
    onPersist = null,
    onDelete = null,
    onRefresh = null,
}) {
    const fields = config.fields;
    const isDetail = Boolean(entry.name) && entry.id !== config.newEntry.id;
    const [name, setName] = useState(entry.name ?? '');
    const [type, setType] = useState(entry.type || config.typeOptions[0] || '');
    const [expenseAccount, setExpenseAccount] = useState(entry.expenseAccount ?? '');
    const [expenseAccountId, setExpenseAccountId] = useState(entry.expenseAccountId ?? null);
    const [active, setActive] = useState(!entry.inactive);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    useEffect(() => {
        setName(entry.name ?? '');
        setType(entry.type || config.typeOptions[0] || '');
        setExpenseAccount(entry.expenseAccount ?? '');
        setExpenseAccountId(entry.expenseAccountId ?? null);
        setActive(!entry.inactive);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config.typeOptions, entry.expenseAccount, entry.expenseAccountId, entry.inactive, entry.name, entry.type]);

    const initialComparable = useMemo(
        () => ({
            name: entry.name ?? '',
            type: entry.type || config.typeOptions[0] || '',
            expenseAccount: entry.expenseAccount ?? '',
            expenseAccountId: entry.expenseAccountId ?? null,
            active: !entry.inactive,
        }),
        [config.typeOptions, entry.expenseAccount, entry.expenseAccountId, entry.inactive, entry.name, entry.type],
    );

    const currentComparable = useMemo(
        () => ({
            name,
            type,
            expenseAccount,
            expenseAccountId,
            active,
        }),
        [expenseAccount, expenseAccountId, active, name, type],
    );

    const validationMessage = validateRequiredChecks([
        { label: fields.nameLabel, value: name },
        { label: fields.expenseAccountLabel, value: expenseAccountId, type: 'lookup' },
    ]);
    const isDirty = !areComparableValuesEqual(initialComparable, currentComparable);
    const resolvedSaveDisabled = Boolean(validationMessage) || !isDirty || saving;

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
            loadingMessage: isDetail ? 'Sedang memperbarui gaji atau tunjangan.' : 'Sedang menyimpan gaji atau tunjangan.',
            successMessage: isDetail ? 'Gaji atau tunjangan berhasil diperbarui.' : 'Gaji atau tunjangan berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            execute: async () => {
                const payload = buildSalaryAllowancePayload({
                    name,
                    type,
                    expenseAccountId,
                    inactive: !active,
                });
                const response = isDetail
                    ? await updateBackendResource('salary-allowances', entry.id, payload)
                    : await createBackendResource('salary-allowances', payload);

                return response?.data ?? null;
            },
            onSuccess: async (record) => {
                await onRefresh?.();
                onPersist?.(record);
            },
        });
    }

    function requestDelete() {
        if (!isDetail || saving) {
            return;
        }

        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!isDetail) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus gaji atau tunjangan.',
            successMessage: 'Gaji atau tunjangan berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('salary-allowances', entry.id),
            onSuccess: async () => {
                await onRefresh?.();
                onDelete?.(entry.id);
            },
        });
    }

    const deleteAction = useMemo(() => {
        return actions.find((action) => action.id === 'delete');
    }, [actions]);

    const actionsSlot = deleteAction ? (
        <DockActionButton
            label={deleteAction.label}
            tone="danger"
            disabled={saving}
            onClick={requestDelete}
            icon={<TrashIcon className="h-7 w-7 sm:h-8 sm:w-8" />}
        />
    ) : null;

    return (
        <>
            <ModuleFormTemplate
                form={config}
                status={status}
                saving={saving}
                saveDisabled={resolvedSaveDisabled}
                onSave={handleSave}
                actionsSlot={actionsSlot}
            >
                <div className="space-y-3.5 max-w-[680px]">
                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-center gap-x-4 gap-y-1.5">
                        <label className="text-xs sm:text-sm text-brand-dark">
                            {fields.nameLabel} <span className="text-tab-active-border-t">*</span>
                        </label>
                        <TextInput
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            trailing={isDetail ? <CloseIcon className="h-4.5 w-4.5" /> : null}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-center gap-x-4 gap-y-1.5">
                        <div className="text-xs sm:text-sm text-brand-dark">{fields.typeLabel}</div>
                        {isDetail && !editableDetail ? (
                            <TextInput
                                value={entry.type}
                                readOnly
                                className="h-[40px] rounded-[4px] border-ui-border bg-input-prefix-bg"
                                inputClassName="text-xs sm:text-sm text-text-compact-input"
                            />
                        ) : (
                            <SelectField
                                value={type}
                                onChange={(event) => setType(event.target.value)}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                selectClassName="text-xs sm:text-sm text-brand-dark"
                            >
                                {config.typeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-center gap-x-4 gap-y-1.5">
                        <div className="text-xs sm:text-sm text-brand-dark">{fields.payDeductLabel}</div>
                        <TextInput
                            value={entry.payDeduct}
                            readOnly
                            className="h-[40px] rounded-[4px] border-ui-border bg-input-prefix-bg"
                            inputClassName="text-xs sm:text-sm text-text-compact-input"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-center gap-x-4 gap-y-1.5">
                        <label className="text-xs sm:text-sm text-brand-dark">
                            {fields.expenseAccountLabel} <span className="text-tab-active-border-t">*</span>
                        </label>
                        <AccountLookupField
                            value={expenseAccount}
                            placeholder="Cari/Pilih Akun Perkiraan..."
                            disabled={isDetail}
                            searchLabel="Cari akun beban"
                            dialogTitle="Pilih Akun Beban"
                            heightClassName="min-h-[38px]"
                            className="rounded-[4px] border-ui-border"
                            contentClassName="px-3 py-1.5"
                            chipClassName="text-text-dark"
                            onRemove={() => {
                                setExpenseAccount('');
                                setExpenseAccountId(null);
                            }}
                            onSelectAccount={(record, label) => {
                                setExpenseAccount(label);
                                setExpenseAccountId(record?.id ?? null);
                            }}
                        />
                    </div>

                    {isDetail ? (
                        <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-center gap-x-4 gap-y-1.5">
                            <div className="text-xs sm:text-sm text-brand-dark">{fields.inactiveLabel}</div>
                            <div className="flex items-center h-[40px]">
                                <CheckboxField
                                    id="active"
                                    label={fields.inactiveOptionLabel}
                                    checked={active}
                                    onChange={(event) => setActive(event.target.checked)}
                                    align="center"
                                    inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                    containerClassName="w-auto inline-flex"
                                    labelClassName="text-xs sm:text-sm text-brand-dark"
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            </ModuleFormTemplate>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${name}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </>
    );
}
