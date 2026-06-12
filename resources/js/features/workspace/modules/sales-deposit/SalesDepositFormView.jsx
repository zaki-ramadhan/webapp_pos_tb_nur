import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import TextInput from '@/components/ui/TextInput';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import {
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    DepositFooter,
    DepositInfoSection,
    DepositSmartlinkSection,
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
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
import CheckboxField from '@/components/ui/CheckboxField';

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
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'deposit');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () => (activeRecordId ? buildRecord(config.rowMap?.[activeRecordId] ?? config.table.rows.find((row) => row.id === activeRecordId)) : config.draft),
        [activeRecordId, buildRecord, config],
    );
    const [values, setValues] = useState(() => buildSalesDepositFormState(sourceRecord, config));
    const isDetail = Boolean(activeRecordId);
    const initialComparable = useMemo(() => buildSalesDepositFormState(sourceRecord, config), [config, sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'deposit');
        setValues(buildSalesDepositFormState(sourceRecord, config));
    }, [config, sourceRecord]);

    const validationMessage = useMemo(() => validateSalesDepositValues(values, config), [config, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(initialComparable, values), [initialComparable, values]);

    const {
        status,
        setStatus,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        selectLookup,
        handleSave,
        requestDelete,
        handleDelete,
    } = useTransactionForm({ validationMessage });

    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? [])
                .filter((action) => (isDetail ? true : action.id !== 'delete'))
                .map((action) =>
                    action.id === 'save'
                        ? {
                              ...action,
                              disabled: saveDisabled,
                              label: saving ? 'Memproses...' : action.label,
                              onClick: onSave,
                          }
                        : action.id === 'delete'
                          ? {
                                ...action,
                                label: saving ? 'Memproses...' : action.label,
                                onClick: onRequestDelete,
                            }
                          : action,
                ),
        [isDetail, saveDisabled, saving, values.dockActions],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

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
            onSuccess: async ({ record, resolvedDocumentNumber }) => {
                await onRefresh?.();

                if (!values.__backendRecordId && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.document_number ?? resolvedDocumentNumber,
                        tabLabel: record.document_number ?? resolvedDocumentNumber,
                    });
                }
            },
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
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
            onSelectCustomer: () =>
                selectLookup('customers', 'pelanggan', (record) =>
                    setValues((current) => ({
                        ...current,
                        __customerId: record.id,
                        customer: [buildLookupLabel(record)],
                    })),
                ),
            onRemoveCustomer: () =>
                setValues((current) => ({
                    ...current,
                    __customerId: null,
                    customer: [],
                })),
            onSelectPaymentTerm: () =>
                selectLookup('payment-terms', 'syarat pembayaran', (record) =>
                    setValues((current) => ({
                        ...current,
                        __paymentTermId: record.id,
                        paymentTerms: [buildLookupLabel(record)],
                    })),
                ),
            onRemovePaymentTerm: (value) =>
                setValues((current) => ({
                    ...current,
                    __paymentTermId: null,
                    paymentTerms: (current.paymentTerms ?? []).filter((item) => item !== value),
                })),
            onSelectBranch: () =>
                selectLookup('branches', 'cabang', (record) =>
                    setValues((current) => ({
                        ...current,
                        __branchId: record.id,
                        branches: [buildLookupLabel(record)],
                    })),
                ),
            onRemoveBranch: (value) =>
                setValues((current) => ({
                    ...current,
                    __branchId: null,
                    branches: (current.branches ?? []).filter((item) => item !== value),
                })),
        }),
        [selectLookup],
    );

    return (
        <>
            <TransactionFormLayout
                header={<SalesDepositHeader config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={<DepositFooter values={values} />}
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                <div className="relative">
                    {isDetail && values.approvalStamp ? <DepositStamp label={values.approvalStamp} tone="blue" className="right-[12%] top-[-8px]" /> : null}
                    {isDetail && values.statusStamp ? <DepositStamp label={values.statusStamp} tone={values.statusTone} className={activeSectionId === 'invoice-info' ? 'left-[49%] top-[37%]' : 'left-[49%] top-[33%]'} /> : null}

                    {activeSectionId === 'additional-info' ? (
                        <DepositInfoSection config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />
                    ) : activeSectionId === 'smartlink' ? (
                        <DepositSmartlinkSection config={config} />
                    ) : activeSectionId === 'invoice-info' ? (
                        <DepositSummarySection config={config} values={values} />
                    ) : (
                        <section>
                            <TransactionSectionHeading title={config.depositTitle} icon="payment" />

                            <div className="mt-4 grid gap-y-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                                <TransactionFieldLabel label={config.labels.depositAmount} required />
                                <div className="max-w-[320px]">
                                    <TextInput
                                        value={values.depositAmount}
                                        onChange={(event) =>
                                            setValues((current) => {
                                                const depositAmount = event.target.value;
                                                const totalAmount = parseNumericInput(depositAmount);

                                                return {
                                                    ...current,
                                                    depositAmount,
                                                    subtotal: `Rp ${Number.isFinite(totalAmount) ? totalAmount.toLocaleString('id-ID') : '0'}`,
                                                    total: `Rp ${Number.isFinite(totalAmount) ? totalAmount.toLocaleString('id-ID') : '0'}`,
                                                };
                                            })
                                        }
                                        className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                    />
                                </div>

                                <TransactionFieldLabel label={config.labels.purchaseOrderNumber} />
                                <TextInput
                                    value={values.purchaseOrderNumber}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            purchaseOrderNumber: event.target.value,
                                        }))
                                    }
                                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                />

                                <TransactionFieldLabel label={config.labels.tax} />
                                <div className="flex flex-wrap gap-8 text-xs sm:text-sm text-[#1f2436]">
                                    <CheckboxField
                                        id="taxEnabled"
                                        label="Kena Pajak"
                                        checked={values.taxEnabled}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                taxEnabled: event.target.checked,
                                            }))
                                        }
                                        inputClassName="h-[20px] w-[20px] rounded"
                                        containerClassName="w-auto inline-flex items-center"
                                    />
                                    <CheckboxField
                                        id="taxIncluded"
                                        label="Total termasuk Pajak"
                                        checked={values.taxIncluded}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                taxIncluded: event.target.checked,
                                            }))
                                        }
                                        inputClassName="h-[20px] w-[20px] rounded"
                                        containerClassName="w-auto inline-flex items-center"
                                    />
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </TransactionFormLayout>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Hapus Uang Muka Penjualan"
                message="Uang muka penjualan ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
