import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { buildAccountDetailRecord } from './accountsConfig';
import {
    AccountsChildrenTab,
    AccountsGeneralTab,
    AccountsOpeningBalanceTab,
    AccountsOthersTab,
} from './AccountsFormSections';
import {
    buildAccountPayload,
    buildAccountSourceRecord,
    buildComparableFormValues,
    buildFormState,
} from './accountsShared';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';

export default function AccountsFormView({ config, backendRows, activeLevel2Tab, onOpenDetail, onCloseDetail, onReload }) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const tabs = isDetail ? config.detailTabs : config.createTabs;
    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'general');
    const backendRecord = useMemo(
        () => backendRows.find((row) => String(row.id) === String(recordId)) ?? null,
        [backendRows, recordId],
    );
    const sourceRecord = useMemo(
        () => (isDetail
            ? (backendRecord ? buildAccountSourceRecord(backendRecord, config) : buildAccountDetailRecord(recordId, config))
            : config.createValues),
        [backendRecord, config, isDetail, recordId],
    );
    const [values, setValues] = useState(() => buildFormState(sourceRecord));
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const initialValues = useMemo(() => buildFormState(sourceRecord), [sourceRecord]);
    const hasChanges = useMemo(
        () => !areComparableValuesEqual(buildComparableFormValues(initialValues), buildComparableFormValues(values)),
        [initialValues, values],
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId((isDetail ? config.detailTabs : config.createTabs)[0]?.id ?? 'general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteModalOpen(false);
    }, [activeTabInstanceId, config.createTabs, config.detailTabs, isDetail]);

    useEffect(() => {
        if (!hasChanges) {
            setValues(initialValues);
        }
    }, [initialValues, hasChanges]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const validationMessage = useMemo(() => {
        const isCodeRequired = !values.isSubAccount || !values.autoCode;
        const checks = [
            { label: config.labels.type, value: values.type },
            { label: config.labels.name, value: values.name },
        ];
        if (isCodeRequired) {
            checks.push({ label: config.labels.code, value: values.code });
        }
        return validateRequiredChecks(checks);
    }, [
        config.labels.code,
        config.labels.name,
        config.labels.type,
        values.code,
        values.name,
        values.type,
        values.isSubAccount,
        values.autoCode,
    ]);
    const saveDisabled = saving || Boolean(validationMessage) || !hasChanges;

    useWorkspaceDirtyRegistration({
        pageId: 'accounts',
        tabId: activeLevel2Tab?.id,
        dirty: hasChanges,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        if (!hasChanges) {
            rejectCrudFormAction('Belum ada perubahan untuk disimpan.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Menyimpan akun perkiraan...' : 'Membuat akun perkiraan...',
            successMessage: isDetail ? 'Akun perkiraan berhasil diperbarui.' : 'Akun perkiraan berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = buildAccountPayload(values);
                const response = isDetail
                    ? await updateBackendResource('accounts', recordId, payload)
                    : await createBackendResource('accounts', payload);

                return {
                    payload,
                    savedRecord: response?.data ?? null,
                };
            },
            getErrorMessage: (error) => getBackendErrorMessage(error, 'Akun perkiraan gagal disimpan.'),
            onSuccess: async ({ payload, savedRecord }) => {
                await onReload?.();

                if (!isDetail && savedRecord?.id) {
                    onOpenDetail?.({
                        recordId: String(savedRecord.id),
                        label: savedRecord.name ?? payload.name,
                        tabLabel: savedRecord.name ?? payload.name,
                    });
                }
            },
        });
    }

    async function handleDelete() {
        if (!recordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Menghapus akun perkiraan...',
            successMessage: 'Akun perkiraan berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteModalOpen(false),
            execute: () => deleteBackendResource('accounts', recordId),
            getErrorMessage: (error) => getBackendErrorMessage(error, 'Akun perkiraan gagal dihapus.'),
            onSuccess: async () => {
                await onReload?.();
                onCloseDetail?.(recordId);
            },
        });
    }

    return (
        <ModuleFormTemplate
            form={{
                tabs: tabs,
                saveLabel: 'Simpan',
            }}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={handleSave}
            actionsSlot={
                isDetail ? (
                    <DockActionButton
                        label={saving ? 'Memproses...' : 'Hapus'}
                        tone="danger"
                        icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                        disabled={saving}
                        onClick={() => setDeleteModalOpen(true)}
                    />
                ) : null
            }
        >
            <div className="flex-1 min-h-0">
                {activeTabId === 'opening-balance' ? (
                    <AccountsOpeningBalanceTab config={config} values={values} onChange={handleChange} />
                ) : activeTabId === 'others' ? (
                    <AccountsOthersTab config={config} values={values} isDetail={isDetail} onChange={handleChange} />
                ) : activeTabId === 'children' ? (
                    <AccountsChildrenTab values={values} />
                ) : (
                    <AccountsGeneralTab config={config} values={values} isDetail={isDetail} onChange={handleChange} />
                )}
            </div>

            <ConfirmationModal
                open={deleteModalOpen}
                title="Hapus akun perkiraan"
                message={
                    values.childAccounts && values.childAccounts.length > 0 ? (
                        <div>
                            <p className="mb-2">
                                Akun <strong>"{values.name || values.code}"</strong> memiliki sub-akun berikut yang akan terputus hubungannya (menjadi akun utama tanpa induk):
                            </p>
                            <ul className="mb-3 list-disc pl-5 text-sm text-slate-500 max-h-[150px] overflow-y-auto">
                                {values.childAccounts.map((child) => (
                                    <li key={child.id}>
                                        {child.code} - {child.name}
                                    </li>
                                ))}
                            </ul>
                            <p>Apakah Anda yakin ingin melanjutkan penghapusan?</p>
                        </div>
                    ) : (
                        `Akun "${values.name || values.code || 'ini'}" akan dihapus. Lanjutkan?`
                    )
                }
                confirmLabel="Hapus"
                confirmVariant="danger"
                confirmLoading={saving}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
        </ModuleFormTemplate>
    );
}

