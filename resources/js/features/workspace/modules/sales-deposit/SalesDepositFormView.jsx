import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    DepositFooter,
    DepositInfoSection,
    DepositStamp,
    DepositSummarySection,
    SalesDepositHeader,
    SalesDepositPaymentSection,
} from './SalesDepositSections';
import {
    buildGeneratedSalesDepositNumber,
    buildLookupLabel,
    buildSalesDepositFormState,
    buildSalesDepositPayload,
    parseNumericInput,
    validateSalesDepositValues,
} from './salesDepositShared';
import { useTransactionForm, buildWorkspaceDockActions } from '@/features/workspace/shared/hooks/useTransactionForm';
import { handleFormSaveSuccess, clearValidationErrors } from '@/features/workspace/shared/crudFormActions';
import { getComparableTransactionFields, calculateDepositTaxes } from './salesDepositFormUtils';

export default function SalesDepositFormView({
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
        resourceName: 'sales-deposits',
        activeRecordId,
        buildRecord,
        config,
    });
    const [values, setValues, isDirty, resetForm] = useFormDraftState({
        sourceRecord,
        buildFormState: buildSalesDepositFormState,
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

    const validationMessage = useMemo(() => validateSalesDepositValues(values, config), [config, values]);

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
        () => buildWorkspaceDockActions({
            dockActions: values.dockActions,
            isDetail,
            saveDisabled,
            saving,
            onSave,
            onDelete: onRequestDelete
        }),
        [values.dockActions, isDetail, saveDisabled, saving, onSave, onRequestDelete]
    );



    async function onSave() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui uang muka penjualan.' : 'Sedang menyimpan uang muka penjualan.',
            successMessage: isDetail ? 'Uang muka penjualan berhasil diperbarui.' : 'Uang muka penjualan berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedSalesDepositNumber()
                        : values.documentNumber;
                const payload = buildSalesDepositPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = values.__backendRecordId
                    ? await updateBackendResource('sales-deposits', values.__backendRecordId, payload)
                    : await createBackendResource('sales-deposits', payload);

                return {
                    record: response?.data ?? null,
                    resolvedDocumentNumber,
                };
            },
            onSuccess: (params) =>
                handleFormSaveSuccess({
                    ...params,
                    pageId,
                    resourceKey: 'sales-deposits',
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
        if (!values.__backendRecordId) {
            return;
        }
        requestDelete();
    }

    async function onDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await handleDelete({
            loadingMessage: 'Sedang menghapus uang muka penjualan.',
            successMessage: 'Uang muka penjualan berhasil dihapus.',
            execute: () => deleteBackendResource('sales-deposits', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }
    const handlers = useMemo(
        () => ({
            onProcessPembayaran: (formValues) => {
                if (!formValues.__backendRecordId) return;
                window.__pendingImportSalesDeposit = { id: formValues.__backendRecordId };
                window.dispatchEvent(
                    new CustomEvent('workspace:open-page', {
                        detail: {
                            pageId: 'sales-receipt',
                            targetTabId: 'sales-receipt-create',
                        },
                    })
                );
            },
        }),
        []
    );

    return (
        <>
            <TransactionFormLayout
                isLoading={isLoading}
                validationMessage={validationMessage}
                header={<SalesDepositHeader config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />}
                sectionTabs={sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={<DepositFooter values={values} />}
                dockActions={dockActions}
            >
                <div className="relative flex-1 flex flex-col min-h-0">
                    {isDetail && values.approvalStamp ? <DepositStamp label={values.approvalStamp} tone="blue" className="absolute top-[54%] right-10 sm:right-14 z-30 pointer-events-none w-[140px] h-[140px] opacity-85 select-none -translate-y-1/2" /> : null}
                    {isDetail && values.statusStamp ? <DepositStamp label={values.statusStamp} tone={values.statusTone} className="absolute top-[54%] right-10 sm:right-14 z-30 pointer-events-none w-[140px] h-[140px] opacity-85 select-none -translate-y-1/2" /> : null}

                    {activeSectionId === 'additional-info' ? (
                        <DepositInfoSection config={config} values={values} setValues={setValues} isDetail={isDetail} />
                    ) : activeSectionId === 'invoice-info' ? (
                        <DepositSummarySection config={config} values={values} />
                    ) : (
                        <SalesDepositPaymentSection
                            config={config}
                            values={values}
                            setValues={setValues}
                            isDetail={isDetail}
                            onDepositAmountBlur={() => setCommittedDepositAmount(values.depositAmount)}
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
