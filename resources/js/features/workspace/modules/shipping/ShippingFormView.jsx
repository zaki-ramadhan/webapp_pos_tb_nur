import { useEffect, useMemo, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import { PrefixedInput, PrefixedTextArea, ShippingFieldRow } from './ShippingSections';
import { buildDefaultValues } from './shippingShared';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';

export default function ShippingFormView({
    form,
    tableRows = [],
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        if (!recordId) {
            return null;
        }
        return tableRows.find((row) => String(row.id) === String(recordId)) ?? null;
    }, [activeLevel2Tab, tableRows]);

    const isDetail = Boolean(detailRow);
    const initialValues = useMemo(() => buildDefaultValues(form, detailRow), [form, detailRow]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const isDirty = useMemo(
        () => JSON.stringify(values) !== JSON.stringify(initialValues),
        [initialValues, values]
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeTabInstanceId, initialValues]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    useWorkspaceDirtyRegistration({
        pageId: 'shipping-master',
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (!values.name?.trim()) {
            rejectCrudFormAction('Nama Pengiriman wajib diisi.', {
                setStatus,
            });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui pengiriman.' : 'Sedang menyimpan pengiriman.',
            successMessage: isDetail ? 'Pengiriman berhasil diperbarui.' : 'Pengiriman berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const extra = {
                    pic: values.pic ?? '',
                    phone: values.phone ?? '',
                    street: values.street ?? '',
                    city: values.city ?? '',
                    postalCode: values.postalCode ?? '',
                    province: values.province ?? '',
                    country: values.country ?? '',
                };

                const payload = {
                    code: isDetail ? detailRow.code : 'SH-' + values.name.trim().replace(/\s+/g, '-').toUpperCase() + '-' + Date.now(),
                    name: values.name.trim(),
                    notes: JSON.stringify(extra),
                    is_active: true,
                };

                const response = isDetail && detailRow?.id
                    ? await updateBackendResource('shipping-methods', detailRow.id, payload)
                    : await createBackendResource('shipping-methods', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.name ?? values.name.trim(),
                        tabLabel: record.name ?? values.name.trim(),
                    });
                }
            },
        });
    }

    function requestDelete() {
        if (!detailRow?.id || saving) {
            return;
        }
        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!detailRow?.id) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus pengiriman.',
            successMessage: 'Pengiriman berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('shipping-methods', detailRow.id),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(detailRow.id);
                onOpenContent?.();
            },
        });
    }

    const actionsSlot = isDetail ? (
        <DockActionButton
            label="Hapus"
            icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
            tone="danger"
            disabled={saving}
            onClick={requestDelete}
        />
    ) : null;

    const resolvedForm = useMemo(() => {
        return {
            ...form,
            tabs: [{ id: 'shipping-general', label: 'Metode Pengiriman' }],
        };
    }, [form]);

    return (
        <>
            <ModuleFormTemplate
                form={resolvedForm}
                activeTabId="shipping-general"
                setActiveTabId={() => {}}
                status={status}
                saving={saving}
                saveDisabled={saving || !isDirty}
                onSave={handleSave}
                actionsSlot={actionsSlot}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-[980px]">
                    <div className="space-y-3.5">
                        <div className="border-b border-[#d9dee8] pb-1.5 mb-2">
                            <h3 className="text-base font-semibold text-[#1f2436]">Informasi Pengiriman</h3>
                        </div>

                        <ShippingFieldRow label={form.labels.name} required>
                            <TextInput
                                id="name"
                                name="name"
                                value={values.name}
                                onChange={(event) => handleChange('name', event.target.value)}
                                className="h-[40px] rounded-[4px] border-slate-400"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                            />
                        </ShippingFieldRow>

                        <ShippingFieldRow label={form.labels.pic}>
                            <TextInput
                                value={values.pic}
                                onChange={(event) => handleChange('pic', event.target.value)}
                                className="h-[40px] rounded-[4px] border-slate-400"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                            />
                        </ShippingFieldRow>

                        <ShippingFieldRow label={form.labels.phone}>
                            <TextInput
                                value={values.phone}
                                onChange={(event) => handleChange('phone', event.target.value)}
                                className="h-[40px] rounded-[4px] border-slate-400"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                            />
                        </ShippingFieldRow>
                    </div>

                    <div className="space-y-3.5">
                        <div className="border-b border-[#d9dee8] pb-1.5 mb-2">
                            <h3 className="text-base font-semibold text-[#1f2436]">Alamat</h3>
                        </div>

                        <ShippingFieldRow label={form.labels.address}>
                            <div className="space-y-3">
                                <PrefixedTextArea
                                    value={values.street}
                                    onChange={(event) => handleChange('street', event.target.value)}
                                    prefix="Jalan"
                                />

                                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                                    <CityAutocompleteInput
                                        value={values.city}
                                        onChange={(nextValue) => handleChange('city', nextValue)}
                                        onSelectCity={(item) => {
                                            handleChange('city', item.city);
                                            handleChange('province', item.province);
                                            handleChange('postalCode', item.postalCode);
                                            handleChange('country', item.country);
                                        }}
                                        prefix="Kota"
                                        prefixClassName="min-w-[62px] border-slate-400 bg-[#f3f3f4] px-3 text-xs sm:text-sm text-[#8b94a7]"
                                        dropdownLeftOffsetClassName="left-[62px]"
                                    />
                                    <PrefixedInput
                                        value={values.postalCode}
                                        onChange={(event) => handleChange('postalCode', event.target.value)}
                                        prefix="K.Pos"
                                        prefixClassName="min-w-[62px] border-slate-400 bg-[#f3f3f4] px-3 text-xs sm:text-sm text-[#8b94a7]"
                                    />
                                </div>

                                <PrefixedInput
                                    value={values.province}
                                    onChange={(event) => handleChange('province', event.target.value)}
                                    prefix="Provinsi"
                                />

                                <PrefixedInput
                                    value={values.country}
                                    onChange={(event) => handleChange('country', event.target.value)}
                                    prefix="Negara"
                                />
                            </div>
                        </ShippingFieldRow>
                    </div>
                </div>
            </ModuleFormTemplate>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Metode Pengiriman"
                message="Metode pengiriman ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
