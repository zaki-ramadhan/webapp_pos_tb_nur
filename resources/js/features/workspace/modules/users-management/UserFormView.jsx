import { useEffect, useMemo, useState } from 'react';
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

const USER_FORM_TABS = [{ id: 'users-general', label: 'Pengguna' }];

function AccessTypeField({ value, onChange, isActorSuperAdmin = false }) {
    const descriptions = {
        kasir: 'Kasir memiliki akses terbatas hanya untuk modul Penjualan & Penerimaan Penjualan. Modul lainnya dibatasi otomatis.',
        owner: 'Owner memiliki hak akses penuh ke seluruh transaksi operasional, laporan keuangan, dan manajemen staf toko.',
        super_admin: 'Administrator Sistem memiliki hak akses root teknis tertinggi untuk mengelola seluruh sistem dan pemeliharaan.',
    };

    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-6 pt-0.5">
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
                    id="access-owner"
                    name="access-type"
                    label="Owner"
                    checked={value === 'owner' || value === 'admin'}
                    onChange={() => onChange('owner')}
                    inputClassName="h-5 w-5"
                    containerClassName="w-auto inline-flex items-center"
                />
                {isActorSuperAdmin && (
                    <RadioField
                        id="access-super-admin"
                        name="access-type"
                        label="Administrator Sistem"
                        checked={value === 'super_admin'}
                        onChange={() => onChange('super_admin')}
                        inputClassName="h-5 w-5"
                        containerClassName="w-auto inline-flex items-center"
                    />
                )}
            </div>
            {descriptions[value === 'operator' ? 'kasir' : (value === 'admin' ? 'owner' : value)] && (
                <div className="flex items-center gap-3 pt-0.5 mt-1">
                    <span className="block h-6 w-[5px] rounded-[2px] bg-bg-bullet-gray" aria-hidden="true" />
                    <p className="text-xs sm:text-sm italic leading-6 text-tab-active-border-t">
                        {descriptions[value === 'operator' ? 'kasir' : (value === 'admin' ? 'owner' : value)]}
                    </p>
                </div>
            )}
        </div>
    );
}

function buildInitialValues(detailRow) {
    const roleIds = detailRow?.roleIds ?? [];
    const accessTypeStr = String(detailRow?.accessType ?? '').toLowerCase();
    const isSuperAdmin = roleIds.includes(1) || accessTypeStr.includes('administrator sistem') || accessTypeStr.includes('super');
    const isOwner = !isSuperAdmin && (roleIds.includes(3) || accessTypeStr.includes('owner') || accessTypeStr.includes('admin'));

    let accessType = 'kasir';
    let accessTypeLabel = 'Kasir';
    if (isSuperAdmin) {
        accessType = 'super_admin';
        accessTypeLabel = 'Administrator Sistem';
    } else if (isOwner) {
        accessType = 'owner';
        accessTypeLabel = 'Owner';
    }

    const email = detailRow?.email ?? '';
    const phone = detailRow?.phone ?? '';

    return {
        name: detailRow?.name ?? '',
        email,
        phone,
        password: '',
        isActive: detailRow?.isActive ?? true,
        accessGroupIds: detailRow?.accessGroupIds ?? [],
        accessType,
        accessTypeLabel: detailRow?.accessType || accessTypeLabel,
        initialEmail: email.trim(),
        initialPhone: phone.trim(),
    };
}

function buildPayloadFromInput(inputVal, values, lookupData, isDetail, detailRow) {
    const isEmailInput = inputVal.includes('@');
    let name = detailRow?.name || values.name || '', email = '', phone = '';

    if (isEmailInput) {
        email = inputVal.trim();
        const match = lookupData?.employees?.find((e) => e.email?.toLowerCase() === email.toLowerCase());
        if (match) {
            name = name || match.full_name;
            phone = match.mobile_phone || match.whatsapp_phone || match.office_phone || '';
        } else {
            name = name || `User ${email.split('@')[0]}`;
            phone = '';
        }
    } else {
        phone = inputVal.trim();
        const normalized = phone.replace(/[^0-9]/g, '');
        const match = lookupData?.employees?.find((e) => {
            const ep = (e.mobile_phone || e.whatsapp_phone || e.office_phone || '').replace(/[^0-9]/g, '');
            return ep && ep === normalized;
        });
        if (match) {
            name = name || match.full_name;
            email = match.email || '';
        } else {
            name = name || `User ${phone}`;
            email = '';
        }
    }

    const superAdminRole = lookupData?.roles?.find((r) => r.code === 'super_admin');
    const adminRole = lookupData?.roles?.find((r) => r.code === 'admin' || r.name?.toLowerCase()?.includes('admin'));
    const kasirRole = lookupData?.roles?.find((r) => r.code === 'kasir' || r.code === 'operator' || r.name?.toLowerCase()?.includes('kasir') || r.name?.toLowerCase()?.includes('operator'));

    let roleIds = [kasirRole?.id ?? 2];
    if (values.accessType === 'super_admin') {
        roleIds = [superAdminRole?.id ?? 1];
    } else if (values.accessType === 'owner' || values.accessType === 'admin') {
        roleIds = [adminRole?.id ?? 3];
    }

    return toUserPayload({
        ...values,
        name: name || inputVal,
        email: email || undefined,
        phone: phone || undefined,
        password: values.password || (isDetail ? undefined : 'password'),
        roleIds,
    });
}

export default function UserFormView({ form, activeLevel2Tab, tableRows = [], onRefresh, onOpenDetail, lookupData }) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        return recordId ? (tableRows.find((r) => String(r.id) === String(recordId)) ?? null) : null;
    }, [activeLevel2Tab, tableRows]);

    const recordId = detailRow ? String(detailRow.id) : null;
    const isDetail = Boolean(recordId);

    const pageProps = usePage()?.props ?? {};
    const authUser = pageProps.auth?.user || pageProps.user;
    const isActorSuperAdmin = Boolean(
        authUser?.isSuperAdmin ||
        authUser?.role === 'Administrator Sistem' ||
        ['piscokpiscok2610@gmail.com', 'zakiram4dhan@gmail.com'].includes(String(authUser?.email ?? '').toLowerCase())
    );
    const isSelf = Boolean(
        detailRow?.id && authUser?.id && String(detailRow.id) === String(authUser.id)
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

    const validationMessage = useMemo(() => {
        if (!isDetail) {
            const inputVal = values.phone?.trim() ?? '';
            if (!inputVal) {
                return 'No Handphone/Email wajib diisi.';
            }
            if (inputVal.includes('@')) {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(inputVal)) {
                    return 'Format email tidak valid.';
                }
            }
            return '';
        }

        if (!isEmailLocked && values.email?.trim()) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(values.email.trim())) {
                return 'Format email tidak valid.';
            }
        }
        return '';
    }, [isDetail, isEmailLocked, values.phone, values.email]);

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
                        !isSelf ? (
                            <DockActionButton
                                label={saving ? 'Memproses...' : 'Hapus'}
                                tone="danger"
                                icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                                disabled={saving}
                                onClick={() => setDeleteConfirmationOpen(true)}
                            />
                        ) : (
                            <div className="flex items-center text-xs text-slate-500 italic pr-3">
                                Akun Anda sedang aktif digunakan
                            </div>
                        )
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
                )}
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
