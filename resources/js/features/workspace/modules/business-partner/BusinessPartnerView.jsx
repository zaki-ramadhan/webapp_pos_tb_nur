import { useEffect, useMemo, useState } from 'react';

import { buildBusinessPartnerConfig, buildBusinessPartnerRecord } from '@/features/workspace/modules/business-partner/businessPartnerConfig';
import {
    buildFormState,
    BusinessPartnerTableView,
    DockIcon,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import { renderPartnerTab } from '@/features/workspace/modules/business-partner/BusinessPartnerFormSections';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import useBackendResource from '@/features/workspace/backend/useBackendResource';
import { mapPartnerRow, toPartnerPayload } from '@/features/workspace/backend/workspaceBackendAdapters';
import { getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import { dismissToast, showErrorToast, showLoadingToast, showSuccessToast } from '@/components/feedback/toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

function BusinessPartnerFormView({ config, activeLevel2Tab, partnerType, onRefresh }) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const partnerLabel = partnerType === 'supplier' ? 'Pemasok' : 'Pelanggan';
    const sourceRow = config.table.rows.find((row) => row.id === recordId) ?? {};
    const sourceRecord = useMemo(
        () => (isDetail ? buildBusinessPartnerRecord(partnerType, sourceRow, config) : config.formDefaults),
        [config, isDetail, partnerType, sourceRow],
    );
    const [activeTabId, setActiveTabId] = useState(config.tabs[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFormState(sourceRecord));
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        setActiveTabId(config.tabs[0]?.id ?? 'general');
    }, [recordId]);

    useEffect(() => {
        setValues(buildFormState(sourceRecord));
        setStatus({ tone: '', message: '' });
    }, [sourceRecord]);

    const resourceName = partnerType === 'supplier' ? 'suppliers' : 'customers';
    const { processing, store, update, remove } = useBackendResource({
        resource: resourceName,
        onResolved: () => onRefresh?.(),
    });

    const handleSave = async () => {
        window.dispatchEvent(new CustomEvent('form-validation-clear'));

        if (!values.name?.trim()) {
            setStatus({ tone: 'error', message: 'Nama wajib diisi.' });
            window.dispatchEvent(new CustomEvent('form-validation-error', { 
                detail: { name: 'Nama wajib diisi.' } 
            }));
            return;
        }

        if (values.email?.trim()) {
            const emailStr = values.email.trim();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(emailStr)) {
                setStatus({ tone: 'error', message: 'Format email tidak valid. Pastikan domain DNS lengkap (contoh: nama@domain.com).' });
                window.dispatchEvent(new CustomEvent('form-validation-error', { 
                    detail: { email: 'Format email tidak valid. Pastikan domain DNS lengkap (contoh: nama@domain.com).' } 
                }));
                return;
            }
        }

        setStatus({ tone: '', message: '' });
        const payload = toPartnerPayload(values);
        const loadingToastId = showLoadingToast({
            title: 'Memproses',
            message: `Sedang menyimpan data ${partnerLabel.toLowerCase()}.`,
        });
        try {
            if (isDetail) {
                await update(recordId, payload);
            } else {
                await store(payload);
            }
            dismissToast(loadingToastId);
            showSuccessToast({
                title: 'Berhasil',
                message: isDetail ? `${partnerLabel} berhasil diperbarui.` : `${partnerLabel} berhasil disimpan.`,
            });
        } catch (err) {
            dismissToast(loadingToastId);
            const errorMessage = getBackendErrorMessage(err, 'Terjadi kesalahan saat menyimpan data.');
            showErrorToast({
                title: 'Gagal menyimpan',
                message: errorMessage,
            });
            setStatus({ tone: 'error', message: errorMessage });

            // Dispatch backend validation errors to form fields
            const serverFieldErrors = err?.response?.data?.errors;
            if (serverFieldErrors && typeof serverFieldErrors === 'object') {
                const flat = Object.fromEntries(
                    Object.entries(serverFieldErrors).map(([key, value]) => [
                        key,
                        Array.isArray(value) ? (value[0] ?? '') : String(value),
                    ]),
                );
                window.dispatchEvent(new CustomEvent('form-validation-error', { detail: flat }));
            }
        }
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const performDelete = async () => {
        setShowDeleteConfirm(false);
        const loadingToastId = showLoadingToast({
            title: 'Memproses',
            message: `Sedang menghapus data ${partnerLabel.toLowerCase()}.`,
        });
        try {
            await remove(recordId);
            dismissToast(loadingToastId);
            showSuccessToast({
                title: 'Berhasil',
                message: `${partnerLabel} berhasil dihapus.`,
            });
        } catch (err) {
            dismissToast(loadingToastId);
            showErrorToast({
                title: `Gagal menghapus ${partnerLabel.toLowerCase()}`,
                message: getBackendErrorMessage(err, 'Terjadi kesalahan saat menghapus data.'),
            });
        }
    };

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const saveDisabled = processing || !values.name?.trim();

    return (
        <>
            <ModuleFormTemplate
                form={config}
                activeTabId={activeTabId}
                setActiveTabId={setActiveTabId}
                status={status}
                saving={processing}
                saveDisabled={saveDisabled}
                onSave={handleSave}
                actionsSlot={
                    isDetail ? (
                        <DockActionButton
                            label={processing ? 'Memproses...' : 'Hapus'}
                            tone="danger"
                            icon={<DockIcon icon="trash" />}
                            disabled={processing}
                            onClick={handleDelete}
                        />
                    ) : null
                }
            >
                <div className="flex-1 min-h-0 pb-8">
                    {renderPartnerTab({
                        config,
                        values,
                        isDetail,
                        activeTabId,
                        onChange: handleChange,
                    })}
                </div>
            </ModuleFormTemplate>

            <ConfirmationModal
                open={showDeleteConfirm}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.name || values.code}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={performDelete}
            />
        </>
    );
}

