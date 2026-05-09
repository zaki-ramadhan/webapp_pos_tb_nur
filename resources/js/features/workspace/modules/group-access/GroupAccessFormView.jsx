import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SystemErrorModal from '@/components/ui/SystemErrorModal';
import TextInput from '@/components/ui/TextInput';
import {
    buildGeneralState,
    buildInitialPermissionCategories,
    resolveDeleteConfirmationMessage,
} from '@/features/workspace/modules/groupAccessUtils';
import GroupAccessRightsView from '@/features/workspace/modules/group-access/GroupAccessRightsView';
import {
    GroupAccessActionDock,
    GroupAccessGeneralSection,
} from '@/features/workspace/modules/group-access/groupAccessViewShared';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';

export default function GroupAccessFormView({ form }) {
    const [activeTabId, setActiveTabId] = useState(form.defaultTabId ?? form.tabs[0]?.id ?? 'general');
    const [generalValues, setGeneralValues] = useState(() => buildGeneralState(form.general));
    const [permissionCategories, setPermissionCategories] = useState(() =>
        buildInitialPermissionCategories(form.permissions, form.permissionPreset),
    );
    const [isSystemErrorOpen, setIsSystemErrorOpen] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const initialGeneralSnapshot = useMemo(() => JSON.stringify(buildGeneralState(form.general)), [form.general]);
    const initialPermissionSnapshot = useMemo(
        () => JSON.stringify(buildInitialPermissionCategories(form.permissions, form.permissionPreset)),
        [form.permissionPreset, form.permissions],
    );

    useEffect(() => {
        setActiveTabId(form.defaultTabId ?? form.tabs[0]?.id ?? 'general');
        setGeneralValues(buildGeneralState(form.general));
        setPermissionCategories(buildInitialPermissionCategories(form.permissions, form.permissionPreset));
        setIsSystemErrorOpen(false);
        setIsDeleteConfirmationOpen(false);
    }, [form]);

    const isDirty =
        JSON.stringify(generalValues) !== initialGeneralSnapshot ||
        JSON.stringify(permissionCategories) !== initialPermissionSnapshot;
    const deleteConfirmation = form.deleteConfirmation ?? {};
    const deleteConfirmationMessage = resolveDeleteConfirmationMessage(
        deleteConfirmation.messageTemplate,
        generalValues.groupName,
    );

    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_110px] xl:items-start">
            <div className="rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                <PreferencesTabs
                    tabs={form.tabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                />

                <div className="p-4 md:p-5">
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
                            onRemoveUser={(userName) =>
                                setGeneralValues((currentValues) => ({
                                    ...currentValues,
                                    selectedUsers: currentValues.selectedUsers.filter((item) => item !== userName),
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
                actions={form.actions}
                isDirty={isDirty}
                onSave={() => setIsSystemErrorOpen(true)}
                onDelete={() => setIsDeleteConfirmationOpen(true)}
            />

            <SystemErrorModal
                open={isSystemErrorOpen}
                onClose={() => setIsSystemErrorOpen(false)}
                title={form.systemErrorDemo?.title}
                description={form.systemErrorDemo?.description}
                messages={form.systemErrorDemo?.messages}
                copyLabel={form.systemErrorDemo?.copyLabel}
                confirmLabel={form.systemErrorDemo?.confirmLabel}
            />

            <ConfirmationModal
                open={isDeleteConfirmationOpen}
                onClose={() => setIsDeleteConfirmationOpen(false)}
                onConfirm={() => setIsDeleteConfirmationOpen(false)}
                title={deleteConfirmation.title}
                message={deleteConfirmationMessage}
                confirmLabel={deleteConfirmation.confirmLabel}
                cancelLabel={deleteConfirmation.cancelLabel}
                closeLabel={deleteConfirmation.closeLabel}
            />
        </div>
    );
}
