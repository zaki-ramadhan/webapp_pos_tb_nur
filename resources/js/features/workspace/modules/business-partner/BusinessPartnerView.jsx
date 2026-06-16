import { useEffect, useMemo, useState } from 'react';

import { buildBusinessPartnerConfig, buildBusinessPartnerRecord } from '@/features/workspace/modules/business-partner/businessPartnerConfig';
import {
    buildFormState,
    BusinessPartnerTableView,
    DockIcon,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import { renderPartnerTab } from '@/features/workspace/modules/business-partner/BusinessPartnerFormSections';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import useBackendResource from '@/features/workspace/backend/useBackendResource';
import { mapPartnerRow, toPartnerPayload } from '@/features/workspace/backend/workspaceBackendAdapters';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import Spinner from '@/components/ui/Spinner';
import { dismissToast, showErrorToast, showLoadingToast, showSuccessToast } from '@/components/feedback/toast';

function BusinessPartnerFormView({ config, activeLevel2Tab, partnerType, onRefresh }) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const sourceRow = config.table.rows.find((row) => row.id === recordId) ?? {};
    const sourceRecord = useMemo(
        () => (isDetail ? buildBusinessPartnerRecord(partnerType, sourceRow, config) : config.formDefaults),
        [config, isDetail, partnerType, sourceRow],
    );
    const [activeTabId, setActiveTabId] = useState(config.tabs[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFormState(sourceRecord));
    const [status, setStatus] = useState({ tone: '', message: '' });

    useEffect(() => {
        setActiveTabId(config.tabs[0]?.id ?? 'general');
        setValues(buildFormState(sourceRecord));
        setStatus({ tone: '', message: '' });
    }, [sourceRecord]);

    const resourceName = partnerType === 'supplier' ? 'suppliers' : 'customers';
    const { processing, store, update, remove } = useBackendResource({
        resource: resourceName,
        onResolved: () => onRefresh?.(),
    });

    const handleSave = async () => {
        if (!values.name?.trim()) {
            setStatus({ tone: 'error', message: 'Nama wajib diisi.' });
            return;
        }

        if (values.email?.trim()) {
            const emailStr = values.email.trim();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(emailStr)) {
                setStatus({ tone: 'error', message: 'Format email tidak valid. Pastikan domain DNS lengkap (contoh: nama@domain.com).' });
                return;
            }
        }

        setStatus({ tone: '', message: '' });
        const payload = toPartnerPayload(values);
        const loadingToastId = showLoadingToast({
            title: 'Memproses',
            message: isDetail ? 'Sedang memperbarui mitra bisnis.' : 'Sedang menyimpan mitra bisnis baru.',
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
                message: isDetail ? 'Mitra bisnis berhasil diperbarui.' : 'Mitra bisnis berhasil disimpan.',
            });
        } catch (err) {
            dismissToast(loadingToastId);
            showErrorToast({
                title: 'Gagal menyimpan',
                message: getBackendErrorMessage(err, 'Terjadi kesalahan saat menyimpan data.'),
            });
            setStatus({ tone: 'error', message: getBackendErrorMessage(err, 'Terjadi kesalahan saat menyimpan data.') });
        }
    };

    const handleDelete = async () => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            const loadingToastId = showLoadingToast({
                title: 'Memproses',
                message: 'Sedang menghapus mitra bisnis.',
            });
            try {
                await remove(recordId);
                dismissToast(loadingToastId);
                showSuccessToast({
                    title: 'Berhasil',
                    message: 'Mitra bisnis berhasil dihapus.',
                });
            } catch (err) {
                dismissToast(loadingToastId);
                showErrorToast({
                    title: 'Gagal menghapus',
                    message: getBackendErrorMessage(err, 'Terjadi kesalahan saat menghapus data.'),
                });
            }
        }
    };

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const dockActions = isDetail
        ? [
              {
                  id: 'save',
                  label: 'Simpan',
                  tone: 'primary',
                  icon: 'save',
                  onClick: handleSave,
                  disabled: processing,
              },
              { id: 'attachment', label: 'Lampiran', tone: 'primary', icon: 'attachment' },
              {
                  id: 'delete',
                  label: 'Hapus',
                  tone: 'danger',
                  icon: 'trash',
                  onClick: handleDelete,
                  disabled: processing,
              },
          ]
        : [
              {
                  id: 'save',
                  label: 'Simpan',
                  tone: 'primary',
                  icon: 'save',
                  onClick: handleSave,
                  disabled: processing,
              },
              { id: 'attachment', label: 'Lampiran', tone: 'primary', icon: 'attachment' },
          ];

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="shrink-0">
                <PreferencesTabs
                    tabs={config.tabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                />
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-4 lg:flex-row overflow-hidden pt-0">
                <div className="flex flex-1 min-h-0 flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] overflow-hidden px-4 py-4 -mt-px">
                    <div className="order-2 min-w-0 flex-1 lg:order-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col">
                        <CrudStatusMessage status={status} className="mb-4 shrink-0" />
                        {renderPartnerTab({
                            config,
                            values,
                            isDetail,
                            activeTabId,
                            onChange: handleChange,
                        })}
                    </div>
                </div>

                <div className="order-1 flex shrink-0 flex-row justify-start gap-3 lg:order-2 lg:shrink-0 lg:self-start lg:flex-col lg:w-[112px] lg:items-center pt-3 lg:pt-4">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        {dockActions.map((action) => (
                            <DockActionButton
                                key={action.id}
                                label={action.label}
                                tone={action.tone}
                                icon={<DockIcon icon={action.icon} />}
                                onClick={action.onClick}
                                disabled={action.disabled}
                                loading={processing && (action.id === 'save' || action.id === 'delete')}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
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
        rows,
        total,
        loading,
        error,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to
    } = useBackendIndexResource({
        resource: resourceName,
        initialPerPage: 25,
    });

    const pageConfig = partnerType === 'supplier' ? page.suppliers ?? {} : page.customers ?? {};
    const config = useMemo(() => {
        const baseConfig = buildBusinessPartnerConfig(partnerType, pageConfig);
        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: rows.map(mapPartnerRow),
                pageValue: total.toLocaleString('id-ID'),
                pagination: {
                    page: currentPage,
                    perPage,
                    total,
                    lastPage,
                    from,
                    to,
                    onPageChange: setPage,
                    onPerPageChange: setPerPage,
                },
                refreshLabel: loading ? 'Memuat...' : baseConfig.table.refreshLabel,
            },
        };
    }, [loading, pageConfig, partnerType, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

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
