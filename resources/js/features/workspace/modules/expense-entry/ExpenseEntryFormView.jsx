import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ModalBase from '@/components/ui/ModalBase';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { CloseIcon, PencilIcon } from '@/features/workspace/shared/Icons';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout, TransactionTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    ExpenseAdditionalInfoSection,
    ExpenseEntryHeader,
    ExpenseLineItemsSection,
    ExpenseSummarySection,
} from './ExpenseEntrySections';
import {
    applyExpenseLineItems,
    buildExpenseEntryPayload,
    buildFormState,
    buildGeneratedExpenseEntryNumber,
    buildLookupLabel,
    validateExpenseEntryValues,
    formatCurrencyValue,
    parseNumericInput,
} from './expenseEntryShared';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';

export default function ExpenseEntryFormView({
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
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const showAutoNumberSwitch = !activeRecordId;
    const [localRecord, setLocalRecord] = useState(null);

    useEffect(() => {
        setLocalRecord(null);
    }, [activeRecordId]);

    const sourceRecord = useMemo(() => {
        if (localRecord) {
            return localRecord;
        }

        if (activeRecordId) {
            const row = config.rowMap?.[activeRecordId];

            if (row?.__backendRecord && buildRecord) {
                return buildRecord(row.__backendRecord, config);
            }

            return config.records?.[activeRecordId] ?? config.draft;
        }

        return config.draft;
    }, [activeRecordId, buildRecord, config, localRecord]);
    const [values, setValues] = useState(() => buildFormState(sourceRecord));
    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);
    const initialComparable = useMemo(() => buildFormState(sourceRecord), [sourceRecord]);

    const [lineModalOpen, setLineModalOpen] = useState(false);
    const [lineModalTab, setLineModalTab] = useState('rincian');
    const [lineModalRecord, setLineModalRecord] = useState(null);
    const [lineModalCurrentItem, setLineModalCurrentItem] = useState(null);
    const [lineModalValues, setLineModalValues] = useState({
        accountCode: '',
        accountName: '',
        amount: '',
        notes: '',
    });

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord));
    }, [config.sectionTabs, sourceRecord]);

    const validationMessage = useMemo(() => validateExpenseEntryValues(values, config), [config, values]);
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

    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    const dockActions = useMemo(() => {
        const baseActions = config.dockActions ?? [];

        return baseActions
            .filter((action) => (isDetail ? true : action.id !== 'delete'))
            .map((action) => {
                if (action.id === 'save') {
                    return {
                        ...action,
                        tone: 'primary',
                        disabled: saveDisabled,
                        label: saving ? 'Memproses...' : action.label,
                        onClick: onSave,
                    };
                }

                if (action.id === 'delete') {
                    return {
                        ...action,
                        label: saving ? 'Memproses...' : action.label,
                        onClick: onRequestDelete,
                    };
                }

                return action;
            });
    }, [config.dockActions, isDetail, saveDisabled, saving, values.saveTone]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    function openLineModal(record, currentItem = null) {
        setLineModalTab('rincian');
        setLineModalRecord(record);
        setLineModalCurrentItem(currentItem);
        if (currentItem) {
            setLineModalValues({
                accountCode: currentItem.account ?? '',
                accountName: currentItem.accountName ?? '',
                amount: currentItem.amount ?? '',
                notes: currentItem.notes ?? '',
            });
        } else {
            setLineModalValues({
                accountCode: record?.code ?? '',
                accountName: record?.name ?? '',
                amount: '',
                notes: '',
            });
        }
        setLineModalOpen(true);
    }

    function handleLineModalSubmit(e) {
        if (e) e.preventDefault();

        const amount = parseNumericInput(lineModalValues.amount);
        if (amount <= 0) {
            showErrorToast({
                message: 'Nilai harus diisi dan lebih dari 0.',
            });
            return;
        }

        const nextItem = {
            id: lineModalCurrentItem?.id ?? `draft-line-${Date.now()}`,
            __lineId: lineModalCurrentItem?.__lineId ?? null,
            __accountId: lineModalRecord?.id ?? lineModalCurrentItem?.__accountId ?? null,
            account: lineModalValues.accountCode,
            accountName: lineModalValues.accountName,
            amount: formatCurrencyValue(amount),
            notes: lineModalValues.notes,
        };

        setValues((current) =>
            applyExpenseLineItems(
                {
                    ...current,
                    lineLookup: '',
                },
                lineModalCurrentItem
                    ? (current.lineItems ?? []).map((item) => (item.id === lineModalCurrentItem.id ? nextItem : item))
                    : [...(current.lineItems ?? []), nextItem],
            ),
        );

        setLineModalOpen(false);
        showSuccessToast({
            message: lineModalCurrentItem ? 'Rincian beban diperbarui.' : 'Rincian beban ditambahkan.',
        });
    }

    function handleLineModalDelete() {
        if (!lineModalCurrentItem) return;

        setValues((current) =>
            applyExpenseLineItems(
                {
                    ...current,
                    lineLookup: '',
                },
                (current.lineItems ?? []).filter((item) => item.id !== lineModalCurrentItem.id),
            ),
        );

        setLineModalOpen(false);
        showSuccessToast({
            message: 'Rincian beban dihapus.',
        });
    }

    async function onSave() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui pencatatan beban.' : 'Sedang menyimpan pencatatan beban.',
            successMessage: isDetail ? 'Pencatatan beban berhasil diperbarui.' : 'Pencatatan beban berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedExpenseEntryNumber()
                        : values.documentNumber;
                const payload = buildExpenseEntryPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = isDetail && values.__backendRecordId
                    ? await updateBackendResource('expense-entries', values.__backendRecordId, payload)
                    : await createBackendResource('expense-entries', payload);

                return {
                    record: response?.data ?? null,
                    resolvedDocumentNumber,
                };
            },
            onSuccess: async ({ record, resolvedDocumentNumber }) => {
                await onRefresh?.();

                if (record) {
                    const parsed = buildRecord ? buildRecord(record, config) : record;
                    setLocalRecord(parsed);
                }

                if (!isDetail && record?.id) {
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
            loadingMessage: 'Sedang menghapus pencatatan beban.',
            successMessage: 'Pencatatan beban berhasil dihapus.',
            execute: () => deleteBackendResource('expense-entries', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const handlers = {
        onSelectLiabilityAccount: (record) =>
            setValues((current) => ({
                ...current,
                __liabilityAccountId: record.id,
                liabilityAccounts: [buildLookupLabel(record)],
            })),
        onRemoveLiabilityAccount: () =>
            setValues((current) => ({
                ...current,
                __liabilityAccountId: null,
                liabilityAccounts: [],
            })),
        onSelectLineAccount: (record) => {
            if (!values.__liabilityAccountId || !values.liabilityAccounts?.length) {
                showSystemErrorModal({
                    title: 'Terjadi Permasalahan pada Pemrosesan',
                    description: 'Silakan perbaiki permasalahan berikut ini:',
                    message: 'Hutang beban harus diisi',
                });
                return;
            }
            openLineModal(record, null);
        },
        onEditLineItem: (item) => {
            if (!values.__liabilityAccountId || !values.liabilityAccounts?.length) {
                showSystemErrorModal({
                    title: 'Terjadi Permasalahan pada Pemrosesan',
                    description: 'Silakan perbaiki permasalahan berikut ini:',
                    message: 'Hutang beban harus diisi',
                });
                return;
            }
            openLineModal(null, item);
        },
    };

    return (
        <>
            <TransactionFormLayout
                header={
                    <ExpenseEntryHeader
                        config={config}
                        values={values}
                        setValues={setValues}
                        showAutoNumberSwitch={showAutoNumberSwitch}
                        handlers={handlers}
                    />
                }
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={<TransactionTotalCard label={config.totalCardLabel} value={values.totalValue} />}
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                {activeSectionId === 'additional-info' ? (
                    <ExpenseAdditionalInfoSection config={config} values={values} setValues={setValues} handlers={handlers} />
                ) : activeSectionId === 'summary' ? (
                    <ExpenseSummarySection config={config} values={values} />
                ) : (
                    <ExpenseLineItemsSection config={config} values={values} setValues={setValues} handlers={handlers} />
                )}
            </TransactionFormLayout>
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Hapus Pencatatan Beban"
                message="Pencatatan beban ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
            <WorkspaceDialog
                open={lineModalOpen}
                onClose={() => setLineModalOpen(false)}
                title="Rincian Beban"
                headerIcon={PencilIcon}
                maxWidthClassName="max-w-[480px]"
                contentClassName="bg-white px-5 py-0 sm:px-6 min-h-[220px] flex flex-col pt-0 pb-4"
                footer={
                    <div className="flex justify-between items-center w-full">
                        <div>
                            {lineModalCurrentItem ? (
                                <Button
                                    variant="secondary"
                                    size="md"
                                    onClick={handleLineModalDelete}
                                    className="border-red-150 hover:bg-danger-border text-error-border font-semibold"
                                >
                                    Hapus
                                </Button>
                            ) : (
                                <span />
                            )}
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleLineModalSubmit}
                            className="bg-brand-blue-dark hover:bg-brand-blue-darker font-semibold shadow-btn-blue-hover"
                        >
                            Lanjut
                        </Button>
                    </div>
                }
            >
                <div className="flex border-b border-table-row-border -mx-5 px-5 sm:-mx-6 sm:px-6 mb-4 mt-0">
                    <button
                        type="button"
                        onClick={() => setLineModalTab('rincian')}
                        className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                            lineModalTab === 'rincian'
                                ? 'border-pink-accent text-pink-accent'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Rincian Beban
                    </button>
                    <button
                        type="button"
                        onClick={() => setLineModalTab('info')}
                        className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                            lineModalTab === 'info'
                                ? 'border-pink-accent text-pink-accent'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Info lainnya
                    </button>
                </div>

                {lineModalTab === 'rincian' && (
                    <div className="space-y-4 flex-1 pb-4">
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                            <span className="text-sm text-slate-700 font-normal">Akun</span>
                            <span className="text-sm text-slate-700 font-medium select-all">{lineModalValues.accountCode}</span>
                        </div>

                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
                            <span className="text-sm text-slate-700 font-normal">Untuk Beban</span>
                            <TextInput
                                id="accountName"
                                name="accountName"
                                value={lineModalValues.accountName}
                                onChange={(e) =>
                                    setLineModalValues((prev) => ({
                                        ...prev,
                                        accountName: e.target.value,
                                    }))
                                }
                                placeholder="Nama rincian beban"
                                className="h-[36px] rounded-[4px] border-ui-border"
                                inputClassName="text-sm font-normal text-slate-700"
                            />
                        </div>

                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-4">
                            <span className="text-sm text-slate-700 font-normal pt-2">
                                Nilai <span className="text-red-500">*</span>
                            </span>
                            <div className="w-full max-w-[240px]">
                                <TextInput
                                    id="amount"
                                    name="amount"
                                    prefix="Rp"
                                    value={lineModalValues.amount}
                                    onChange={(e) =>
                                        setLineModalValues((prev) => ({
                                            ...prev,
                                            amount: e.target.value,
                                        }))
                                    }
                                    placeholder="0"
                                    className="h-[36px] rounded-[4px] border-ui-border"
                                    prefixClassName="min-w-0 px-3 justify-center text-slate-500 font-normal border-r-ui-border-medium bg-ui-bg-hover text-sm"
                                    inputClassName="text-slate-700 text-right text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {lineModalTab === 'info' && (
                    <div className="space-y-4 flex-1 pb-4">
                        <div className="grid grid-cols-[130px_minmax(0,1fr)] items-start gap-4">
                            <span className="text-sm text-slate-700 font-normal pt-1">Catatan</span>
                            <div className="flex-1">
                                <TextareaField
                                    id="notes"
                                    name="notes"
                                    value={lineModalValues.notes}
                                    onChange={(e) =>
                                        setLineModalValues((prev) => ({
                                            ...prev,
                                            notes: e.target.value,
                                        }))
                                    }
                                    placeholder="Catatan tambahan untuk baris ini..."
                                    rows={4}
                                    className="border-ui-border rounded-[4px]"
                                    textareaClassName="min-h-[80px] text-sm font-normal text-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </WorkspaceDialog>
        </>
    );
}
