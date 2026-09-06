import { useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import RadioField from '@/components/ui/RadioField';
import TextInput from '@/components/ui/TextInput';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import useBackendResource from '@/features/workspace/backend/useBackendResource';
import { toUserPayload } from '@/features/workspace/backend/workspaceBackendAdapters';
import AccessTypeField from './components/AccessTypeField';
import {
    USER_FORM_TABS,
    buildInitialValues,
    buildPayloadFromInput,
    canDeleteUser,
    isSuperAdminEmail,
    resolveUserIdentifier,
    validateUserForm,
} from './userFormShared';

export default function UserFormView({ form, activeLevel2Tab, tableRows = [], onRefresh, onOpenDetail, lookupData }) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        return recordId ? (tableRows.find((r) => String(r.id) === String(recordId)) ?? null) : null;
    }, [activeLevel2Tab, tableRows]);

    const recordId = detailRow ? String(detailRow.id) : null;
    const isDetail = Boolean(recordId);

    const pageProps = usePage()?.props ?? {};
    const authUser = pageProps.auth?.user || pageProps.user;
    const actorEmail = String(authUser?.email ?? '').toLowerCase();
    const isActorSuperAdmin = isSuperAdminEmail(actorEmail);
    const isSelf = Boolean(
        detailRow?.id && authUser?.id && String(detailRow.id) === String(authUser.id)
    );

    const canDelete = useMemo(
        () => canDeleteUser(detailRow, isDetail, isSelf, isActorSuperAdmin, tableRows),
        [detailRow, isDetail, isSelf, isActorSuperAdmin, tableRows]
    );

    const initialValues = useMemo(() => buildInitialValues(detailRow), [detailRow]);
    const [values, setValues] = useState(initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const isDirty = useMemo(() => (
        values.name !== initialValues.name ||
        values.email !== initialValues.email ||
        values.phone !== initialValues.phone ||
        values.password !== initialValues.password ||
        values.isActive !== initialValues.isActive ||
        JSON.stringify(values.accessGroupIds) !== JSON.stringify(initialValues.accessGroupIds) ||
        values.accessType !== initialValues.accessType
    ), [values, initialValues]);

    useFormValuesSync({
        initialValues,
        recordId,
        values,
        isDirty,
        setValues,
        onSync: () => setStatus({ tone: '', message: '' }),
    });

    const { store, update, remove } = useBackendResource({ resource: 'users' });

    const isEmailLocked = isDetail && Boolean(initialValues.initialEmail);
    const isPhoneLocked = isDetail && Boolean(initialValues.initialPhone);

    const validationMessage = useMemo(
        () => validateUserForm(values, isDetail, isEmailLocked),
        [isDetail, isEmailLocked, values.phone, values.email]
    );

    const saveDisabled = saving || Boolean(validationMessage) || (isDetail && !isDirty);

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, {
                setStatus,
                fieldErrors: { phone: validationMessage },
            });
            return;
        }

        if (isDetail) {
            const payload = toUserPayload({
                ...values,
                name: values.name,
                email: values.email?.trim() || null,
                phone: values.phone?.trim() || null,
                roleIds: detailRow?.roleIds ?? (values.accessType === 'super_admin' ? [1] : [2]),
            });

            await executeCrudFormAction({
                loadingMessage: 'Sedang menyimpan perubahan pengguna.',
                successMessage: 'Pengguna berhasil diperbarui.',
                setSaving,
                setStatus,
                getErrorMessage: (err) => getBackendErrorMessage(err, 'Terjadi kesalahan saat menyimpan perubahan.'),
                execute: () => update(recordId, payload),
                onSuccess: async () => {
                    await onRefresh?.();
                },
            });
            return;
        }

        const inputVal = values.phone.trim();
        const payload = buildPayloadFromInput(inputVal, values, lookupData, isDetail, detailRow);

        await executeCrudFormAction({
            loadingMessage: 'Sedang menyimpan pengguna baru.',
            successMessage: 'Pengguna berhasil disimpan.',
            setSaving,
            setStatus,
            getErrorMessage: (err) => getBackendErrorMessage(err, 'Terjadi kesalahan saat menyimpan data.'),
            execute: () => store(payload),
            onSuccess: async (res) => {
                await onRefresh?.();
                const record = res?.data ?? res;
                if (record?.id && onOpenDetail) {
                    onOpenDetail({ recordId: String(record.id), label: record.name ?? inputVal, tabLabel: record.name ?? inputVal });
                    if (activeLevel2Tab?.id) {
                        window.dispatchEvent(
                            new CustomEvent('workspace:close-tab', {
                                detail: { tabId: activeLevel2Tab.id },
                            })
                        );
                    }
                }
            },
        });
    }

    async function handleDelete() {
        setDeleteConfirmationOpen(false);
        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus pengguna.',
            successMessage: 'Pengguna berhasil dihapus.',
            setSaving,
            setStatus,
            execute: () => remove(recordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(
                    new CustomEvent('workspace:close-tab', {
                        detail: { tabId: activeLevel2Tab?.id },
                    })
                );
            },
        });
    }

    const resolvedForm = useMemo(() => ({ ...form, tabs: USER_FORM_TABS }), [form]);
    const userIdentifier = useMemo(() => resolveUserIdentifier(values), [values]);

    return (
        <>
            <ModuleFormTemplate
                form={resolvedForm}
                activeTabId="users-general"
                setActiveTabId={() => {}}
                status={status}
                saving={saving}
                saveDisabled={saveDisabled}
                onSave={handleSave}
                actionsSlot={
                    canDelete ? (
                        <DockActionButton
                            label={saving ? 'Memproses...' : 'Hapus'}
                            tone="danger"
                            icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                            disabled={saving}
                            onClick={() => setDeleteConfirmationOpen(true)}
                        />
                    ) : null
                }
            >
                {isDetail ? (
                    <div className="flex-1 min-h-0 pt-2">
                        <div className="grid gap-x-8 gap-y-2.5 lg:grid-cols-[140px_minmax(0,1fr)] lg:items-center max-w-[500px]">
                            <label className="text-xs sm:text-sm text-section-tab-accent-text font-normal">
                                Nama
                            </label>
                            <div className="w-full">
                                <TextInput
                                    id="detail-name"
                                    name="name"
                                    value={values.name}
                                    readOnly
                                    disabled
                                    className="h-[36px] w-full rounded-[4px] border-ui-border bg-slate-50 text-slate-700"
                                    inputClassName="text-xs sm:text-sm"
                                />
                            </div>

                            <label className="text-xs sm:text-sm text-section-tab-accent-text font-normal">
                                No Handphone
                            </label>
                            <div className="w-full">
                                <TextInput
                                    id="detail-phone"
                                    name="phone"
                                    type="tel"
                                    value={values.phone}
                                    onChange={!isPhoneLocked ? (e) => setValues({ ...values, phone: e.target.value.replace(/-/g, '') }) : undefined}
                                    readOnly={isPhoneLocked}
                                    disabled={isPhoneLocked}
                                    className={`h-[36px] w-full rounded-[4px] border-ui-border ${isPhoneLocked ? 'bg-slate-50 text-slate-700' : 'bg-white text-slate-900'}`}
                                    inputClassName="text-xs sm:text-sm"
                                />
                            </div>

                            <label className="text-xs sm:text-sm text-section-tab-accent-text font-normal">
                                Email
                            </label>
                            <div className="w-full">
                                <TextInput
                                    id="detail-email"
                                    name="email"
                                    type="email"
                                    value={values.email}
                                    onChange={!isEmailLocked ? (e) => setValues({ ...values, email: e.target.value }) : undefined}
                                    readOnly={isEmailLocked}
                                    disabled={isEmailLocked}
                                    className={`h-[36px] w-full rounded-[4px] border-ui-border ${isEmailLocked ? 'bg-slate-50 text-slate-700' : 'bg-white text-slate-900'}`}
                                    inputClassName="text-xs sm:text-sm"
                                />
                            </div>

                            <label className="text-xs sm:text-sm text-section-tab-accent-text font-normal">
                                Jenis Akses
                            </label>
                            <div className="w-full">
                                <TextInput
                                    id="detail-access-type"
                                    name="accessType"
                                    value={values.accessTypeLabel}
                                    readOnly
                                    disabled
                                    className="h-[36px] w-full rounded-[4px] border-ui-border bg-slate-50 text-slate-700"
                                    inputClassName="text-xs sm:text-sm"
                                />
                            </div>

                            <label className="text-xs sm:text-sm text-section-tab-accent-text font-normal">
                                Status
                            </label>
                            <div className="flex items-center gap-8 pt-0.5">
                                <RadioField
                                    id="detail-status-active"
                                    name="detail-user-status"
                                    label="Aktif"
                                    checked={values.isActive === true}
                                    onChange={() => setValues({ ...values, isActive: true })}
                                    inputClassName="h-3.5 w-3.5"
                                    containerClassName="w-auto inline-flex items-center"
                                />
                                <RadioField
                                    id="detail-status-inactive"
                                    name="detail-user-status"
                                    label="Nonaktif"
                                    checked={values.isActive === false}
                                    onChange={() => setValues({ ...values, isActive: false })}
                                    inputClassName="h-3.5 w-3.5"
                                    containerClassName="w-auto inline-flex items-center"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 pt-2">
                        <h2 className="text-[15px] text-text-darkest leading-normal font-normal mb-5">
                            Tambahkan pengguna untuk mengakses database ini dengan memasukkan no handphone/emailnya
                        </h2>

                        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start max-w-[980px]">
                            <label className="pt-2 text-xs sm:text-sm text-section-tab-accent-text font-normal">
                                No Handphone/Email <span className="text-tab-active-border-t">*</span>
                            </label>
                            <div className="max-w-[420px] w-full">
                                <TextInput
                                    id="phone"
                                    name="phone"
                                    value={values.phone}
                                    onChange={(e) => setValues({ ...values, phone: e.target.value.replace(/-/g, '') })}
                                    placeholder=""
                                    className="h-[36px] w-full rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm"
                                />
                            </div>

                            <label className="pt-1.5 text-xs sm:text-sm text-section-tab-accent-text font-normal">Jenis Akses</label>
                            <AccessTypeField
                                value={values.accessType}
                                onChange={(v) => setValues({ ...values, accessType: v })}
                                isActorSuperAdmin={isActorSuperAdmin}
                            />

                            <label className="pt-1.5 text-xs sm:text-sm text-section-tab-accent-text font-normal">Status</label>
                            <div className="flex items-center gap-8 pt-0.5">
                                <RadioField
                                    id="status-active"
                                    name="user-status"
                                    label="Aktif"
                                    checked={values.isActive === true}
                                    onChange={() => setValues({ ...values, isActive: true })}
                                    inputClassName="h-3.5 w-3.5"
                                    containerClassName="w-auto inline-flex items-center"
                                />
                                <RadioField
                                    id="status-inactive"
                                    name="user-status"
                                    label="Nonaktif"
                                    checked={values.isActive === false}
                                    onChange={() => setValues({ ...values, isActive: false })}
                                    inputClassName="h-3.5 w-3.5"
                                    containerClassName="w-auto inline-flex items-center"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </ModuleFormTemplate>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi"
                message={`Apakah Anda yakin ingin menghapus pengguna "${userIdentifier}"?`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                tone="danger"
            />
        </>
    );
}
