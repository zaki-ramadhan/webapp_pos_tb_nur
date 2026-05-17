import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import SalesReceiptInvoiceModal from '@/features/workspace/modules/sales-receipt/SalesReceiptInvoiceModal';
import {
    SalesReceiptAdditionalInfoSection,
    SalesReceiptInvoicesSection,
} from '@/features/workspace/modules/sales-receipt/SalesReceiptFormSections';
import {
    applySalesReceiptInvoices,
    buildGeneratedSalesReceiptNumber,
    buildLookupLabel,
    buildSalesReceiptFormState,
    buildSalesReceiptInvoiceFromRecord,
    buildSalesReceiptPayload,
    ReceiptAmountActionButton,
    ReceiptAmountInput,
    ReceiptSummaryFooter,
    validateSalesReceiptValues,
} from '@/features/workspace/modules/sales-receipt/salesReceiptViewShared';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionRail,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';

export default function SalesReceiptFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
    buildRecord,
}) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [activeInvoiceModal, setActiveInvoiceModal] = useState(null);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.draft;
        }

        const row = config.rowMap?.[activeRecordId];

        if (row?.__backendRecord && buildRecord) {
            return buildRecord(row.__backendRecord, config);
        }

        return config.detailRecords?.[activeRecordId] ?? config.draft;
    }, [activeRecordId, buildRecord, config]);
    const [values, setValues] = useState(() => buildSalesReceiptFormState(sourceRecord));
    const isDetail = Boolean(activeRecordId);
    const initialComparable = useMemo(() => buildSalesReceiptFormState(sourceRecord), [sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildSalesReceiptFormState(sourceRecord));
        setActiveInvoiceModal(null);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config.sectionTabs, sourceRecord]);

    const validationMessage = useMemo(() => validateSalesReceiptValues(values, config), [config, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(initialComparable, values), [initialComparable, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? config.draft?.dockActions ?? [])
                .filter((action) => (isDetail ? true : action.id !== 'delete'))
                .map((action) => {
                    if (action.id === 'save') {
                        return {
                            ...action,
                            tone: isDetail ? action.tone : 'primary',
                            disabled: saveDisabled,
                            label: saving ? 'Memproses...' : action.label,
                            onClick: handleSave,
                        };
                    }

                    if (action.id === 'delete') {
                        return {
                            ...action,
                            label: saving ? 'Memproses...' : action.label,
                            onClick: requestDelete,
                        };
                    }

                    return action;
                }),
        [config.draft?.dockActions, isDetail, saveDisabled, saving, values.dockActions],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function selectLookup(resource, title, labelBuilder, onApply) {
        try {
            const record = await promptSelectBackendRecord(resource, title, labelBuilder);

            if (!record) {
                return;
            }

            onApply(record);
            setStatus({ tone: '', message: '' });
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error, error.message) });
        }
    }

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui penerimaan penjualan.' : 'Sedang menyimpan penerimaan penjualan.',
            successMessage: isDetail ? 'Penerimaan penjualan berhasil diperbarui.' : 'Penerimaan penjualan berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedSalesReceiptNumber()
                        : values.documentNumber;
                const payload = buildSalesReceiptPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = values.__backendRecordId
                    ? await updateBackendResource('sales-receipts', values.__backendRecordId, payload)
                    : await createBackendResource('sales-receipts', payload);

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
            loadingMessage: 'Sedang menghapus penerimaan penjualan.',
            successMessage: 'Penerimaan penjualan berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('sales-receipts', values.__backendRecordId),
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
                selectLookup('customers', 'pelanggan', (record) => buildLookupLabel(record), (record) =>
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
            onSelectBankAccount: () =>
                selectLookup('accounts', 'bank penerimaan', (record) => buildLookupLabel(record), (record) =>
                    setValues((current) => ({
                        ...current,
                        __bankAccountId: record.id,
                        bankAccounts: [buildLookupLabel(record)],
                    })),
                ),
            onRemoveBankAccount: () =>
                setValues((current) => ({
                    ...current,
                    __bankAccountId: null,
                    bankAccounts: [],
                })),
            onSelectBranch: () =>
                selectLookup('branches', 'cabang', (record) => buildLookupLabel(record), (record) =>
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
            onSelectInvoice: () =>
                selectLookup('sales-invoices', 'faktur penjualan', (record) => buildLookupLabel(record, 'document_number'), (record) =>
                    setValues((current) =>
                        applySalesReceiptInvoices(current, [
                            ...(current.invoices ?? []),
                            buildSalesReceiptInvoiceFromRecord(record),
                        ]),
                    ),
                ),
        }),
        [],
    );

    return (
        <>
            <div className="flex min-h-full flex-col gap-3">
                <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                    <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                        <div className="border-b border-[#d8dde7] px-4 py-4">
                            <div className={`grid gap-x-8 gap-y-3 ${isDetail ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]'}`.trim()}>
                                <div className={`grid gap-y-3 ${isDetail ? 'sm:grid-cols-[170px_minmax(0,1fr)_180px]' : 'sm:grid-cols-[170px_minmax(0,1fr)]'} sm:items-center sm:gap-x-4`.trim()}>
                                    <TransactionFieldLabel label={config.labels.customer} required />
                                    <ChipLookupField
                                        values={values.customer}
                                        placeholder="Cari/Pilih Pelanggan..."
                                        onRemove={handlers.onRemoveCustomer}
                                        searchLabel="Cari pelanggan"
                                        onSearch={handlers.onSelectCustomer}
                                    />
                                    {isDetail ? (
                                        <div className="max-w-[180px]">
                                            <TextInput value={values.currency} readOnly className="h-[40px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-[15px] text-[#1f2436]" />
                                        </div>
                                    ) : null}

                                    <TransactionFieldLabel label={config.labels.bank} required />
                                    <ChipLookupField
                                        values={values.bankAccounts}
                                        placeholder="Cari/Pilih..."
                                        onRemove={handlers.onRemoveBankAccount}
                                        searchLabel="Cari bank"
                                        onSearch={handlers.onSelectBankAccount}
                                        heightClassName="h-[40px]"
                                    />
                                    {isDetail ? <div /> : null}

                                    <TransactionFieldLabel label={config.labels.paymentAmount} />
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="min-w-0 max-w-[280px] flex-1">
                                            <ReceiptAmountInput value={values.paymentAmount} isDetail={isDetail} />
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {values.amountButtons.map((buttonType) => (
                                                <ReceiptAmountActionButton key={buttonType} type={buttonType} />
                                            ))}
                                        </div>
                                    </div>
                                    {isDetail ? <div /> : null}
                                </div>

                                <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                    <div className="flex items-center justify-start gap-4 sm:justify-end">
                                        <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                                        {!isDetail ? (
                                            <TransactionSwitch
                                                checked={values.autoNumber}
                                                onChange={(nextChecked) =>
                                                    setValues((current) => ({
                                                        ...current,
                                                        autoNumber: nextChecked,
                                                    }))
                                                }
                                            />
                                        ) : null}
                                    </div>

                                    {!isDetail && values.autoNumber ? (
                                        <SelectField
                                            value={values.numberingType}
                                            onChange={(event) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    numberingType: event.target.value,
                                                }))
                                            }
                                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                            selectClassName="text-[15px] text-[#1f2436]"
                                        >
                                            {config.numberingOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </SelectField>
                                    ) : (
                                        <TextInput
                                            value={values.documentNumber}
                                            onChange={(event) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    documentNumber: event.target.value,
                                                }))
                                            }
                                            readOnly={Boolean(isDetail)}
                                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                            inputClassName="text-[15px] text-[#1f2436]"
                                        />
                                    )}

                                    <TransactionFieldLabel label={config.labels.entryDate} required className="sm:text-right" />
                                    <div className="max-w-[236px]">
                                        <TransactionDateInput
                                            value={values.entryDate}
                                            onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                                            className="max-w-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CrudStatusMessage status={status} className="mx-3 mt-3" />

                        <div className="flex items-start gap-3 px-2 py-2 sm:px-3">
                            <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                            <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                                {activeSectionId === 'additional-info' ? (
                                    <SalesReceiptAdditionalInfoSection
                                        config={config}
                                        values={values}
                                        setValues={setValues}
                                        isDetail={isDetail}
                                        handlers={handlers}
                                    />
                                ) : (
                                    <SalesReceiptInvoicesSection
                                        config={config}
                                        values={values}
                                        setValues={setValues}
                                        isDetail={isDetail}
                                        onOpenInvoiceModal={setActiveInvoiceModal}
                                        handlers={handlers}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="px-3 pb-3">
                            <ReceiptSummaryFooter paymentAmount={values.paymentAmount} />
                        </div>
                    </div>

                    <div className="shrink-0 lg:w-[104px]">
                        <TransactionDock actions={dockActions} />
                    </div>
                </div>
            </div>

            <SalesReceiptInvoiceModal
                open={Boolean(activeInvoiceModal)}
                modal={activeInvoiceModal}
                onClose={() => setActiveInvoiceModal(null)}
            />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Penerimaan Penjualan"
                message="Penerimaan penjualan ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
