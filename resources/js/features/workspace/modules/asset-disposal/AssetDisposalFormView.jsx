import { useEffect, useMemo, useState, useCallback } from 'react';

import {
    TransactionDock,
    TransactionSectionRail,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { buildAssetDisposalConfig } from './assetDisposalConfig';
import {
    AssetDisposalGeneralSection,
    AssetDisposalHeader,
    SectionCard,
} from './AssetDisposalSections';
import { buildFormValues } from './assetDisposalShared';
import {
    createBackendResource,
    updateBackendResource,
    listBackendResource,
    getBackendErrorMessage,
} from '@/features/workspace/backend/workspaceBackendApi';
import {
    finishCrudLoadingToast,
    showCrudErrorToast,
    showCrudLoadingToast,
    showCrudSuccessToast,
} from '@/features/workspace/shared/crudFeedback';
import { normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';

export default function AssetDisposalFormView({ page, activeLevel2Tab, onOpenContent, onCloseDetail, onRefresh }) {
    const config = useMemo(
        () => buildAssetDisposalConfig(page.assetDisposal ?? {}),
        [page.assetDisposal],
    );
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return config.table.rows.find((row) => row.id === recordId) ?? null;
    }, [activeLevel2Tab, config.table.rows]);
    
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(detailRow);
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFormValues(config, detailRow));
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [fixedAssets, setFixedAssets] = useState([]);
    const [accounts, setAccounts] = useState([]);

    // Fetch lists for lookup
    useEffect(() => {
        listBackendResource('fixed-assets', { per_page: 200 }).then(res => {
            setFixedAssets(res?.data ?? res ?? []);
        }).catch(err => console.error('Gagal mengambil aset tetap:', err));

        listBackendResource('accounts', { per_page: 200 }).then(res => {
            setAccounts(res?.data ?? res ?? []);
        }).catch(err => console.error('Gagal mengambil akun perkiraan:', err));
    }, []);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs[0]?.id ?? 'general');
        setValues(buildFormValues(config, detailRow));
        setErrors({});
    }, [config, detailRow]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setErrors({});
        const loadingToastId = showCrudLoadingToast(isDetail ? 'Sedang memperbarui data.' : 'Sedang menyimpan data baru.');

        try {
            const selectedAssetObj = fixedAssets.find(fa => fa.name === values.asset?.[0]) ?? null;
            const fixedAssetId = selectedAssetObj?.id ?? 1;

            const selectedAccountObj = accounts.find(acc => acc.name === values.profitLossAccount?.[0]) ?? null;
            const accountId = selectedAccountObj?.id ?? null;

            const lines = [
                {
                    fixed_asset_id: fixedAssetId,
                    quantity: Number(values.quantity || 1),
                    account_id: accountId,
                    description: values.notes || 'Disposisi Aset Tetap',
                    total_amount: parseFloat(values.bookValue || 0),
                    sort_order: 0
                }
            ];

            const payload = {
                document_number: values.documentNumber || `DSP.${Date.now()}`,
                entry_date: normalizeDisplayDate(values.transactionDate) || new Date().toISOString().slice(0, 10),
                notes: values.notes || '',
                status: 'Posted',
                branch_id: 1,
                primary_account_id: accountId,
                lines
            };

            if (isDetail) {
                await updateBackendResource('asset-disposals', activeRecordId, payload);
            } else {
                await createBackendResource('asset-disposals', payload);
            }

            finishCrudLoadingToast(loadingToastId);
            showCrudSuccessToast(isDetail ? 'Data berhasil diperbarui.' : 'Data berhasil disimpan.');

            await onRefresh?.();
            
            if (onOpenContent) {
                onOpenContent(null);
            }
        } catch (error) {
            finishCrudLoadingToast(loadingToastId);
            const message = getBackendErrorMessage(error);
            showCrudErrorToast(message);
            setErrors({ _form: message });
            
            if (error?.response?.data?.errors) {
                setErrors(prev => ({ ...prev, ...error.response.data.errors }));
            }
        } finally {
            setSaving(false);
        }
    }, [isDetail, activeRecordId, values, fixedAssets, accounts, onRefresh, onOpenContent]);

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? []).map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          disabled: saving,
                          onClick: handleSave,
                      }
                    : action,
            ),
        [saving, values.dockActions, handleSave],
    );

    useWorkspaceDirtyRegistration({
        pageId: page.id,
        tabId: activeLevel2Tab?.id,
        dirty: false,
        enabled: Boolean(page.id && activeLevel2Tab?.id),
    });

    return (
        <div className="flex h-full min-h-0 flex-col gap-5 xl:flex-row xl:items-stretch overflow-hidden">
            <div className="order-2 min-w-0 flex-1 xl:order-1 flex flex-col gap-3 overflow-hidden">
                <div className="shrink-0">
                    <AssetDisposalHeader config={{ ...config, errors }} values={values} setValues={setValues} isDetail={isDetail} />
                </div>

                <div className="flex flex-1 min-h-0 flex-col gap-4 xl:flex-row overflow-hidden">
                    <div className="shrink-0">
                        <TransactionSectionRail
                            tabs={config.sectionTabs}
                            activeTabId={activeSectionId}
                            onSelectTab={setActiveSectionId}
                        />
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 flex flex-col">
                        <SectionCard className="flex-1 min-h-0 flex flex-col">
                            <AssetDisposalGeneralSection config={{ ...config, errors }} values={values} setValues={setValues} />
                        </SectionCard>
                    </div>
                </div>
            </div>

            <div className="order-1 flex justify-end xl:order-2 xl:shrink-0 xl:self-start">
                <TransactionDock actions={dockActions} />
            </div>
        </div>
    );
}
