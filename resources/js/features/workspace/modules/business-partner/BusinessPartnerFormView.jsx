import { useEffect, useMemo, useState } from 'react';

import { buildBusinessPartnerRecord } from '@/features/workspace/modules/business-partner/businessPartnerConfig';
import {
    buildFormState,
    DockIcon,
    formatErrorMessageList,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import { renderPartnerTab } from '@/features/workspace/modules/business-partner/BusinessPartnerFormSections';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import useBackendResource from '@/features/workspace/backend/useBackendResource';
import { toPartnerPayload } from '@/features/workspace/backend/workspaceBackendAdapters';
import { getBackendErrorMessage, getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { dismissToast, showErrorToast, showLoadingToast, showSuccessToast } from '@/components/feedback/toast';
import { showCrudValidationToast } from '@/features/workspace/shared/crudFeedback';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { FormErrorProvider } from '@/components/ui/FormErrorContext';

export default function BusinessPartnerFormView({
    config,
    activeLevel2Tab,
    partnerType,
    onRefresh,
    onOpenDetail,
}) {
    const [fetchedRow, setFetchedRow] = useState(null);

    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const partnerLabel = partnerType === 'supplier' ? 'Pemasok' : 'Pelanggan';

    const resourceName = partnerType === 'supplier' ? 'suppliers' : 'customers';

    useEffect(() => {
        setFetchedRow(null);
        if (!recordId) return;

        let active = true;
        async function fetchDetail() {
            try {
                const record = await getBackendResource(resourceName, recordId);
                if (active && record) {
                    setFetchedRow(record);
                }
            } catch (err) {
                // Ignore
            }
        }
        fetchDetail();
        return () => { active = false; };
    }, [recordId, resourceName]);

    const sourceRow = useMemo(() => {
        const localRow = config.table.rows.find((row) => row.id === recordId) ?? null;
        return fetchedRow || localRow || {};
    }, [config.table.rows, recordId, fetchedRow]);

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
    }, [recordId, fetchedRow]);

    const { processing, store, update, remove } = useBackendResource({
        resource: resourceName,
        onResolved: () => onRefresh?.(),
    });

    const validationMessage = useMemo(() => {
        if (!values.name?.trim()) {
            return 'Nama harus diisi.';
        }
        if (values.email?.trim()) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(values.email.trim())) {
                return 'Format email tidak valid.';
            }
        }
        return '';
    }, [values.name, values.email]);

    const handleSave = async () => {
        if (validationMessage) {
            setStatus({ tone: 'error', message: validationMessage });
            showCrudValidationToast(validationMessage);
            window.dispatchEvent(new CustomEvent('form-validation-error', { 
                detail: {
                    name: !values.name?.trim() ? 'Nama harus diisi.' : undefined,
                    email: values.email?.trim() && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email.trim()) ? 'Format email tidak valid.' : undefined,
                } 
            }));
            return;
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
                const res = await store(payload);
                const savedRecord = res?.data ?? res;
                if (savedRecord?.id && onOpenDetail) {
                    onOpenDetail({
                        recordId: String(savedRecord.id),
                        label: savedRecord.name ?? payload.name,
                        tabLabel: savedRecord.name ?? payload.name,
                    });
                    if (activeLevel2Tab?.id) {
                        window.dispatchEvent(
                            new CustomEvent('workspace:close-tab', {
                                detail: { tabId: activeLevel2Tab.id },
                            })
                        );
                    }
                }
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

            const serverFieldErrors = err?.response?.data?.errors;
            if (serverFieldErrors && typeof serverFieldErrors === 'object') {
                const flat = Object.fromEntries(
                    Object.entries(serverFieldErrors).map(([key, value]) => [
                        key,
                        Array.isArray(value) ? (value[0] ?? '') : String(value),
                    ]),
                );
                window.dispatchEvent(new CustomEvent('form-validation-error', { detail: flat }));
                const missingList = Object.values(flat).filter(Boolean);
                if (missingList.length > 0) {
                    showCrudValidationToast(missingList);
                }
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
            window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
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

    const saveDisabled = processing || Boolean(validationMessage);

    return (
        <FormErrorProvider>
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
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.name || values.fullName || values.code || 'mitra ini'}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={performDelete}
            />

        </FormErrorProvider>
    );
}
