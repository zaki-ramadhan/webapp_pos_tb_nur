import { useEffect, useMemo, useState } from 'react';
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

const USER_FORM_TABS = [{ id: 'users-general', label: 'Pengguna' }];

function AccessTypeField({ value, onChange }) {
    const descriptions = {
        kasir: 'Kasir memiliki akses terbatas hanya untuk modul Penjualan & Penerimaan Penjualan. Modul lainnya dibatasi otomatis.',
        super_admin: 'Owner memiliki hak akses penuh tanpa batas ke seluruh modul dan pengaturan aplikasi.',
    };

    return (
        <div className="grid gap-3">
            <div className="flex items-center gap-16 pt-0.5">
                <RadioField
                    id="access-kasir"
                    name="access-type"
                    label="Kasir"
                    checked={value === 'kasir' || value === 'operator'}
                    onChange={() => onChange('kasir')}
                    inputClassName="h-5 w-5"
                    containerClassName="w-auto inline-flex items-center"
                />
                <RadioField
                    id="access-super-admin"
                    name="access-type"
                    label="Owner"
                    checked={value === 'super_admin' || value === 'administrator' || value === 'owner'}
                    onChange={() => onChange('super_admin')}
                    inputClassName="h-5 w-5"
                    containerClassName="w-auto inline-flex items-center"
                />
            </div>
            {descriptions[value === 'operator' ? 'kasir' : (value === 'administrator' || value === 'owner' ? 'super_admin' : value)] && (
                <div className="flex items-center gap-3 pt-0.5 mt-1">
                    <span className="block h-6 w-[5px] rounded-[2px] bg-bg-bullet-gray" aria-hidden="true" />
                    <p className="text-xs sm:text-sm italic leading-6 text-tab-active-border-t">
                        {descriptions[value === 'operator' ? 'kasir' : (value === 'administrator' || value === 'owner' ? 'super_admin' : value)]}
                    </p>
                </div>
            )}
        </div>
    );
}

function buildInitialValues(detailRow) {
    const roleIds = detailRow?.roleIds ?? [];
    const isSuperAdmin = roleIds.includes(1) ||
        detailRow?.accessType?.toLowerCase()?.includes('admin') ||
        detailRow?.accessType?.toLowerCase()?.includes('owner');

    return {
        name: detailRow?.name ?? '',
        email: detailRow?.email ?? '',
        phone: detailRow?.phone ?? '',
        password: '',
        isActive: detailRow?.isActive ?? true,
        accessGroupIds: detailRow?.accessGroupIds ?? [],
        accessType: isSuperAdmin ? 'super_admin' : 'kasir',
    };
}

