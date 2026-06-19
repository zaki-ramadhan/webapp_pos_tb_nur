import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import { calculateAssetTaxCategoryRate, buildAssetTaxCategoryConfig } from './assetTaxCategoryConfig';

function TaxCategoryFieldRow({ label, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-center">
            <label className="text-xs sm:text-sm text-[#1f2436]">{label}</label>
            <div>{children}</div>
        </div>
    );
}

export default function AssetTaxCategoryFormView({
    pageId,
    form,
    tableRows = [],
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const config = useMemo(() => buildAssetTaxCategoryConfig(form), [form]);
    
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        if (!recordId) {
            return null;
        }
        return tableRows.find((row) => String(row.id) === String(recordId)) ?? null;
    }, [activeLevel2Tab, tableRows]);

    const isDetailMode = Boolean(detailRow);
    const initialValues = useMemo(() => {
        if (!detailRow) {
            return {
                name: '',
                depreciationMethod: 'Metode Garis Lurus',
                estimatedLifeYears: '',
            };
        }
        return {
            name: detailRow.name ?? '',
            depreciationMethod: detailRow.depreciationMethod ?? 'Metode Garis Lurus',
            estimatedLifeYears: detailRow.estimatedLifeYears ?? '',
        };
    }, [detailRow]);

    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const isDirty = useMemo(
        () => JSON.stringify(values) !== JSON.stringify(initialValues),
        [initialValues, values]
    );

    useEffect(() => {
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeLevel2Tab?.id, initialValues]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const calculatedRate = useMemo(
        () => calculateAssetTaxCategoryRate(values.depreciationMethod, values.estimatedLifeYears),
        [values.depreciationMethod, values.estimatedLifeYears]
    );

    const saveDisabled = saving || !isDirty || !values.name?.trim();

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (!values.name?.trim()) {
            rejectCrudFormAction('Nama Kategori wajib diisi.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetailMode ? 'Sedang memperbarui kategori pajak.' : 'Sedang menyimpan kategori pajak.',
            successMessage: isDetailMode ? 'Kategori pajak berhasil diperbarui.' : 'Kategori pajak berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const years = Number.parseFloat(String(values.estimatedLifeYears ?? '').replace(',', '.'));
                const assetLifeMonths = Number.isFinite(years) && years > 0 ? Math.round(years * 12) : 0;
                
                const payload = {
                    code: isDetailMode ? detailRow.code : 'ATC-' + Date.now(),
                    name: values.name.trim(),
                    depreciation_method: values.depreciationMethod,
                    asset_life_months: assetLifeMonths,
                    depreciation_rate: Number.parseFloat(calculatedRate),
                    is_active: true,
                };

                const response = isDetailMode && detailRow?.id
                    ? await updateBackendResource('asset-tax-categories', detailRow.id, payload)
                    : await createBackendResource('asset-tax-categories', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetailMode && record?.id) {
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
            loadingMessage: 'Sedang menghapus kategori pajak.',
            successMessage: 'Kategori pajak berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('asset-tax-categories', detailRow.id),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(detailRow.id);
                onOpenContent?.();
            },
        });
    }

    return (
        <ModuleFormTemplate
            form={form}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={handleSave}
            actionsSlot={
                isDetailMode ? (
                    <DockActionButton
                        label="Hapus"
                        tone="danger"
                        disabled={saving}
                        onClick={requestDelete}
                        icon={<TrashIcon className="h-9 w-9" />}
                    />
                ) : null
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                    <TaxCategoryFieldRow label={config.labels.name}>
                        <TextInput
                            value={values.name}
                            onChange={(event) => handleChange('name', event.target.value)}
                            className="h-[40px] w-full rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    </TaxCategoryFieldRow>

                    <TaxCategoryFieldRow label={config.labels.depreciationMethod}>
                        <SelectField
                            value={values.depreciationMethod}
                            onChange={(event) => handleChange('depreciationMethod', event.target.value)}
                            containerClassName="w-full"
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {config.depreciationMethodOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </TaxCategoryFieldRow>
                </div>

                <div className="space-y-4">
                    <TaxCategoryFieldRow label={config.labels.estimatedLife}>
                        <div className="flex items-center gap-3">
                            <TextInput
                                value={values.estimatedLifeYears}
                                onChange={(event) => handleChange('estimatedLifeYears', event.target.value.replace(/[^\d.,]/g, ''))}
                                className="h-[40px] w-full max-w-[120px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-right text-xs sm:text-sm text-[#1f2436]"
                            />
                            <span className="text-xs sm:text-sm text-[#1f2436]">{config.labels.yearsSuffix}</span>
                        </div>
                    </TaxCategoryFieldRow>

                    <TaxCategoryFieldRow label={config.labels.depreciationRate}>
                        <div className="flex items-center gap-3">
                            <div className="min-w-[120px] text-right text-xs sm:text-sm font-semibold text-[#1f2436]">
                                {calculatedRate}
                            </div>
                            <span className="text-xs sm:text-sm text-[#1f2436]">{config.labels.percentSuffix}</span>
                        </div>
                    </TaxCategoryFieldRow>
                </div>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Kategori Pajak Aset Tetap"
                message="Kategori pajak ini akan dihapus secara permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}
