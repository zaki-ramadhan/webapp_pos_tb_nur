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
import { AccountsDockActions } from './accountsViewShared';

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
    const [saving, setSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const initialValues = useMemo(() => buildFormState(sourceRecord), [sourceRecord]);

    useEffect(() => {
        setActiveTabId((isDetail ? config.detailTabs : config.createTabs)[0]?.id ?? 'general');
        setValues(initialValues);
    }, [config.createTabs, config.detailTabs, initialValues, isDetail]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const dockActions = isDetail ? config.dock.detailActions : config.dock.createActions;
    const validationMessage = useMemo(
        () =>
            validateRequiredChecks([
                { label: config.labels.type, value: values.type },
                { label: config.labels.code, value: values.code },
                { label: config.labels.name, value: values.name },
            ]),
        [config.labels.code, config.labels.name, config.labels.type, values.code, values.name, values.type],
    );
    const hasChanges = useMemo(
        () => !areComparableValuesEqual(buildComparableFormValues(initialValues), buildComparableFormValues(values)),
        [initialValues, values],
    );
    const saveDisabled = saving || Boolean(validationMessage) || !hasChanges;

    useWorkspaceDirtyRegistration({
        pageId: 'accounts',
        tabId: activeLevel2Tab?.id,
        dirty: hasChanges,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage);
            return;
        }

        if (!hasChanges) {
            rejectCrudFormAction('Belum ada perubahan untuk disimpan.');
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Menyimpan akun perkiraan...' : 'Membuat akun perkiraan...',
            successMessage: isDetail ? 'Akun perkiraan berhasil diperbarui.' : 'Akun perkiraan berhasil dibuat.',
            setSaving,
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
        <>
            <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                <PreferencesTabs
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                />

                <div className="flex min-h-[640px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                    <div className="order-2 min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-3 py-4 sm:px-4 lg:order-1">
                        <div className="max-w-[1260px]">
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
                    </div>

                    <div className="order-1 flex justify-end lg:order-2 lg:shrink-0">
                        <AccountsDockActions
                            actions={dockActions}
                            onSave={handleSave}
                            onDelete={() => setDeleteModalOpen(true)}
                            saveDisabled={saveDisabled}
                            saving={saving}
                        />
                    </div>
                </div>
            </div>
            <ConfirmationModal
                open={deleteModalOpen}
                title="Hapus akun perkiraan"
                message={`Akun "${values.name || values.code || 'ini'}" akan dihapus. Lanjutkan?`}
                confirmLabel="Hapus"
                confirmVariant="danger"
                confirmLoading={saving}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}
