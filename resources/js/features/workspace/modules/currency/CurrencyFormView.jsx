import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';
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

    useEffect(() => {
        setActiveTabId('currency-general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [initialValues]);

    const tabs = isDetailMode ? config.detailTabs : config.createTabs;
    const validationMessage = useMemo(() => validateCurrencyValues(values, config), [config, values]);
    const isDirty = useMemo(
        () => !areComparableValuesEqual(buildCurrencySnapshot(values), buildCurrencySnapshot(initialValues)),
        [initialValues, values],
    );
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
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[642px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    <CrudStatusMessage status={status} />

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
                </div>

                <div className="flex justify-end lg:shrink-0">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        {!isDetailMode || activeTabId === 'currency-default-accounts' ? (
                            <DockActionButton
                                label={saving ? 'Memproses...' : config.saveLabel}
                                tone="primary"
                                icon={<SaveIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                                onClick={handleSave}
                                disabled={saveDisabled}
                            />
                        ) : null}
                        {isDetailMode ? (
                            <DockActionButton
                                label={saving ? 'Memproses...' : config.deleteLabel}
                                tone="danger"
                                icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                                disabled={saving}
                                onClick={requestDelete}
                            />
                        ) : null}
                    </div>
                </div>
            </div>

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
        </div>
    );
}
