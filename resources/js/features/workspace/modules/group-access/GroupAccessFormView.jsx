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
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [isDuplicated, setIsDuplicated] = useState(false);

    const recordId = activeLevel2Tab?.tabType === 'detail' && !isDuplicated ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const initialGeneralSnapshot = useMemo(() => buildGeneralState(form.general), [form.general]);
    const initialPermissionSnapshot = useMemo(
        () => buildInitialPermissionCategories(form.permissions, form.permissionPreset),
        [form.permissionPreset, form.permissions],
    );

    useEffect(() => {
        setIsDuplicated(false);
        setActiveTabId(form.defaultTabId ?? form.tabs[0]?.id ?? 'general');
        setGeneralValues(buildGeneralState(form.general));
        setPermissionCategories(buildInitialPermissionCategories(form.permissions, form.permissionPreset));
        setStatus({ tone: '', message: '' });
        setIsDeleteConfirmationOpen(false);
    }, [form]);

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

    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

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
        <ModuleFormTemplate
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
                title={deleteConfirmation.title}
                message={
                    generalValues.selectedUsers && generalValues.selectedUsers.length > 0 ? (
                        <div>
                            <p className="mb-2">
                                Grup akses <strong>"{generalValues.groupName}"</strong> memiliki {generalValues.selectedUsers.length} pengguna terdaftar yang akan kehilangan akses perizinan dari grup ini:
                            </p>
                            <ul className="mb-3 list-disc pl-5 text-sm text-slate-500 max-h-[150px] overflow-y-auto">
                                {generalValues.selectedUsers.map((user, idx) => (
                                    <li key={user.id ?? idx}>
                                        {user.label || user.name}
                                    </li>
                                ))}
                            </ul>
                            <p>Apakah Anda yakin ingin melanjutkan penghapusan?</p>
                        </div>
                    ) : (
                        deleteConfirmationMessage
                    )
                }
                confirmLabel={deleteConfirmation.confirmLabel}
                cancelLabel={deleteConfirmation.cancelLabel}
                closeLabel={deleteConfirmation.closeLabel}
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}
