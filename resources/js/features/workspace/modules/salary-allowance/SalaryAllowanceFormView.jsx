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
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import SectionTab from '@/features/workspace/shared/SectionTab';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { CloseIcon, SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import { buildSalaryAllowancePayload } from './salaryAllowanceShared';
import CheckboxField from '@/components/ui/CheckboxField';

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
    const [inactive, setInactive] = useState(Boolean(entry.inactive));
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    useEffect(() => {
        setName(entry.name ?? '');
        setType(entry.type || config.typeOptions[0] || '');
        setExpenseAccount(entry.expenseAccount ?? '');
        setExpenseAccountId(entry.expenseAccountId ?? null);
        setInactive(Boolean(entry.inactive));
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config.typeOptions, entry.expenseAccount, entry.expenseAccountId, entry.inactive, entry.name, entry.type]);

    const initialComparable = useMemo(
        () => ({
            name: entry.name ?? '',
            type: entry.type || config.typeOptions[0] || '',
            expenseAccount: entry.expenseAccount ?? '',
            expenseAccountId: entry.expenseAccountId ?? null,
            inactive: Boolean(entry.inactive),
        }),
        [config.typeOptions, entry.expenseAccount, entry.expenseAccountId, entry.inactive, entry.name, entry.type],
    );

    const currentComparable = useMemo(
        () => ({
            name,
            type,
            expenseAccount,
            expenseAccountId,
            inactive,
        }),
        [expenseAccount, expenseAccountId, inactive, name, type],
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
            loadingMessage: isDetail ? 'Sedang memperbarui gaji/tunjangan.' : 'Sedang menyimpan gaji/tunjangan.',
            successMessage: isDetail ? 'Gaji/tunjangan berhasil diperbarui.' : 'Gaji/tunjangan berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            execute: async () => {
                const payload = buildSalaryAllowancePayload({
                    name,
                    type,
                    expenseAccountId,
                    inactive,
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
            loadingMessage: 'Sedang menghapus gaji/tunjangan.',
            successMessage: 'Gaji/tunjangan berhasil dihapus.',
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

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="flex flex-1 min-h-0 flex-col gap-4 lg:flex-row overflow-hidden pt-0">
                <div className="flex flex-1 min-h-0 flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] overflow-hidden px-4 py-4 -mt-px">
                    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                        <CrudStatusMessage status={status} className="shrink-0 mb-4" />

                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <div className="grid content-start gap-x-7 gap-y-4 lg:grid-cols-[160px_minmax(0,640px)] lg:items-center">
                                <label className="text-xs sm:text-sm text-[#1f2436]">
                                    {fields.nameLabel} <span className="text-[#ED3969]">*</span>
                                </label>
                                <TextInput
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    trailing={isDetail ? <CloseIcon className="h-4.5 w-4.5" /> : null}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                />

                                <div className="text-xs sm:text-sm text-[#1f2436]">{fields.typeLabel}</div>
                                {isDetail && !editableDetail ? (
                                    <TextInput
                                        value={entry.type}
                                        readOnly
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f3f3f4]"
                                        inputClassName="text-xs sm:text-sm text-[#6a7286]"
                                    />
                                ) : (
                                    <SelectField
                                        value={type}
                                        onChange={(event) => setType(event.target.value)}
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        selectClassName="text-xs sm:text-sm text-[#1f2436]"
                                    >
                                        {config.typeOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </SelectField>
                                )}

                                <div className="text-xs sm:text-sm text-[#1f2436]">{fields.payDeductLabel}</div>
                                <TextInput
                                    value={entry.payDeduct}
                                    readOnly
                                    className="h-[40px] max-w-[390px] rounded-[4px] border-[#cfd6e2] bg-[#f3f3f4]"
                                    inputClassName="text-xs sm:text-sm text-[#6a7286]"
                                />

                                <label className="text-xs sm:text-sm text-[#1f2436]">
                                    {fields.expenseAccountLabel} <span className="text-[#ED3969]">*</span>
                                </label>
                                <AccountLookupField
                                    value={expenseAccount}
                                    placeholder="Cari/Pilih Akun Perkiraan..."
                                    disabled={isDetail}
                                    searchLabel="Cari akun beban"
                                    dialogTitle="Pilih Akun Beban"
                                    heightClassName="min-h-[38px]"
                                    className="rounded-[4px] border-[#cfd6e2]"
                                    contentClassName="px-3 py-1.5"
                                    chipClassName="text-[#24324a]"
                                    onRemove={() => {
                                        setExpenseAccount('');
                                        setExpenseAccountId(null);
                                    }}
                                    onSelectAccount={(record, label) => {
                                        setExpenseAccount(label);
                                        setExpenseAccountId(record?.id ?? null);
                                    }}
                                />

                                {isDetail ? (
                                    <>
                                        <div className="text-xs sm:text-sm text-[#1f2436]">{fields.inactiveLabel}</div>
                                        <CheckboxField
                                            id="inactive"
                                            label={fields.inactiveOptionLabel}
                                            checked={inactive}
                                            onChange={(event) => setInactive(event.target.checked)}
                                            inputClassName="h-6 w-6 rounded-[4px]"
                                            containerClassName="w-auto inline-flex items-center h-[40px]"
                                            labelClassName="text-xs sm:text-sm text-[#1f2436]"
                                        />
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-1 flex shrink-0 flex-row justify-start gap-3 lg:order-2 lg:shrink-0 lg:self-start lg:flex-col lg:w-[112px] lg:items-center pt-3 lg:pt-4">
                    {actions.map((action) => (
                        <DockActionButton
                            key={action.id}
                            label={action.label}
                            tone={action.tone === 'danger' ? 'danger' : 'primary'}
                            disabled={action.id === 'save' ? resolvedSaveDisabled : saving}
                            loading={saving && (action.id === 'save' || action.id === 'delete')}
                            onClick={action.id === 'save' ? handleSave : action.id === 'delete' ? requestDelete : undefined}
                            icon={action.icon === 'trash' ? <TrashIcon className="h-7 w-7 sm:h-8 sm:w-8" /> : <SaveIcon className="h-7 w-7 sm:h-8 sm:w-8" />}
                        />
                    ))}
                </div>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Gaji/Tunjangan"
                message="Data gaji/tunjangan ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}
