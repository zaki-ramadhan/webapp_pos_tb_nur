import { useEffect, useMemo, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import SectionTab from '@/features/workspace/shared/SectionTab';
import { SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import { PrefixedInput, PrefixedTextArea, ShippingFieldRow } from './ShippingSections';
import { buildDefaultValues } from './shippingShared';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';

function renderDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }
    return <SaveIcon className="h-9 w-9" />;
}

const createDockActions = [
    {
        id: 'save',
        label: 'Simpan',
        icon: 'save',
        tone: 'muted',
    },
];

const detailDockActions = [
    {
        id: 'save',
        label: 'Simpan',
        icon: 'save',
        tone: 'muted',
    },
    {
        id: 'delete',
        label: 'Hapus',
        icon: 'trash',
        tone: 'danger',
    },
];

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
    }, [activeTabInstanceId]);

    useEffect(() => {
        if (!isDirty) {
            setValues(initialValues);
        }
    }, [initialValues, isDirty]);

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
            rejectCrudFormAction('Nama Pengiriman wajib diisi.', { setStatus });
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

    const dockActions = isDetail ? detailDockActions : createDockActions;

    return (
        <>
            <div className="relative flex min-h-full flex-col">
                <div className="px-1 pt-0.5">
                    <SectionTab label={form.sectionLabel} tone="accent" className="h-[34px]" />
                </div>

                <div className="flex min-h-[642px] flex-col gap-5 rounded-[4px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-start">
                    <div className="order-2 min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4 lg:order-1">
                        <CrudStatusMessage status={status} className="mb-4" />
                        <div className="space-y-4">
                            <ShippingFieldRow label={form.labels.name} required>
                                <TextInput
                                    value={values.name}
                                    onChange={(event) => handleChange('name', event.target.value)}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />
                            </ShippingFieldRow>

                            <ShippingFieldRow label={form.labels.pic}>
                                <TextInput
                                    value={values.pic}
                                    onChange={(event) => handleChange('pic', event.target.value)}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />
                            </ShippingFieldRow>

                            <ShippingFieldRow label={form.labels.phone}>
                                <TextInput
                                    value={values.phone}
                                    onChange={(event) => handleChange('phone', event.target.value)}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[15px] text-[#1f2436]"
                                />
                            </ShippingFieldRow>

                            <ShippingFieldRow label={form.labels.address}>
                                <div className="space-y-3">
                                    <PrefixedTextArea
                                        value={values.street}
                                        onChange={(event) => handleChange('street', event.target.value)}
                                        prefix="Jalan"
                                    />

                                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
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
                                            prefixClassName="min-w-[62px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-[15px] text-[#8b94a7]"
                                            dropdownLeftOffsetClassName="left-[62px]"
                                        />
                                        <PrefixedInput
                                            value={values.postalCode}
                                            onChange={(event) => handleChange('postalCode', event.target.value)}
                                            prefix="K.Pos"
                                            prefixClassName="min-w-[62px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-[15px] text-[#8b94a7]"
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

                    <div className="order-1 flex justify-end lg:order-2 lg:shrink-0">
                        <div className="flex flex-row gap-3 lg:flex-col">
                            {dockActions.map((action) => (
                                <DockActionButton
                                    key={action.id}
                                    label={action.label}
                                    tone={action.tone}
                                    icon={renderDockIcon(action.icon)}
                                    loading={saving && (action.id === 'save' || action.id === 'delete')}
                                    onClick={() => {
                                        if (action.id === 'save') {
                                            handleSave();
                                        } else if (action.id === 'delete') {
                                            requestDelete();
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

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
