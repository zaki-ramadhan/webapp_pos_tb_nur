import { useEffect, useMemo, useState, useCallback } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import { buildAssetChangeRecord } from './assetChangeConfig';
import {
    AssetChangeAdditionalInfoSection,
    AssetChangeExpenseSection,
    AssetChangeGeneralSection,
    AssetChangeHeader,
} from './AssetChangeSections';
import { buildFormValues } from './assetChangeShared';
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

export default function AssetChangeFormView({ pageId, config, activeLevel2Tab, onOpenContent, onRefresh }) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildAssetChangeRecord(
                      config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId },
                      config,
                  )
                : config.draft,
        [activeRecordId, config],
    );
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFormValues(sourceRecord));
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [fixedAssets, setFixedAssets] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const isDetail = Boolean(activeRecordId);

    // Ambil data untuk translasi ID
    useEffect(() => {
        listBackendResource('fixed-assets', { per_page: 200 }).then(res => {
            setFixedAssets(res?.data ?? res ?? []);
        }).catch(err => console.error('Gagal mengambil aset tetap:', err));

        listBackendResource('accounts', { per_page: 200 }).then(res => {
            setAccounts(res?.data ?? res ?? []);
        }).catch(err => console.error('Gagal mengambil akun perkiraan:', err));
    }, []);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'general');
        setValues(buildFormValues(sourceRecord));
        setErrors({});
    }, [config.sectionTabs, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            changeType: sourceRecord.changeType ?? '',
            asset: sourceRecord.asset ?? [],
            autoNumber: sourceRecord.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? '',
            transactionDate: sourceRecord.transactionDate ?? '',
            depreciationMethod: sourceRecord.depreciationMethod ?? '',
            residualValue: sourceRecord.residualValue ?? '',
            changeNotes: sourceRecord.changeNotes ?? '',
            branch: sourceRecord.branch ?? [],
            department: sourceRecord.department ?? [],
            assetAccount: sourceRecord.assetAccount ?? [],
            taxEnabled: sourceRecord.taxEnabled ?? false,
        }),
        [sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            changeType: values.changeType,
            asset: values.asset,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            transactionDate: values.transactionDate,
            depreciationMethod: values.depreciationMethod,
            residualValue: values.residualValue,
            changeNotes: values.changeNotes,
            branch: values.branch,
            department: values.department,
            assetAccount: values.assetAccount,
            taxEnabled: values.taxEnabled,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.asset, type: 'array', value: values.asset },
                    {
                        label: config.labels.number,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.asset,
            config.labels.number,
            currentComparable,
            initialComparable,
            values.asset,
            values.autoNumber,
            values.documentNumber,
            values.numberingType,
        ],
    );

    const handleSave = useCallback(async () => {
        setSaving(true);
        setErrors({});
        const loadingToastId = showCrudLoadingToast(isDetail ? 'Sedang memperbarui data.' : 'Sedang menyimpan data baru.');

        try {
            const selectedAssetObj = fixedAssets.find(fa => fa.name === values.asset?.[0]) ?? null;
            const fixedAssetId = selectedAssetObj?.id ?? 1;

            const selectedAccountObj = accounts.find(acc => acc.name === values.assetAccount?.[0]) ?? null;
            const assetAccountId = selectedAccountObj?.id ?? null;

            const lines = [
                {
                    fixed_asset_id: fixedAssetId,
                    quantity: 1,
                    description: values.changeNotes || 'Perubahan Aset Tetap',
                    total_amount: parseFloat(values.bookValue || 0),
                    sort_order: 0
                }
            ];

            const payload = {
                document_number: values.documentNumber || `CHG.${Date.now()}`,
                entry_date: normalizeDisplayDate(values.transactionDate) || new Date().toISOString().slice(0, 10),
                notes: values.changeNotes || '',
                status: 'Posted',
                branch_id: 1,
                primary_account_id: assetAccountId,
                lines
            };

            if (isDetail) {
                await updateBackendResource('asset-changes', activeRecordId, payload);
            } else {
                await createBackendResource('asset-changes', payload);
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
                          disabled: saveDisabled || saving,
                          onClick: handleSave,
                      }
                    : action,
            ),
        [saveDisabled, saving, values.dockActions, handleSave],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    return (
        <TransactionFormLayout
            header={<AssetChangeHeader config={{ ...config, errors }} values={values} setValues={setValues} isDetail={isDetail} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            dockActions={dockActions}
        >
            {activeSectionId === 'expense' ? (
                <AssetChangeExpenseSection config={config} values={values} setValues={setValues} />
            ) : activeSectionId === 'additional-info' ? (
                <AssetChangeAdditionalInfoSection
                    config={config}
                    values={values}
                    setValues={setValues}
                    isDetail={isDetail}
                />
            ) : (
                <AssetChangeGeneralSection
                    config={config}
                    values={values}
                    setValues={setValues}
                    isDetail={isDetail}
                />
            )}
        </TransactionFormLayout>
    );
}