export default function UserFormView({ form, activeLevel2Tab, tableRows = [], onRefresh, onOpenDetail, lookupData }) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        return recordId ? (tableRows.find((r) => String(r.id) === String(recordId)) ?? null) : null;
    }, [activeLevel2Tab, tableRows]);

    const recordId = detailRow ? String(detailRow.id) : null;
    const isDetail = Boolean(recordId);

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

    const validationMessage = useMemo(() => {
        const nameVal = values.name?.trim() ?? '';
        if (!nameVal) {
            return 'Nama pengguna wajib diisi.';
        }
        const emailVal = values.email?.trim() ?? '';
        const phoneVal = values.phone?.trim() ?? '';
        if (!emailVal && !phoneVal) {
            return 'Isikan minimal salah satu: Email atau No Handphone.';
        }
        if (emailVal) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(emailVal)) {
                return 'Format email tidak valid.';
            }
        }
        if (!isDetail && values.password && values.password.length < 6) {
            return 'Kata sandi minimal 6 karakter.';
        }
        if (isDetail && values.password && values.password.length < 6) {
            return 'Kata sandi baru minimal 6 karakter.';
        }
        return '';
    }, [isDetail, values.name, values.email, values.phone, values.password]);

    const saveDisabled = saving || Boolean(validationMessage) || (isDetail && !isDirty);

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, {
                setStatus,
            });
            return;
        }

        const adminRole = lookupData?.roles?.find((r) => r.code === 'super_admin' || r.code === 'admin' || r.name?.toLowerCase()?.includes('admin') || r.name?.toLowerCase()?.includes('super') || r.name?.toLowerCase()?.includes('owner'));
        const kasirRole = lookupData?.roles?.find((r) => r.code === 'kasir' || r.code === 'operator' || r.name?.toLowerCase()?.includes('kasir') || r.name?.toLowerCase()?.includes('operator'));

        const isOwner = values.accessType === 'super_admin' || values.accessType === 'administrator' || values.accessType === 'owner';
        const roleIds = isOwner
            ? [adminRole?.id ?? 1]
            : [kasirRole?.id ?? 2];

        const payload = toUserPayload({
            ...values,
            password: values.password || (isDetail ? undefined : 'password'),
            roleIds,
        });

        if (isDetail) {
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
        } else {
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
                        onOpenDetail({ recordId: String(record.id), label: record.name ?? values.name, tabLabel: record.name ?? values.name });
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
                    isDetail ? (
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
                <div className="flex-1 min-h-0 pt-2">
                    <div className="grid gap-x-8 gap-y-3.5 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center max-w-[560px]">
                        <label htmlFor="user-name" className="text-xs sm:text-sm text-section-tab-accent-text font-normal">
                            Nama <span className="text-tab-active-border-t">*</span>
                        </label>
                        <div className="w-full">
                            <TextInput
                                id="user-name"
                                name="name"
                                value={values.name}
                                onChange={(e) => setValues({ ...values, name: e.target.value })}
                                placeholder="Masukkan nama pengguna"
                                className="h-[36px] w-full rounded-md border-ui-border"
                                inputClassName="text-xs sm:text-sm"
                            />
                        </div>

                        <label htmlFor="user-email" className="text-xs sm:text-sm text-section-tab-accent-text font-normal">
                            Email
                        </label>
                        <div className="w-full">
                            <TextInput
                                id="user-email"
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={(e) => setValues({ ...values, email: e.target.value })}
                                placeholder="contoh@email.com"
                                className="h-[36px] w-full rounded-md border-ui-border"
                                inputClassName="text-xs sm:text-sm"
                            />
                        </div>

                        <label htmlFor="user-phone" className="text-xs sm:text-sm text-section-tab-accent-text font-normal">
                            No Handphone
                        </label>
                        <div className="w-full">
                            <TextInput
                                id="user-phone"
                                name="phone"
                                type="tel"
                                value={values.phone}
                                onChange={(e) => setValues({ ...values, phone: e.target.value })}
                                placeholder="08123456789"
                                className="h-[36px] w-full rounded-md border-ui-border"
                                inputClassName="text-xs sm:text-sm"
                            />
                        </div>

                        <label htmlFor="user-password" className="text-xs sm:text-sm text-section-tab-accent-text font-normal">
                            Kata Sandi
                        </label>
                        <div className="w-full">
                            <TextInput
                                id="user-password"
                                name="password"
                                type="password"
                                value={values.password}
                                onChange={(e) => setValues({ ...values, password: e.target.value })}
                                placeholder={isDetail ? 'Kosongkan jika tidak diubah' : 'Default: password'}
                                className="h-[36px] w-full rounded-md border-ui-border"
                                inputClassName="text-xs sm:text-sm"
                            />
                        </div>

                        <label className="text-xs sm:text-sm text-section-tab-accent-text font-normal self-start pt-1.5">
                            Jenis Akses
                        </label>
                        <AccessTypeField
                            value={values.accessType}
                            onChange={(v) => setValues({ ...values, accessType: v })}
                        />

                        <label className="text-xs sm:text-sm text-section-tab-accent-text font-normal self-start pt-1.5">
                            Status
                        </label>
                        <div className="flex items-center gap-8 pt-0.5">
                            <RadioField
                                id="status-active"
                                name="user-status"
                                label="Aktif"
                                checked={values.isActive === true}
                                onChange={() => setValues({ ...values, isActive: true })}
                                inputClassName="h-5 w-5"
                                containerClassName="w-auto inline-flex items-center"
                            />
                            <RadioField
                                id="status-inactive"
                                name="user-status"
                                label="Nonaktif"
                                checked={values.isActive === false}
                                onChange={() => setValues({ ...values, isActive: false })}
                                inputClassName="h-5 w-5"
                                containerClassName="w-auto inline-flex items-center"
                            />
                        </div>
                    </div>
                </div>
            </ModuleFormTemplate>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Pengguna"
                message={`Apakah Anda yakin ingin menghapus pengguna "${values.name || values.email || values.phone}"?`}
                confirmLabel="Hapus"
                tone="danger"
            />
        </>
    );
}
