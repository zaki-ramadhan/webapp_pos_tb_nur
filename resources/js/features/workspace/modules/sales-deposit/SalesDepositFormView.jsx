import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import TextInput from '@/components/ui/TextInput';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import SelectField from '@/components/ui/SelectField';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    DepositFooter,
    DepositInfoSection,
    DepositStamp,
    DepositSummarySection,
    SalesDepositHeader,
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
import CheckboxField from '@/components/ui/CheckboxField';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
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
        const baseAmount = parseNumericInput(committedDepositAmount);
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
    }, [committedDepositAmount, values.taxEnabled, values.taxIncluded, values.taxRate, values.__taxId]);

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
                        <div className={`w-full ${values.taxEnabled ? 'flex flex-col lg:flex-row gap-x-8 items-start' : 'max-w-[540px]'}`}>
                            {/* Left Column: Uang Muka */}
                            <section className={values.taxEnabled ? 'flex-1 w-full lg:max-w-[50%]' : 'w-full'}>
                                <TransactionSectionHeading title={config.depositTitle} icon="payment" />
                                <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                                    {values.__customerId && (
                                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                            <TransactionFieldLabel label="No. SO" />
                                            <div className="max-w-[320px] w-full">
                                                <AccountLookupTextInput
                                                    id="salesOrder"
                                                    resource="sales-orders"
                                                    value={values.salesOrderNumber || ''}
                                                    placeholder="Cari/Pilih Pesanan Penjualan..."
                                                    searchLabel="Cari pesanan penjualan"
                                                    disabled={isDetail}
                                                    queryParams={{ customer_id: values.__customerId }}
                                                    onSelectAccount={(record, label) => {
                                                        setValues((current) => ({
                                                            ...current,
                                                            __salesOrderId: record ? record.id : null,
                                                            salesOrderNumber: label || '',
                                                        }));
                                                    }}
                                                    className="h-[40px] rounded-[4px] border-slate-400 bg-slate-50"
                                                    inputClassName="text-xs sm:text-sm text-brand-dark bg-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                        <TransactionFieldLabel label={config.labels.depositAmount} required />
                                        <div className="max-w-[320px] w-full">
                                            <TextInput
                                                id="depositAmount"
                                                name="depositAmount"
                                                value={values.depositAmount}
                                                onChange={(event) =>
                                                    setValues((current) => ({
                                                        ...current,
                                                        depositAmount: event.target.value,
                                                    }))
                                                }
                                                onBlur={() => setCommittedDepositAmount(values.depositAmount)}
                                                maxLength={11}
                                                prefix="Rp"
                                                className="h-[34px] rounded-[4px] border-ui-border bg-slate-50"
                                                prefixClassName="min-w-0 px-3 justify-center text-slate-500 font-normal border-r-ui-border-medium bg-ui-bg-hover text-sm"
                                                inputClassName="text-slate-700 text-sm bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                        <TransactionFieldLabel label={config.labels.purchaseOrderNumber} />
                                        <div className="max-w-[320px] w-full">
                                            <TextInput
                                                value={values.purchaseOrderNumber}
                                                onChange={(event) =>
                                                    setValues((current) => ({
                                                        ...current,
                                                        purchaseOrderNumber: event.target.value,
                                                    }))
                                                }
                                                className="h-[34px] rounded-[4px] border-ui-border bg-slate-50"
                                                inputClassName="text-xs sm:text-sm text-brand-dark bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                        <TransactionFieldLabel label={config.labels.tax} />
                                        <div className="flex flex-wrap gap-8 text-xs sm:text-sm text-brand-dark">
                                             <CheckboxField
                                                label="Kena Pajak"
                                                checked={values.taxEnabled}
                                                onChange={(event) =>
                                                    setValues((current) => ({
                                                        ...current,
                                                        taxEnabled: event.target.checked,
                                                        ...(!event.target.checked
                                                            ? { __taxId: null, taxName: '', taxRate: 0 }
                                                            : { taxTransactionType: current.taxTransactionType || 'Faktur Pajak' }),
                                                    }))
                                                }
                                                align="center"
                                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                                containerClassName="w-auto inline-flex"
                                            />
                                            <CheckboxField
                                                label="Total termasuk Pajak"
                                                checked={values.taxIncluded}
                                                onChange={(event) =>
                                                    setValues((current) => ({
                                                        ...current,
                                                        taxIncluded: event.target.checked,
                                                    }))
                                                }
                                                align="center"
                                                inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                                containerClassName="w-auto inline-flex"
                                            />
                                        </div>
                                    </div>

                                    {values.taxEnabled && (
                                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                            <TransactionFieldLabel label="PPN" required />
                                            <div className="max-w-[320px] w-full">
                                                <AccountLookupTextInput
                                                    id="tax"
                                                    resource="taxes"
                                                    value={values.taxName || ''}
                                                    placeholder="Cari/Pilih PPN..."
                                                    searchLabel="Cari pajak"
                                                    queryParams={{ code: ['PPN-11', 'PPN-12'] }}
                                                    onSelectAccount={(record, label) => {
                                                        setValues((current) => ({
                                                            ...current,
                                                            __taxId: record ? record.id : null,
                                                            taxName: label || '',
                                                            taxRate: record ? parseFloat(record.rate) : 0,
                                                        }));
                                                    }}
                                                    className="h-[40px] rounded-[4px] border-slate-400 bg-slate-50"
                                                    inputClassName="text-xs sm:text-sm text-brand-dark bg-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Right Column: Info Pajak */}
                            {values.taxEnabled && (
                                <section className="flex-1 w-full lg:max-w-[50%] mt-8 lg:mt-0">
                                    <TransactionSectionHeading title="Info Pajak" icon="tax" />
                                    <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
                                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                            <TransactionFieldLabel label="Tgl Faktur Pajak" required />
                                            <div className="max-w-[320px] w-full">
                                                <TransactionDateInput
                                                    value={values.taxInvoiceDate}
                                                    onChange={(nextValue) => setValues((current) => ({ ...current, taxInvoiceDate: nextValue }))}
                                                    className="max-w-none bg-slate-50"
                                                    inputClassName="bg-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                            <TransactionFieldLabel label="Tipe Transaksi" required />
                                            <div className="max-w-[320px] w-full">
                                                <SelectField
                                                    value={values.taxTransactionType}
                                                    onChange={(event) => setValues((current) => ({ ...current, taxTransactionType: event.target.value }))}
                                                    className="h-[40px] rounded-[4px] border-ui-border w-full bg-slate-50"
                                                    selectClassName="text-xs sm:text-sm text-brand-dark"
                                                >
                                                    <option value="Faktur Pajak">Faktur Pajak (Standar)</option>
                                                    <option value="Digunggung">Digunggung (Penjualan Eceran)</option>
                                                </SelectField>
                                            </div>
                                        </div>

                                        {values.taxTransactionType === 'Faktur Pajak' && (
                                            <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                                <TransactionFieldLabel label="No. Faktur Pajak" />
                                                <div className="max-w-[320px] w-full">
                                                    <TextInput
                                                        id="taxInvoiceNumber"
                                                        name="taxInvoiceNumber"
                                                        value={values.taxInvoiceNumber}
                                                        onChange={(event) =>
                                                            setValues((current) => ({
                                                                ...current,
                                                                taxInvoiceNumber: event.target.value,
                                                            }))
                                                        }
                                                        maxLength={20}
                                                        className="h-[34px] rounded-[4px] border-ui-border bg-slate-50"
                                                        inputClassName="text-slate-700 text-sm bg-transparent"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>
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
