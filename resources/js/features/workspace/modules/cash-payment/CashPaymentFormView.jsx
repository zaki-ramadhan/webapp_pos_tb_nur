import { useEffect, useMemo, useState, useCallback } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSuccessToast, showErrorToast, showLoadingToast, updateToastToSuccess, updateToastToError } from '@/components/feedback/toast';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
    getBackendResource,
    listBackendResource,
    extractBackendRows,
} from '@/features/workspace/backend/workspaceBackendApi';
import { formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';
import CashPaymentAttachmentModal from './CashPaymentAttachmentModal';
import TakeExpenseEntryModal from './components/TakeExpenseEntryModal';
import TakePayrollEntryModal from './components/TakePayrollEntryModal';
import {
    TransactionFormLayout,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import {
    CashPaymentHeader,
    PaymentInfoSection,
    PaymentLineItemsSection,
} from './CashPaymentSections';
import {
    applyCashPaymentLineItems,
    buildCashPaymentPayload,
    buildDetailRecordFromRow,
    buildFormState,
    buildGeneratedCashPaymentNumber,
    buildLookupLabel,
    validateCashPaymentValues,
    buildCashPaymentRecord,
} from './cashPaymentShared';
import MoneyMovementLineItemModal from '@/features/workspace/shared/MoneyMovementLineItemModal';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';

export default function CashPaymentFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const buildRecord = useCallback((data, cfg) => {
        return buildCashPaymentRecord(data, cfg);
    }, []);
    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: 'cash-payments',
        activeRecordId,
        buildRecord,
        config,
    });

    const [values, setValues, isDirty] = useFormDraftState({
        sourceRecord,
        buildFormState,
        config,
        pageId,
        activeTabId: activeLevel2Tab?.id,
    });

    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
    }, [config, sourceRecord]);

    const validationMessage = useMemo(() => validateCashPaymentValues(values, config), [config, values]);

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

    const {
        lineItemModalOpen,
        setLineItemModalOpen,
        modalRecord,
        setModalRecord,
        modalCurrentItem,
        setModalCurrentItem,
        applyLineItemUpdate,
        handleSaveLineItem,
    } = useFormLineItems({
        applyLineItems: applyCashPaymentLineItems,
        setValues,
        onSuccessMessage: 'Rincian pembayaran diperbarui.',
        onDeleteMessage: 'Rincian pembayaran dihapus.',
    });

    const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
    const [kasBankWarningOpen, setKasBankWarningOpen] = useState(false);
    const [takeExpenseOpen, setTakeExpenseOpen] = useState(false);
    const [takePayrollOpen, setTakePayrollOpen] = useState(false);

    const saveDisabled = saving || !isDirty || Boolean(validationMessage && (validationMessage.includes('wajib diisi') || validationMessage.includes('wajib dipilih') || validationMessage.includes('wajib diisi minimal 1')));



    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => action.id !== 'print')
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

                    if (action.id === 'print') {
                        return {
                            ...action,
                            onClick: () => window.print(),
                            items: action.items?.map((item) => ({
                                ...item,
                                onClick: () => window.print(),
                            })),
                        };
                    }

                    if (action.id === 'attachment') {
                        return {
                            ...action,
                            onClick: () => setAttachmentModalOpen(true),
                            items: action.items?.map((item) => ({
                                ...item,
                                onClick: () => setAttachmentModalOpen(true),
                            })),
                        };
                    }

                    return action;
                }),
        [config.dockActions, isDetail, saveDisabled, saving, values.saveTone],
    );


    async function onSave() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui pembayaran kas.' : 'Sedang menyimpan pembayaran kas.',
            successMessage: isDetail ? 'Pembayaran kas berhasil diperbarui.' : 'Pembayaran kas berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedCashPaymentNumber()
                        : values.documentNumber;
                const payload = buildCashPaymentPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = isDetail && values.__backendRecordId
                    ? await updateBackendResource('cash-payments', values.__backendRecordId, payload)
                    : await createBackendResource('cash-payments', payload);

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
                    const parsed = buildCashPaymentRecord(record, config);
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
            loadingMessage: 'Sedang menghapus pembayaran kas.',
            successMessage: 'Pembayaran kas berhasil dihapus.',
            execute: () => deleteBackendResource('cash-payments', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }


    async function handleApplyExpenseEntries(selectedRecords) {
        let toastId = null;
        try {
            toastId = showLoadingToast({
                title: 'Mengambil Data',
                message: 'Sedang mengambil rincian pencatatan beban...',
            });

            let allImportedLines = [];
            let appendedNotes = [];

            for (const record of selectedRecords) {
                const fullRecord = (record.lines && record.lines.length > 0)
                    ? record
                    : await getBackendResource('expense-entries', record.id);
                
                if (!fullRecord) continue;
                const liabilityAccount = fullRecord.primary_account;
                const importedLine = {
                    id: `imported-expense-line-${fullRecord.id}-${Date.now()}-${Math.random()}`,
                    __lineId: null,
                    __accountId: liabilityAccount?.id ?? fullRecord.primary_account_id ?? null,
                    accountCode: liabilityAccount?.code ?? '',
                    accountName: liabilityAccount?.name ?? 'Utang Beban',
                    amount: formatCurrencyValue(fullRecord.total_amount ?? 0),
                };

                allImportedLines.push(importedLine);
                if (fullRecord.notes?.trim()) {
                    appendedNotes.push(fullRecord.notes.trim());
                }
            }

            if (allImportedLines.length === 0) {
                updateToastToError(toastId, {
                    title: 'Gagal',
                    message: 'Tidak ada rincian beban yang diimpor.',
                });
                return;
            }

            setValues((current) => {
                const combinedNotes = [current.notes?.trim(), ...appendedNotes]
                    .filter(Boolean)
                    .join('\n');
                
                return applyCashPaymentLineItems(
                    {
                        ...current,
                        __relatedDocumentId: selectedRecords[0]?.id ?? null,
                        lineItems: [...(current.lineItems ?? []), ...allImportedLines],
                        notes: combinedNotes,
                    },
                    [...(current.lineItems ?? []), ...allImportedLines],
                );
            });

            setStatus({
                tone: 'success',
                message: `Berhasil mengambil rincian dari ${selectedRecords.map((r) => r.document_number).join(', ')}.`,
            });
            updateToastToSuccess(toastId, {
                title: 'Berhasil',
                message: `Berhasil mengambil rincian dari ${selectedRecords.length} Pencatatan Beban.`,
            });
        } catch (err) {
            setStatus({
                tone: 'error',
                message: 'Gagal mengambil rincian pencatatan beban.',
            });
            if (toastId) {
                updateToastToError(toastId, {
                    title: 'Gagal',
                    message: 'Gagal mengambil rincian pencatatan beban.',
                });
            }
        }
    }

    useEffect(() => {
        if (!isDetail && window.__pendingImportExpenseEntry) {
            const pending = window.__pendingImportExpenseEntry;
            window.__pendingImportExpenseEntry = null;
            handleApplyExpenseEntries([pending]);
        }
        if (!isDetail && window.__pendingImportPayrollEntry) {
            const pending = window.__pendingImportPayrollEntry;
            window.__pendingImportPayrollEntry = null;
            handleApplyPayrollEntries([pending]);
        }
    }, [isDetail, activeLevel2Tab]);

    async function handleApplyPayrollEntries(selectedRecords) {
        let toastId = null;
        try {
            toastId = showLoadingToast({
                title: 'Mengambil Data',
                message: 'Sedang mengambil rincian pencatatan gaji...',
            });

            let allImportedLines = [];
            let appendedNotes = [];

            for (const record of selectedRecords) {
                const fullRecord = (record.primary_account)
                    ? record
                    : await getBackendResource('payroll-entries', record.id);
                
                if (!fullRecord) continue;
                
                const liabilityAccount = fullRecord.primary_account;
                const metadata = fullRecord.metadata ?? {};
                const label = metadata.liability_accounts?.[0] ?? '';
                const match = label.match(/^\[([^\]]+)\]\s*(.+)$/);
                let accountCode = '';
                let accountName = 'Hutang Beban - Gaji';
                if (match) {
                    accountCode = match[1];
                    accountName = `${match[2]} - Gaji`;
                }

                let accountId = liabilityAccount?.id ?? fullRecord.primary_account_id ?? metadata.liability_account_id ?? null;
                if (!accountId && accountCode) {
                    try {
                        const accountsData = await listBackendResource('accounts', { search: accountCode });
                        const accounts = extractBackendRows(accountsData);
                        const foundAccount = accounts.find(acc => acc.code === accountCode);
                        if (foundAccount) {
                            accountId = foundAccount.id;
                        }
                    } catch (e) {
                        // ignore error
                    }
                }

                let totalVal = parseFloat(fullRecord.total_amount ?? 0);
                if (totalVal === 0 && fullRecord.lines && fullRecord.lines.length > 0) {
                    totalVal = fullRecord.lines.reduce((sum, line) => sum + parseFloat(line.total_amount ?? 0), 0);
                }

                const importedLine = {
                    id: `imported-payroll-line-${fullRecord.id}-${Date.now()}-${Math.random()}`,
                    __lineId: null,
                    __accountId: accountId,
                    accountCode: liabilityAccount?.code ?? accountCode ?? '',
                    accountName: liabilityAccount ? `${liabilityAccount.name} - Gaji` : accountName,
                    amount: formatCurrencyValue(totalVal),
                };

                allImportedLines.push(importedLine);
                if (fullRecord.notes?.trim()) {
                    appendedNotes.push(fullRecord.notes.trim());
                }
            }

            if (allImportedLines.length === 0) {
                updateToastToError(toastId, {
                    title: 'Gagal',
                    message: 'Tidak ada rincian gaji yang diimpor.',
                });
                return;
            }

            setValues((current) => {
                const combinedNotes = [current.notes?.trim(), ...appendedNotes]
                    .filter(Boolean)
                    .join('\n');
                
                return applyCashPaymentLineItems(
                    {
                        ...current,
                        __relatedDocumentId: selectedRecords[0]?.id ?? null,
                        lineItems: [...(current.lineItems ?? []), ...allImportedLines],
                        notes: combinedNotes,
                    },
                    [...(current.lineItems ?? []), ...allImportedLines],
                );
            });

            setStatus({
                tone: 'success',
                message: `Berhasil mengambil rincian dari ${selectedRecords.map((r) => r.document_number).join(', ')}.`,
            });
            updateToastToSuccess(toastId, {
                title: 'Berhasil',
                message: `Berhasil mengambil rincian dari ${selectedRecords.length} Pencatatan Gaji.`,
            });
        } catch (err) {
            setStatus({
                tone: 'error',
                message: 'Gagal mengambil rincian pencatatan gaji.',
            });
            if (toastId) {
                updateToastToError(toastId, {
                    title: 'Gagal',
                    message: 'Gagal mengambil rincian pencatatan gaji.',
                });
            }
        }
    }

    const handlers = useMemo(
        () => ({
            onSelectBankAccount: () =>
                selectLookup(
                    'accounts',
                    'kas atau bank',
                    (record) =>
                        setValues((current) => ({
                            ...current,
                            __primaryAccountId: record.id,
                            bankAccounts: [buildLookupLabel(record)],
                        })),
                    buildLookupLabel,
                    { account_type: 'Cash/Bank' }
                ),
            onRemoveBankAccount: () =>
                setValues((current) => ({
                    ...current,
                    __primaryAccountId: null,
                    bankAccounts: [],
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
            onSelectLineAccount: (record) => {
                if (!values.__primaryAccountId || !values.bankAccounts?.length) {
                    setKasBankWarningOpen(true);
                    return;
                }
                applyLineItemUpdate(record);
            },
            onEditLineItem: (item) => {
                if (!values.__primaryAccountId || !values.bankAccounts?.length) {
                    setKasBankWarningOpen(true);
                    return;
                }
                applyLineItemUpdate(null, item);
            },
            onTakeExpenseEntry: () => {
                if (!values.__primaryAccountId) {
                    setKasBankWarningOpen(true);
                    return;
                }
                setTakeExpenseOpen(true);
            },
            onTakePayrollEntry: () => {
                if (!values.__primaryAccountId) {
                    setKasBankWarningOpen(true);
                    return;
                }
                setTakePayrollOpen(true);
            },
        }),
        [selectLookup, setStatus, values.__primaryAccountId],
    );

    return (
        <>
            <TransactionFormLayout
            isLoading={isLoading}
            validationMessage={validationMessage}
                header={
                    <CashPaymentHeader
                        config={config}
                        values={values}
                        setValues={setValues}
                        activeRecordId={activeRecordId}
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
                    <PaymentInfoSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={Boolean(activeRecordId)}
                        handlers={handlers}
                    />
                ) : (
                    <PaymentLineItemsSection config={config} values={values} setValues={setValues} handlers={handlers} />
                )}
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
            <ConfirmationModal
                open={kasBankWarningOpen}
                onClose={() => setKasBankWarningOpen(false)}
                onConfirm={() => setKasBankWarningOpen(false)}
                title="Peringatan"
                message="Akun Kas/Bank harus diisi terlebih dahulu."
                confirmLabel="OK"
                cancelLabel={null}
                confirmVariant="primary"
            />
            <CashPaymentAttachmentModal
                open={attachmentModalOpen}
                onClose={() => setAttachmentModalOpen(false)}
                values={values}
                setValues={setValues}
                setStatus={setStatus}
            />
            <MoneyMovementLineItemModal
                open={lineItemModalOpen}
                onClose={() => {
                    setLineItemModalOpen(false);
                    setModalRecord(null);
                    setModalCurrentItem(null);
                }}
                record={modalRecord}
                currentItem={modalCurrentItem}
                onSave={handleSaveLineItem}
                type="payment"
            />
            <TakeExpenseEntryModal
                open={takeExpenseOpen}
                onClose={() => setTakeExpenseOpen(false)}
                onApply={handleApplyExpenseEntries}
            />
            <TakePayrollEntryModal
                open={takePayrollOpen}
                onClose={() => setTakePayrollOpen(false)}
                onApply={handleApplyPayrollEntries}
            />
        </>
    );
}
