import { useEffect, useMemo, useState } from 'react';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import RadioField from '@/components/ui/RadioField';
import TextInput from '@/components/ui/TextInput';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import useBackendResource from '@/features/workspace/backend/useBackendResource';
import { toUserPayload } from '@/features/workspace/backend/workspaceBackendAdapters';

const USER_FORM_TABS = [{ id: 'users-general', label: 'Pengguna' }];

function AccessTypeField({ value, onChange }) {
    const descriptions = {
        kasir: 'Kasir memiliki akses terbatas hanya untuk modul Penjualan & Penerimaan Penjualan. Modul lainnya dibatasi otomatis.',
        super_admin: 'Owner Memiliki hak akses penuh tanpa batas ke seluruh modul dan pengaturan aplikasi.',
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
        phone: detailRow?.phone || detailRow?.email || '',
        password: '',
        isActive: detailRow?.isActive ?? true,
        accessGroupIds: detailRow?.accessGroupIds ?? [],
        accessType: isSuperAdmin ? 'super_admin' : 'kasir',
    };
}

function buildPayloadFromInput(inputVal, values, lookupData, isDetail, detailRow) {
    const isEmailInput = inputVal.includes('@');
    let name = detailRow?.name || values.name || '', email = detailRow?.email || '', phone = detailRow?.phone || '';

    if (isEmailInput) {
        email = inputVal;
        if (!name || !isDetail) {
            const match = lookupData.employees?.find((e) => e.email?.toLowerCase() === inputVal.toLowerCase());
            name = match ? match.full_name : `User ${inputVal.split('@')[0]}`;
        }
        phone = phone || (lookupData.employees?.find((e) => e.email?.toLowerCase() === inputVal.toLowerCase())?.mobile_phone ?? '');
    } else {
        phone = inputVal;
        const normalized = inputVal.replace(/[^0-9]/g, '');
        const match = lookupData.employees?.find((e) => {
            const ep = (e.mobile_phone || e.whatsapp_phone || e.office_phone || '').replace(/[^0-9]/g, '');
            return ep && ep === normalized;
        });
        if (!name || !isDetail) {
            name = match ? match.full_name : `User ${inputVal}`;
        }
        email = email || (match ? (match.email || `${normalized || 'user'}@example.com`) : `${normalized || 'user'}@example.com`);
    }

    const adminRole = lookupData.roles?.find((r) => r.code === 'super_admin' || r.code === 'admin' || r.name?.toLowerCase()?.includes('admin') || r.name?.toLowerCase()?.includes('super'));
    const kasirRole = lookupData.roles?.find((r) => r.code === 'kasir' || r.code === 'operator' || r.name?.toLowerCase()?.includes('kasir') || r.name?.toLowerCase()?.includes('operator'));

    const isOwner = values.accessType === 'super_admin' || values.accessType === 'administrator' || values.accessType === 'owner';
    const roleIds = isOwner
        ? [adminRole?.id ?? 1]
        : [kasirRole?.id ?? 2];

    return toUserPayload({ ...values, name: name || values.name || inputVal, email, phone, password: values.password || (isDetail ? undefined : 'password'), roleIds });
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


    const { store, update } = useBackendResource({ resource: 'users' });

    const validationMessage = useMemo(() => {
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
    }, [values.phone]);

    const saveDisabled = saving || Boolean(validationMessage);

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, {
                setStatus,
                fieldErrors: { phone: validationMessage },
            });
            return;
        }

        const inputVal = values.phone.trim();
        const payload = buildPayloadFromInput(inputVal, values, lookupData, isDetail, detailRow);

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui pengguna.' : 'Sedang menyimpan pengguna baru.',
            successMessage: isDetail ? 'Pengguna berhasil diperbarui.' : 'Pengguna berhasil disimpan.',
            setSaving,
            setStatus,
            getErrorMessage: (err) => getBackendErrorMessage(err, 'Terjadi kesalahan saat menyimpan data.'),
            execute: () => isDetail ? update(recordId, payload) : store(payload),
            onSuccess: async (res) => {
                onRefresh?.();
                const record = res?.data ?? res;
                if (!isDetail && record?.id && onOpenDetail) {
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

    const resolvedForm = useMemo(() => ({ ...form, tabs: USER_FORM_TABS }), [form]);

    return (
        <ModuleFormTemplate
            form={resolvedForm}
            activeTabId="users-general"
            setActiveTabId={() => {}}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={handleSave}
        >
            <div className="flex-1 min-h-0 pt-2">
                <h2 className="text-[15px] text-text-darkest leading-normal font-normal mb-8">
                    Tambahkan pengguna untuk mengakses database ini dengan memasukkan no handphone/emailnya
                </h2>

                <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start max-w-[980px]">
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
        </ModuleFormTemplate>
    );
}
