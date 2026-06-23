import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    CurrencyDefaultAccountsSection,
    CurrencyGeneralSection,
} from './CurrencyFormSections';
import {
    buildCurrencySnapshot,
    buildCurrencyValuesFromRecord,
    findCurrencyDetailRow,
    mapCurrencyRow,
    validateCurrencyValues,
} from './currencyShared';

export default function CurrencyFormView({
    page,
    activeLevel2Tab,
    tableRows = [],
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const config = page.currency;
    const detailRow = useMemo(() => findCurrencyDetailRow(tableRows, activeLevel2Tab), [activeLevel2Tab, tableRows]);
    const isDetailMode = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState('currency-general');
    const initialValues = useMemo(() => buildCurrencyValuesFromRecord(detailRow, config), [config, detailRow]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const isDirty = useMemo(
        () => !areComparableValuesEqual(buildCurrencySnapshot(values), buildCurrencySnapshot(initialValues)),
        [initialValues, values],
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId('currency-general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeTabInstanceId]);

    useFormValuesSync({
        initialValues,
        recordId: detailRow?.id ?? null,
        isDirty,
        setValues,
    });

    const tabs = isDetailMode ? config.detailTabs : config.createTabs;
    const validationMessage = useMemo(() => validateCurrencyValues(values, config), [config, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    useWorkspaceDirtyRegistration({
        pageId: page.id,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetailMode ? 'Sedang memperbarui mata uang.' : 'Sedang menyimpan mata uang.',
            successMessage: isDetailMode ? 'Mata uang berhasil diperbarui.' : 'Mata uang berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    code: String(values.code ?? '').trim().toUpperCase(),
                    name: String(values.countryName ?? '').trim(),
                    symbol: String(values.symbol ?? '').trim(),
                    exchange_rate: 1,
                    is_active: true,
                    accounts_payable_account_id: values.defaultAccountIds.accountsPayable ?? null,
                    accounts_receivable_account_id: values.defaultAccountIds.accountsReceivable ?? null,
                    purchase_advance_account_id: values.defaultAccountIds.purchaseAdvance ?? null,
                    sales_advance_account_id: values.defaultAccountIds.salesAdvance ?? null,
                    sales_discount_account_id: values.defaultAccountIds.salesDiscount ?? null,
                    realized_gain_loss_account_id: values.defaultAccountIds.realizedGainLoss ?? null,
                    unrealized_gain_loss_account_id: values.defaultAccountIds.unrealizedGainLoss ?? null,
                };
                const response = isDetailMode && values.__backendRecordId
                    ? await updateBackendResource('currencies', values.__backendRecordId, payload)
                    : await createBackendResource('currencies', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetailMode && record?.id) {
                    const row = mapCurrencyRow(record);

                    onOpenDetail?.({
                        recordId: row.id,
                        label: row.countryName,
                        tabLabel: row.tabLabel,
                    });
                }
            },
        });
    }

    function requestDelete() {
        if (!values.__backendRecordId || saving) {
            return;
        }

        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus mata uang.',
            successMessage: 'Mata uang berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('currencies', values.__backendRecordId),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    return (
        <ModuleFormTemplate
            form={{
                tabs: tabs,
                saveLabel: config.saveLabel,
            }}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={handleSave}
        >
            {activeTabId === 'currency-default-accounts' && isDetailMode ? (
                <CurrencyDefaultAccountsSection config={config} values={values} setValues={setValues} />
            ) : (
                <CurrencyGeneralSection
                    config={config}
                    values={values}
                    setValues={setValues}
                    isDetailMode={isDetailMode}
                />
            )}

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Mata Uang"
                message="Mata uang ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}
