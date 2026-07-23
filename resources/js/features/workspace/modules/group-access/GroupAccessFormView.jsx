import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import TextInput from '@/components/ui/TextInput';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import {
    buildGroupAccessComparableState,
    buildGroupAccessPayload,
    buildGeneralState,
    buildInitialPermissionCategories,
    normalizeSelectedUsers,
    resolveDeleteConfirmationMessage,
} from './groupAccessUtils';
import GroupAccessRightsView from '@/features/workspace/modules/group-access/GroupAccessRightsView';
import { GroupAccessGeneralSection } from '@/features/workspace/modules/group-access/groupAccessViewShared';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';

export default function GroupAccessFormView({ pageId, activeLevel2Tab, form, onOpenDetail, onCloseDetail, onRefresh }) {
    const [activeTabId, setActiveTabId] = useState(form.defaultTabId ?? form.tabs[0]?.id ?? 'general');
    const [generalValues, setGeneralValues] = useState(() => buildGeneralState(form.general));
    const [permissionCategories, setPermissionCategories] = useState(() =>
        buildInitialPermissionCategories(form.permissions, form.permissionPreset),
    );
    const [isDuplicated, setIsDuplicated] = useState(false);

    const recordId = activeLevel2Tab?.tabType === 'detail' && !isDuplicated ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const initialGeneralSnapshot = useMemo(() => buildGeneralState(form.general), [form.general]);
    const initialPermissionSnapshot = useMemo(
        () => buildInitialPermissionCategories(form.permissions, form.permissionPreset),
        [form.permissionPreset, form.permissions],
    );

    const formGeneralSerialized = JSON.stringify(form.general);
    const formPermissionsSerialized = JSON.stringify(form.permissions);

    useEffect(() => {
        setIsDuplicated(false);
        setActiveTabId(form.defaultTabId ?? form.tabs[0]?.id ?? 'general');
        setGeneralValues(buildGeneralState(form.general));
        setPermissionCategories(buildInitialPermissionCategories(form.permissions, form.permissionPreset));
        setStatus({ tone: '', message: '' });
        setIsDeleteConfirmationOpen(false);
    }, [recordId, formGeneralSerialized, formPermissionsSerialized, form.defaultTabId, form.permissionPreset]);

    const isDirty = useMemo(
        () =>
            isDuplicated ||
            JSON.stringify(buildGroupAccessComparableState(generalValues, permissionCategories)) !==
            JSON.stringify(buildGroupAccessComparableState(initialGeneralSnapshot, initialPermissionSnapshot)),
        [generalValues, initialGeneralSnapshot, initialPermissionSnapshot, permissionCategories],
    );
    const validationMessage = useMemo(() => {
        if (!String(generalValues.groupName ?? '').trim()) {
            return 'Nama Grup wajib diisi.';
        }

        return '';
    }, [generalValues.groupName]);

    const {
        status,
        setStatus,
        saving,
        setSaving,
        deleteConfirmationOpen: isDeleteConfirmationOpen,
        setDeleteConfirmationOpen: setIsDeleteConfirmationOpen,
        saveDisabled,
    } = useTransactionForm({ validationMessage, isDirty });

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });
    const deleteConfirmation = form.deleteConfirmation ?? {};
    const deleteConfirmationMessage = resolveDeleteConfirmationMessage(
        deleteConfirmation.messageTemplate,
        generalValues.groupName,
    );

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        if (!isDirty) {
            rejectCrudFormAction('Belum ada perubahan untuk disimpan.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Menyimpan akses grup...' : 'Membuat akses grup...',
            successMessage: isDetail ? 'Akses grup berhasil diperbarui.' : 'Akses grup berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: (error) => getBackendErrorMessage(error, 'Akses grup gagal disimpan.'),
            execute: async () => {
                const payload = buildGroupAccessPayload(generalValues, permissionCategories);
                const response = isDetail
                    ? await updateBackendResource('access-groups', recordId, payload)
                    : await createBackendResource('access-groups', payload);

                return response?.data ?? null;
            },
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.name ?? generalValues.groupName,
                        tabLabel: record.name ?? generalValues.groupName,
                    });
                    setGeneralValues(buildGeneralState(form.general));
                    setPermissionCategories(buildInitialPermissionCategories(form.permissions, form.permissionPreset));
                } else if (isDetail && record?.name && activeLevel2Tab?.id) {
                    window.dispatchEvent(
                        new CustomEvent('workspace:update-tab-label', {
                            detail: {
                                pageId,
                                tabId: activeLevel2Tab.id,
                                label: record.name,
                            },
                        })
                    );
                }
            },
        });
    }

    function requestDelete() {
        if (!isDetail || saving) {
            return;
        }

        setIsDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!isDetail) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Menghapus akses grup...',
            successMessage: 'Akses grup berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: (error) => getBackendErrorMessage(error, 'Akses grup gagal dihapus.'),
            onStart: () => setIsDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('access-groups', recordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
            },
        });
    }

    return (
        <ModuleFormTemplate
            validationMessage={validationMessage}
            form={form}
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
                        onClick={requestDelete}
                    />
                ) : null
            }
        >
            <div className="flex-1 min-h-0">
                {activeTabId === 'general' ? (
                    <GroupAccessGeneralSection
                        general={form.general}
                        values={generalValues}
                        onChangeName={(nextValue) =>
                            setGeneralValues((currentValues) => ({
                                ...currentValues,
                                groupName: nextValue,
                            }))
                        }
                        onChangeAccessLimitation={(nextValue) =>
                            setGeneralValues((currentValues) => ({
                                ...currentValues,
                                accessLimitationId: nextValue,
                            }))
                        }
                        onChangeAccessLimitDays={(nextValue) =>
                            setGeneralValues((currentValues) => ({
                                ...currentValues,
                                accessLimitDays: nextValue,
                            }))
                        }
                        onChangeAccessLimitStartHour={(nextValue) =>
                            setGeneralValues((currentValues) => ({
                                ...currentValues,
                                accessLimitStartHour: nextValue,
                            }))
                        }
                        onChangeAccessLimitEndHour={(nextValue) =>
                            setGeneralValues((currentValues) => ({
                                ...currentValues,
                                accessLimitEndHour: nextValue,
                            }))
                        }
                        onAddUser={(nextUser) =>
                            setGeneralValues((currentValues) => {
                                const currentUsers = normalizeSelectedUsers(currentValues.selectedUsers);

                                if (currentUsers.some((user) => String(user.id ?? '') === String(nextUser.id ?? ''))) {
                                    return currentValues;
                                }

                                return {
                                    ...currentValues,
                                    selectedUsers: [...currentUsers, nextUser],
                                };
                            })
                        }
                        onRemoveUser={(selectedUser) =>
                            setGeneralValues((currentValues) => ({
                                ...currentValues,
                                selectedUsers: normalizeSelectedUsers(currentValues.selectedUsers).filter((item) =>
                                    selectedUser?.id != null
                                        ? String(item.id ?? '') !== String(selectedUser.id)
                                        : item.label !== selectedUser?.label,
                                ),
                            }))
                        }
                        textInput={TextInput}
                    />
                ) : (
                    <GroupAccessRightsView
                        permissions={form.permissions}
                        categories={permissionCategories}
                        onUpdateCategories={setPermissionCategories}
                    />
                )}
            </div>

            <ConfirmationModal
                open={isDeleteConfirmationOpen}
                onClose={() => setIsDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi"
                message={
                    generalValues.selectedUsers && generalValues.selectedUsers.length > 0 ? (
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${generalValues.groupName}\n\nGrup akses ini memiliki ${generalValues.selectedUsers.length} pengguna terdaftar yang akan kehilangan akses perizinan dari grup ini.`
                    ) : (
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${generalValues.groupName}`
                    )
                }
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}
