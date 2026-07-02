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
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

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
    const [localRecord, setLocalRecord] = useState(null);

    useEffect(() => {
        setLocalRecord(null);
    }, [activeRecordId]);

    const sourceRecord = useMemo(() => {
        if (localRecord) {
            return localRecord;
        }

        return activeRecordId
            ? buildRecord(config.rowMap?.[activeRecordId] ?? config.table.rows.find((row) => row.id === activeRecordId))
            : config.draft;
    }, [activeRecordId, buildRecord, config, localRecord]);
    const [values, setValues] = useState(() => buildSalesDepositFormState(sourceRecord, config));
    const isDetail = Boolean(activeRecordId);
    const initialComparable = useMemo(() => buildSalesDepositFormState(sourceRecord, config), [config, sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'deposit');
    }, [activeRecordId]);

    useEffect(() => {
        const nextValues = buildSalesDepositFormState(sourceRecord, config);
        setValues((current) => {
            const hasEdits = !areComparableValuesEqual(initialComparable, current);
            return hasEdits ? current : nextValues;
        });
    }, [sourceRecord]);

    const validationMessage = useMemo(() => validateSalesDepositValues(values, config), [config, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(initialComparable, values), [initialComparable, values]);

    const {
        status,
        setStatus,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        handleSave,
        requestDelete,
        handleDelete,
    } = useTransactionForm({ validationMessage });

    const saveDisabled = saving || !isDirty || Boolean(validationMessage && (validationMessage.includes('wajib diisi') || validationMessage.includes('wajib dipilih') || validationMessage.includes('wajib diisi minimal 1')));

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
                if (isDetail && record && activeLevel2Tab?.id) {
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

                if (record) {
                    const parsed = buildRecord ? buildRecord(record) : record;
                    setLocalRecord(parsed);
                }

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



    return (
        <>
            <TransactionFormLayout
            validationMessage={validationMessage}
                header={<SalesDepositHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
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
                        <DepositInfoSection config={config} values={values} setValues={setValues} isDetail={isDetail} />
                    ) : activeSectionId === 'smartlink' ? (
                        <DepositSmartlinkSection config={config} />
                    ) : activeSectionId === 'invoice-info' ? (
                        <DepositSummarySection config={config} values={values} />
                    ) : (
                        <section className="max-w-[540px] w-full">
                            <TransactionSectionHeading title={config.depositTitle} icon="payment" />

                            <div className="mt-4 flex flex-col gap-y-2 pl-3 sm:pl-5">
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
                                            onBlur={(event) =>
                                                setValues((current) => {
                                                    const depositAmount = event.target.value;
                                                    const totalAmount = parseNumericInput(depositAmount);
                                                    return {
                                                        ...current,
                                                        subtotal: `Rp ${Number.isFinite(totalAmount) ? totalAmount.toLocaleString('id-ID') : '0'}`,
                                                        total: `Rp ${Number.isFinite(totalAmount) ? totalAmount.toLocaleString('id-ID') : '0'}`,
                                                    };
                                                })
                                            }
                                            maxLength={11}
                                            prefix="Rp"
                                            className="h-[34px] rounded-[4px] border-ui-border"
                                            prefixClassName="min-w-0 px-3 justify-center text-slate-500 font-normal border-r-ui-border-medium bg-ui-bg-hover text-sm"
                                            inputClassName="text-slate-700 text-sm"
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
                                            className="h-[34px] rounded-[4px] border-ui-border"
                                            inputClassName="text-xs sm:text-sm text-brand-dark"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                                    <TransactionFieldLabel label={config.labels.tax} />
                                    <div className="flex flex-wrap gap-8 text-xs sm:text-sm text-brand-dark">
                                        <CheckboxField
                                            id="taxEnabled"
                                            label="Kena Pajak"
                                            checked={values.taxEnabled}
                                            onChange={(event) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    taxEnabled: event.target.checked,
                                                    ...(!event.target.checked ? { __taxId: null, taxName: '' } : {}),
                                                }))
                                            }
                                            align="center"
                                            inputClassName="h-3.5 w-3.5 rounded-[3px]"
                                            containerClassName="w-auto inline-flex"
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
                                                onSelectAccount={(record, label) => {
                                                    setValues((current) => ({
                                                        ...current,
                                                        __taxId: record ? record.id : null,
                                                        taxName: label || '',
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
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
