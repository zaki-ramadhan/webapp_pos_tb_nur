import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import TextInput from '@/components/ui/TextInput';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
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
import { GroupAccessActionDock, GroupAccessGeneralSection } from '@/features/workspace/modules/group-access/groupAccessViewShared';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';

export default function GroupAccessFormView({ pageId, activeLevel2Tab, form, onOpenDetail, onCloseDetail, onRefresh }) {
    const [activeTabId, setActiveTabId] = useState(form.defaultTabId ?? form.tabs[0]?.id ?? 'general');
    const [generalValues, setGeneralValues] = useState(() => buildGeneralState(form.general));
    const [permissionCategories, setPermissionCategories] = useState(() =>
        buildInitialPermissionCategories(form.permissions, form.permissionPreset),
    );
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const initialGeneralSnapshot = useMemo(() => buildGeneralState(form.general), [form.general]);
    const initialPermissionSnapshot = useMemo(
        () => buildInitialPermissionCategories(form.permissions, form.permissionPreset),
        [form.permissionPreset, form.permissions],
    );

    useEffect(() => {
        setActiveTabId(form.defaultTabId ?? form.tabs[0]?.id ?? 'general');
        setGeneralValues(buildGeneralState(form.general));
        setPermissionCategories(buildInitialPermissionCategories(form.permissions, form.permissionPreset));
        setStatus({ tone: '', message: '' });
        setIsDeleteConfirmationOpen(false);
    }, [form]);

    const isDirty = useMemo(
        () =>
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
                onCloseDetail?.(recordId);
            },
        });
    }

    return (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_110px] lg:items-start">
            <div className="rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                <PreferencesTabs
                    tabs={form.tabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                />

                <div className="p-4 md:p-5">
                    <CrudStatusMessage status={status} className="mb-4" />
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
            </div>

            <GroupAccessActionDock
                actions={form.actions.map((action) => ({
                    ...action,
                    loading:
                        action.id === 'save'
                            ? saving
                            : action.id === 'delete'
                              ? saving
                              : false,
                    disabled:
                        action.id === 'save'
                            ? saving || Boolean(validationMessage)
                            : action.id === 'delete'
                              ? !isDetail || saving
                              : Boolean(action.disabled) || saving,
                }))}
                isDirty={isDirty && !validationMessage}
                onSave={handleSave}
                onDelete={requestDelete}
            />

            <ConfirmationModal
                open={isDeleteConfirmationOpen}
                onClose={() => setIsDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title={deleteConfirmation.title}
                message={deleteConfirmationMessage}
                confirmLabel={deleteConfirmation.confirmLabel}
                cancelLabel={deleteConfirmation.cancelLabel}
                closeLabel={deleteConfirmation.closeLabel}
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}
