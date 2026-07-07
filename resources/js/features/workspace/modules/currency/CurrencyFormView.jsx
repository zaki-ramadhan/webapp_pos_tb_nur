import { useEffect, useMemo, useRef, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
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
    const [hasSaved, setHasSaved] = useState(false);

    const isDirty = useMemo(
        () => !hasSaved && !areComparableValuesEqual(buildCurrencySnapshot(values), buildCurrencySnapshot(initialValues)),
        [initialValues, values, hasSaved],
    );

    const prevValuesRef = useRef(values);
    useEffect(() => {
        if (JSON.stringify(values) !== JSON.stringify(prevValuesRef.current)) {
            setHasSaved(false);
            prevValuesRef.current = values;
        }
    }, [values]);

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
        values,
        setValues,
    });

    const tabs = isDetailMode ? config.detailTabs : config.createTabs;
    const validationMessage = useMemo(() => validateCurrencyValues(values, config), [config, values]);
    const {
        status,
        setStatus,
        saving,
        setSaving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        saveDisabled,
    } = useTransactionForm({ validationMessage, isDirty });

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
                setHasSaved(true);
                if (isDetailMode && record && activeLevel2Tab?.id) {
                    window.dispatchEvent(
                        new CustomEvent('workspace:update-tab-label', {
                            detail: {
                                pageId: pageId ?? (typeof page !== 'undefined' ? page?.id : null),
                                tabId: activeLevel2Tab.id,
                                label: record?.name ?? record?.full_name ?? record?.countryName ?? record?.country_name ?? record?.number ?? values?.name ?? values?.fullName ?? values?.groupName ?? '',
                            },
                        })
                    );
                }
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
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }

    return (
        <ModuleFormTemplate
            validationMessage={validationMessage}
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
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.name || values.code}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}
