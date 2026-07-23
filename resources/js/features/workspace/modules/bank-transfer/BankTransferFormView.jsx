import { useEffect, useMemo, useState, useCallback, useRef } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';
import { showSuccessToast } from '@/components/feedback/toast';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
    getBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    BankTransferHeader,
    TransferFeeSection,
    TransferInfoSection,
    TransferMoneySection,
    TransferSummaryCards,
} from './BankTransferSections';
import {
    applyBankTransferComputedValues,
    buildBankTransferPayload,
    buildBankTransferRecord,
    buildFormState,
    buildGeneratedBankTransferNumber,
    validateBankTransferValues,
    extractCleanAccountName,
} from './bankTransferShared';
import { useTransactionForm, buildWorkspaceDockActions } from '@/features/workspace/shared/hooks/useTransactionForm';
import TransferFeeModal from './components/TransferFeeModal';

export default function BankTransferFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onRefresh,
}) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const buildRecord = useCallback((data, cfg) => {
        return buildBankTransferRecord(data, cfg);
    }, []);
    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: 'bank-transfers',
        activeRecordId,
        buildRecord,
        config,
    });
    const [values, setValues, isDirty, resetForm] = useFormDraftState({
        sourceRecord,
        buildFormState,
        config,
        pageId,
        activeTabId: activeLevel2Tab?.id,
    });

    const [feeModalOpen, setFeeModalOpen] = useState(false);
    const [feeModalCurrentItem, setFeeModalCurrentItem] = useState(null);
    const [feeAccount, setFeeAccount] = useState(null);

    const valuesRef = useRef(values);
    valuesRef.current = values;

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
    }, [config, sourceRecord]);

    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);
    const validationMessage = useMemo(() => validateBankTransferValues(values, config), [config, values]);

    const {
        status,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        selectLookup,
        handleSave,
        requestDelete,
        handleDelete,
        saveDisabled,
    } = useTransactionForm({ validationMessage, isDirty });

    const updateValues = useCallback((nextValues) => {
        setValues((currentValues) =>
            applyBankTransferComputedValues(
                typeof nextValues === 'function' ? nextValues(currentValues) : nextValues,
            ),
        );
    }, [setValues]);

    const handleSaveFee = useCallback((nextItem) => {
        updateValues((current) => ({
            ...current,
            feeLookup: '',
            feeRows: feeModalCurrentItem
                ? (current.feeRows ?? []).map((row) => (row.id === feeModalCurrentItem.id ? nextItem : row))
                : [...(current.feeRows ?? []), nextItem],
        }));
        setFeeModalOpen(false);
        setFeeModalCurrentItem(null);
    }, [feeModalCurrentItem, updateValues]);

    const handleDeleteFee = useCallback((itemId) => {
        updateValues((current) => ({
            ...current,
            feeLookup: '',
            feeRows: (current.feeRows ?? []).filter((row) => row.id !== itemId),
        }));
        setFeeModalOpen(false);
        setFeeModalCurrentItem(null);
    }, [updateValues]);

    const onSave = useCallback(async () => {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui transfer bank.' : 'Sedang menyimpan transfer bank.',
            successMessage: isDetail ? 'Transfer bank berhasil diperbarui.' : 'Transfer bank berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedBankTransferNumber()
                        : values.documentNumber;
                const payload = buildBankTransferPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = isDetail && values.__backendRecordId
                    ? await updateBackendResource('bank-transfers', values.__backendRecordId, payload)
                    : await createBackendResource('bank-transfers', payload);

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
                    const parsed = buildBankTransferRecord(record, config);
                    setLocalRecord(parsed);
                }

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.document_number ?? resolvedDocumentNumber,
                        tabLabel: record.document_number ?? resolvedDocumentNumber,
                    });
                    resetForm();
                }
            },
        });
    }, [values, isDetail, handleSave, config, pageId, activeLevel2Tab, onRefresh, onOpenDetail, setLocalRecord, resetForm]);

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
            loadingMessage: 'Sedang menghapus transfer bank.',
            successMessage: 'Transfer bank berhasil dihapus.',
            execute: () => deleteBackendResource('bank-transfers', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }

    const dockActions = useMemo(
        () => buildWorkspaceDockActions({
            dockActions: config.dockActions,
            isDetail,
            saveDisabled,
            saving,
            onSave,
            onDelete: onRequestDelete,
            additionalMaps: {
                save: (action) => ({
                    ...action,
                    tone: 'primary',
                    disabled: saveDisabled,
                    label: validationMessage ? `${action.label} (${validationMessage})` : (saving ? 'Memproses...' : action.label),
                    onClick: onSave,
                })
            }
        }),
        [config.dockActions, isDetail, saveDisabled, saving, onSave, onRequestDelete, validationMessage]
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    const handlers = useMemo(
        () => ({
            onSelectFromBankAccount: (record, label) =>
                updateValues((current) => {
                    const cleanLabel = extractCleanAccountName(label);
                    const currentRecons = current.reconciliations ?? [];
                    const nextRecons = currentRecons.map(item =>
                        item.id === 'from' ? { ...item, bank: cleanLabel } : item
                    );
                    if (!nextRecons.some(item => item.id === 'from')) {
                        nextRecons.push({ id: 'from', bank: cleanLabel, status: 'Belum', date: null });
                    }
                    return {
                        ...current,
                        __fromAccountId: record ? record.id : null,
                        fromBankAccounts: record ? [label] : [],
                        reconciliations: nextRecons,
                    };
                }),
            onRemoveFromBankAccount: () =>
                updateValues((current) => ({
                    ...current,
                    __fromAccountId: null,
                    fromBankAccounts: [],
                })),
            onSelectToBankAccount: (record, label) =>
                updateValues((current) => {
                    const cleanLabel = extractCleanAccountName(label);
                    const currentRecons = current.reconciliations ?? [];
                    const nextRecons = currentRecons.map(item =>
                        item.id === 'to' ? { ...item, bank: cleanLabel } : item
                    );
                    if (!nextRecons.some(item => item.id === 'to')) {
                        nextRecons.push({ id: 'to', bank: cleanLabel, status: 'Belum', date: null });
                    }
                    return {
                        ...current,
                        __toAccountId: record ? record.id : null,
                        toBankAccounts: record ? [label] : [],
                        reconciliations: nextRecons,
                    };
                }),
            onRemoveToBankAccount: () =>
                updateValues((current) => ({
                    ...current,
                    __toAccountId: null,
                    toBankAccounts: [],
                })),
            onSelectFromBranch: () =>
                selectLookup('branches', 'cabang asal', (record) =>
                    updateValues((current) => ({
                        ...current,
                        __fromBranchId: record.id,
                        fromBranches: [record.name ?? record.code ?? `Cabang #${record.id}`],
                    })),
                ),
            onRemoveFromBranch: (value) =>
                updateValues((current) => ({
                    ...current,
                    __fromBranchId: null,
                    fromBranches: (current.fromBranches ?? []).filter((item) => item !== value),
                })),
            onSelectToBranch: () =>
                selectLookup('branches', 'cabang tujuan', (record) =>
                    updateValues((current) => ({
                        ...current,
                        __toBranchId: record.id,
                        toBranches: [record.name ?? record.code ?? `Cabang #${record.id}`],
                    })),
                ),
            onRemoveToBranch: (value) =>
                updateValues((current) => ({
                    ...current,
                    __toBranchId: null,
                    toBranches: (current.toBranches ?? []).filter((item) => item !== value),
                })),
            onSelectFeeAccount: (record) => {
                if (record) {
                    const currentValues = valuesRef.current;
                    const missing = [];
                    if (!currentValues.entryDate) missing.push("Tanggal");
                    if (!currentValues.fromBankAccounts?.[0]) missing.push("Dari Kas/Bank");
                    if (!currentValues.toBankAccounts?.[0]) missing.push("Ke Kas/Bank");
                    
                    const transferValueNum = parseNumericInput(currentValues.transferValue);
                    if (transferValueNum <= 0) {
                        missing.push("Nilai Transfer");
                    }
                    
                    if (missing.length > 0) {
                        if (missing.length === 1) {
                            showSystemErrorModal({
                                title: 'Terjadi Permasalahan pada Pemrosesan',
                                description: 'Silakan perbaiki permasalahan berikut ini:',
                                message: `${missing[0]} harus diisi.`,
                                confirmLabel: 'OK',
                            });
                        } else {
                            showSystemErrorModal({
                                title: 'Terjadi Permasalahan pada Pemrosesan',
                                description: 'Silakan perbaiki data input berikut terlebih dahulu:',
                                messages: missing.map((item) => `${item} harus diisi.`),
                                confirmLabel: 'OK',
                            });
                        }
                        return;
                    }
                    
                    setFeeModalCurrentItem(null);
                    setFeeAccount(record);
                    setFeeModalOpen(true);
                }
            },
            onEditFeeItem: (item) => {
                setFeeModalCurrentItem(item);
                setFeeAccount({
                    id: item.__accountId,
                    code: item.accountCode,
                    name: item.accountName,
                });
                setFeeModalOpen(true);
            },
        }),
        [selectLookup, updateValues],
    );

    return (
        <>
            <TransactionFormLayout
                isLoading={isLoading}
                validationMessage={validationMessage}
                header={<BankTransferHeader config={config} values={values} setValues={updateValues} activeRecordId={activeRecordId} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={<TransferSummaryCards values={values} />}
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                {activeSectionId === 'fee' ? (
                    <TransferFeeSection config={config} values={values} handlers={handlers} />
                ) : activeSectionId === 'additional-info' ? (
                    <TransferInfoSection config={config} values={values} setValues={updateValues} isDetail={Boolean(activeRecordId)} />
                ) : (
                    <TransferMoneySection
                        config={config}
                        values={values}
                        setValues={updateValues}
                        handlers={handlers}
                        isDetail={Boolean(activeRecordId)}
                    />
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
            <TransferFeeModal
                open={feeModalOpen}
                onClose={() => {
                    setFeeModalOpen(false);
                    setFeeModalCurrentItem(null);
                }}
                onSave={handleSaveFee}
                onDelete={handleDeleteFee}
                currentItem={feeModalCurrentItem}
                feeAccount={feeAccount}
            />
        </>
    );
}
