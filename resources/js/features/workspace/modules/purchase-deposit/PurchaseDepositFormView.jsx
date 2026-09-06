import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    PurchaseDepositFooter,
    PurchaseDepositHeader,
    PurchaseDepositInfoSection,
    PurchaseDepositInvoiceInfoSection,
    PurchaseDepositSummarySection,
} from './PurchaseDepositSections';
import { DepositStamp } from '@/features/workspace/modules/shared/DepositWorkspaceShared';
import {
    buildGeneratedPurchaseDepositNumber,
    buildPurchaseDepositFormState,
    buildPurchaseDepositPayload,
    parseNumericInput,
    validatePurchaseDepositValues,
} from './purchaseDepositShared';
import { useTransactionForm, buildWorkspaceDockActions } from '@/features/workspace/shared/hooks/useTransactionForm';
import { handleFormSaveSuccess, clearValidationErrors } from '@/features/workspace/shared/crudFormActions';
import { getComparableTransactionFields, calculateDepositTaxes } from './purchaseDepositFormUtils';

export default function PurchaseDepositFormView({
    pageId,
    config,
    buildRecord,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: 'purchase-deposits',
        activeRecordId,
        buildRecord,
        config,
    });

    const [values, setValues, isDirty, resetForm] = useFormDraftState({
        sourceRecord,
        buildFormState: buildPurchaseDepositFormState,
        config,
        pageId,
        activeTabId: activeLevel2Tab?.id,
        onSync: useCallback((nextValues) => setCommittedDepositAmount(nextValues.depositAmount), []),
        isEqual: useCallback(
            (a, b) =>
                areComparableValuesEqual(
                    getComparableTransactionFields(a),
                    getComparableTransactionFields(b),
                ),
            [],
        ),
    });

    const [committedDepositAmount, setCommittedDepositAmount] = useState(() => values.depositAmount);
    const isDetail = Boolean(activeRecordId);

    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'deposit');

    const sectionTabs = useMemo(() => {
        const tabs = [...(config.sectionTabs || [])];
        if (isDetail) {
            tabs.push({ id: 'invoice-info', label: 'Informasi Faktur', icon: 'payment' });
        }
        return tabs;
    }, [config.sectionTabs, isDetail]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'deposit');
    }, [activeRecordId]);

    useEffect(() => {
        const baseAmount = parseNumericInput(values.depositAmount);
        const totals = calculateDepositTaxes(baseAmount, values.taxEnabled, values.__taxId, values.taxRate, values.taxIncluded);

        setValues((current) => {
            if (
                current.subtotal === totals.subtotal &&
                current.taxTotalFormatted === totals.taxTotalFormatted &&
                current.total === totals.total
            ) {
                return current;
            }
            return {
                ...current,
                subtotal: totals.subtotal,
                taxTotalFormatted: totals.taxTotalFormatted,
                total: totals.total,
            };
        });
    }, [values.depositAmount, values.taxEnabled, values.taxIncluded, values.taxRate, values.__taxId]);

    useEffect(() => {
        clearValidationErrors();
        return () => clearValidationErrors();
    }, [pageId, isDetail]);

    const validationMessage = useMemo(() => validatePurchaseDepositValues(values, config), [config, values]);

    const {
        status,
        setStatus,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        handleSave,
        requestDelete,
        handleDelete,
        saveDisabled,
    } = useTransactionForm({ validationMessage, isDirty });

    const dockActions = useMemo(
        () =>
            buildWorkspaceDockActions({
                dockActions: values.dockActions,
                isDetail,
                saveDisabled,
                saving,
                onSave,
                onDelete: onRequestDelete,
            }),
        [values.dockActions, isDetail, saveDisabled, saving, onSave, onRequestDelete]
    );

    async function onSave() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui uang muka pembelian.' : 'Sedang menyimpan uang muka pembelian.',
            successMessage: isDetail ? 'Uang muka pembelian berhasil diperbarui.' : 'Uang muka pembelian berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedPurchaseDepositNumber()
                        : values.documentNumber;
                const payload = buildPurchaseDepositPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = values.__backendRecordId
                    ? await updateBackendResource('purchase-deposits', values.__backendRecordId, payload)
                    : await createBackendResource('purchase-deposits', payload);

                return {
                    record: response?.data ?? null,
                    resolvedDocumentNumber,
                };
            },
            onSuccess: (params) =>
                handleFormSaveSuccess({
                    ...params,
                    pageId,
                    resourceKey: 'purchase-deposits',
                    onRefresh,
                    buildRecord,
                    config,
                    setLocalRecord,
                    resetForm,
                    activeLevel2Tab,
                    isDetail: Boolean(values.__backendRecordId),
                    onOpenDetail,
                }),
        });
    }

    function onRequestDelete() {
        if (!values.__backendRecordId) return;
        requestDelete();
    }

    async function onDelete() {
        if (!values.__backendRecordId) return;

        await handleDelete({
            loadingMessage: 'Sedang menghapus uang muka pembelian.',
            successMessage: 'Uang muka pembelian berhasil dihapus.',
            execute: () => deleteBackendResource('purchase-deposits', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }

    return (
        <>
            <TransactionFormLayout
                isLoading={isLoading}
                validationMessage={validationMessage}
                header={
                    <PurchaseDepositHeader
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                    />
                }
                sectionTabs={sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={<PurchaseDepositFooter values={values} />}
                dockActions={dockActions}
            >
                <div className="relative flex-1 flex flex-col min-h-0">
                    {isDetail && values.statusStamp ? (
                        <DepositStamp
                            label={values.statusStamp}
                            tone={values.statusTone || 'gray'}
                            className="absolute top-[54%] right-10 sm:right-14 z-30 pointer-events-none w-[140px] h-[140px] opacity-85 select-none -translate-y-1/2"
                        />
                    ) : null}

                    {activeSectionId === 'deposit' && (
                        <PurchaseDepositSummarySection
                            config={config}
                            values={values}
                            setValues={setValues}
                            onDepositAmountBlur={(val) => setCommittedDepositAmount(val)}
                        />
                    )}

                    {activeSectionId === 'additional-info' && (
                        <PurchaseDepositInfoSection
                            config={config}
                            values={values}
                            setValues={setValues}
                            isDetail={isDetail}
                        />
                    )}

                    {activeSectionId === 'invoice-info' && (
                        <PurchaseDepositInvoiceInfoSection
                            config={config}
                            values={values}
                        />
                    )}
                </div>
            </TransactionFormLayout>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.documentNumber}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </>
    );
}