export default function BusinessPartnerView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    partnerType = 'customer',
}) {
    const resourceName = partnerType === 'supplier' ? 'suppliers' : 'customers';
    const {
        mappedRows,
        tableProps,
        reload,
    } = useWorkspaceResource({
        resource: resourceName,
        initialPerPage: 25,
        mapRow: mapPartnerRow,
    });

    const pageConfig = partnerType === 'supplier' ? page.suppliers ?? {} : page.customers ?? {};
    const config = useMemo(() => {
        const baseConfig = buildBusinessPartnerConfig(partnerType, pageConfig);
        const rowsWithFilters = mappedRows.map((row) => ({
            ...row,
            inactiveValue: row.isActive ? 'active' : 'inactive',
        }));

        const uniqueCategories = [...new Set(rowsWithFilters.map((r) => r.categoryName).filter(Boolean))];
        const categoryOptions = [
            { value: 'all', label: 'Kategori: Semua' },
            ...uniqueCategories.map((cat) => ({ value: cat, label: `Kategori: ${cat}` })),
        ];

        const statusOptions = [
            { value: 'all', label: 'Status: Semua' },
            { value: 'active', label: 'Status: Aktif' },
            { value: 'inactive', label: 'Status: Non Aktif' },
        ];

        const updatedFilters = (baseConfig.table.filters ?? []).map((filter) => {
            if (filter.id === 'inactive') {
                return { ...filter, rowKey: 'inactiveValue', options: statusOptions };
            }
            if (filter.id === 'category') {
                return { ...filter, rowKey: 'categoryName', options: categoryOptions };
            }
            return filter;
        });

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                ...tableProps,
                rows: rowsWithFilters,
                filters: updatedFilters,
                pageValue: tableProps.total.toLocaleString('id-ID'),
            },
        };
    }, [pageConfig, partnerType, mappedRows, tableProps]);

    return mode === 'table' ? (
        <BusinessPartnerTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <BusinessPartnerFormView
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            partnerType={partnerType}
            onRefresh={reload}
        />
    );
}

