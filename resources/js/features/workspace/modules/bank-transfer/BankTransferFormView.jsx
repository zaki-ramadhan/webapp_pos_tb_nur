import { useEffect, useMemo, useState, useCallback, useRef } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
import TextareaField from '@/components/ui/TextareaField';
import { PencilIcon } from '@/features/workspace/shared/Icons';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import { parseNumericInput, formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
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
    buildBankTransferSnapshot,
    buildDetailRecordFromRow,
    buildFormState,
    buildGeneratedBankTransferNumber,
    buildLookupLabel,
    promptBankTransferFeeItem,
    validateBankTransferValues,
    buildBankTransferRecord,
} from './bankTransferShared';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';

export default function BankTransferFormView({
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
    const [localRecord, setLocalRecord] = useState(null);

    useEffect(() => {
        setLocalRecord(null);
    }, [activeRecordId]);

    const sourceRecord = useMemo(() => {
        if (localRecord) {
            return localRecord;
        }

        if (!activeRecordId) {
            return config.draft;
        }

        return config.rowMap?.[activeRecordId]
            ? buildDetailRecordFromRow(config.rowMap[activeRecordId], config)
            : config.detailRecords?.[activeRecordId] ?? config.draft;
    }, [activeRecordId, config, localRecord]);
    const [values, setValues, isDirty] = useFormDraftState({
        sourceRecord,
        buildFormState,
        config,
        pageId,
        activeTabId: activeLevel2Tab?.id,
    });

    const [requiredWarningOpen, setRequiredWarningOpen] = useState(false);
    const [requiredWarningList, setRequiredWarningList] = useState([]);

    const [feeModalOpen, setFeeModalOpen] = useState(false);
    const [feeModalRecord, setFeeModalRecord] = useState(null);
    const [feeModalCurrentItem, setFeeModalCurrentItem] = useState(null);
    const [feeAccount, setFeeAccount] = useState(null);
    const [feeCustomName, setFeeCustomName] = useState('');
    const [feeAmount, setFeeAmount] = useState('0');
    const [feeChargedTo, setFeeChargedTo] = useState('Bank Pengirim');
    const [feeNotes, setFeeNotes] = useState('');
    const [activeTab, setActiveTab] = useState('detail');

    const valuesRef = useRef(values);
    valuesRef.current = values;

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
    }, [config, sourceRecord]);

    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);
    const validationMessage = useMemo(() => validateBankTransferValues(values, config), [config, values]);

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

    const updateValues = useCallback((nextValues) => {
        setValues((currentValues) =>
            applyBankTransferComputedValues(
                typeof nextValues === 'function' ? nextValues(currentValues) : nextValues,
            ),
        );
    }, []);

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => (isDetail ? true : action.id !== 'delete'))
                .map((action) => {
                    if (action.id === 'save') {
                        return {
                            ...action,
                            tone: 'primary',
                            disabled: saveDisabled,
                            label: validationMessage ? `${action.label} (${validationMessage})` : (saving ? 'Memproses...' : action.label),
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
                }),
        [config.dockActions, isDetail, saveDisabled, saving, values.saveTone],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    const applyFeeUpdate = useCallback(async (record, currentItem = null) => {
        try {
            const nextItem = await promptBankTransferFeeItem(record, currentItem);

            if (!nextItem) {
                return;
            }

            if (nextItem.action === 'delete') {
                if (currentItem) {
                    updateValues((current) => ({
                        ...current,
                        feeLookup: '',
                        feeRows: (current.feeRows ?? []).filter((item) => item.id !== currentItem.id),
                    }));
                    showSuccessToast({
                        message: 'Biaya transfer dihapus.',
                    });
                }
                return;
            }

            updateValues((current) => ({
                ...current,
                feeLookup: '',
                feeRows: currentItem
                    ? (current.feeRows ?? []).map((item) => (item.id === currentItem.id ? nextItem : item))
                    : [...(current.feeRows ?? []), nextItem],
            }));
            showSuccessToast({
                message: currentItem ? 'Biaya transfer diperbarui.' : 'Biaya transfer ditambahkan.',
            });
        } catch (error) {
            showErrorToast({
                message: error?.message ?? 'Biaya transfer tidak valid.',
            });
        }
    }, [updateValues]);

    async function onSave() {
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
            loadingMessage: 'Sedang menghapus transfer bank.',
            successMessage: 'Transfer bank berhasil dihapus.',
            execute: () => deleteBackendResource('bank-transfers', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
            onSelectFromBankAccount: (record, label) =>
                updateValues((current) => ({
                    ...current,
                    __fromAccountId: record ? record.id : null,
                    fromBankAccounts: record ? [label] : [],
                })),
            onRemoveFromBankAccount: () =>
                updateValues((current) => ({
                    ...current,
                    __fromAccountId: null,
                    fromBankAccounts: [],
                })),
            onSelectToBankAccount: (record, label) =>
                updateValues((current) => ({
                    ...current,
                    __toAccountId: record ? record.id : null,
                    toBankAccounts: record ? [label] : [],
                })),
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
                        setRequiredWarningList(missing);
                        setRequiredWarningOpen(true);
                        return;
                    }
                    
                    setFeeModalRecord(record);
                    setFeeModalCurrentItem(null);
                    setFeeAccount(record);
                    setFeeCustomName(record.name ?? '');
                    setFeeAmount('0');
                    setFeeChargedTo('Bank Pengirim');
                    setFeeNotes('');
                    setActiveTab('detail');
                    setFeeModalOpen(true);
                }
            },
            onEditFeeItem: (item) => {
                setFeeModalRecord(null);
                setFeeModalCurrentItem(item);
                setFeeAccount({
                    id: item.__accountId,
                    code: item.accountCode,
                    name: item.accountName,
                });
                setFeeCustomName(item.accountName ?? '');
                setFeeAmount(item.amount ? String(parseNumericInput(item.amount)) : '0');
                setFeeChargedTo(item.chargedTo ?? 'Bank Pengirim');
                setFeeNotes(item.notes ?? '');
                setActiveTab('detail');
                setFeeModalOpen(true);
            },
        }),
        [selectLookup, updateValues],
    );

    return (
        <>
            <TransactionFormLayout
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
            <ConfirmationModal
                open={requiredWarningOpen}
                onClose={() => setRequiredWarningOpen(false)}
                onConfirm={() => setRequiredWarningOpen(false)}
                title="Peringatan"
                message={
                    requiredWarningList.length === 1
                        ? `${requiredWarningList[0]} harus diisi terlebih dahulu.`
                        : `Harap lengkapi data input berikut terlebih dahulu:\n` +
                          requiredWarningList.map((item) => `- ${item} harus diisi`).join('\n')
                }
                confirmLabel="OK"
                cancelLabel={null}
                confirmVariant="primary"
            />
            <WorkspaceDialog
                open={feeModalOpen}
                onClose={() => {
                    setFeeModalOpen(false);
                    setFeeModalRecord(null);
                    setFeeModalCurrentItem(null);
                }}
                title="Biaya Transfer"
                headerIcon={PencilIcon}
                maxWidthClassName="max-w-[500px]"
                contentClassName="bg-white px-5 py-0 sm:px-6 min-h-[220px] flex flex-col pt-0 pb-4"
                footer={
                    <div className="flex justify-between items-center w-full">
                        {feeModalCurrentItem ? (
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={() => {
                                    setFeeModalOpen(false);
                                    updateValues((current) => ({
                                        ...current,
                                        feeLookup: '',
                                        feeRows: (current.feeRows ?? []).filter((row) => row.id !== feeModalCurrentItem.id),
                                    }));
                                    showSuccessToast({ message: 'Biaya transfer dihapus.' });
                                }}
                                className="border-red-150 hover:bg-danger-border text-error-border font-medium"
                            >
                                Hapus
                            </Button>
                        ) : (
                            <div />
                        )}
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => {
                                if (activeTab === 'detail') {
                                    if (!feeCustomName.trim()) {
                                        showErrorToast({ message: 'Nama Akun wajib diisi.' });
                                        return;
                                    }
                                    setActiveTab('notes');
                                } else {
                                    const amountNum = parseNumericInput(feeAmount);
                                    if (!feeCustomName.trim()) {
                                        showErrorToast({ message: 'Nama Akun wajib diisi.' });
                                        return;
                                    }
                                    if (amountNum <= 0) {
                                        showErrorToast({ message: 'Nilai biaya transfer harus lebih dari 0.' });
                                        return;
                                    }
                                    
                                    const nextItem = {
                                        id: feeModalCurrentItem?.id ?? `draft-fee-${Date.now()}`,
                                        __lineId: feeModalCurrentItem?.__lineId ?? null,
                                        __accountId: feeAccount?.id ?? feeModalCurrentItem?.__accountId ?? null,
                                        accountCode: feeAccount?.code ?? feeModalCurrentItem?.accountCode ?? '',
                                        accountName: feeCustomName.trim(),
                                        amount: formatCurrencyValue(amountNum),
                                        chargedTo: feeChargedTo,
                                        notes: feeNotes.trim(),
                                    };
                                    
                                    updateValues((current) => ({
                                        ...current,
                                        feeLookup: '',
                                        feeRows: feeModalCurrentItem
                                            ? (current.feeRows ?? []).map((row) => (row.id === feeModalCurrentItem.id ? nextItem : row))
                                            : [...(current.feeRows ?? []), nextItem],
                                    }));
                                    
                                    showSuccessToast({
                                        message: feeModalCurrentItem ? 'Biaya transfer diperbarui.' : 'Biaya transfer ditambahkan.',
                                    });
                                    
                                    setFeeModalOpen(false);
                                    setFeeModalRecord(null);
                                    setFeeModalCurrentItem(null);
                                }
                            }}
                            className="bg-brand-blue-dark hover:bg-brand-blue-darker font-medium shadow-btn-blue-hover"
                        >
                            Lanjut
                        </Button>
                    </div>
                }
            >
                {/* Tabs */}
                <div className="flex border-b border-table-row-border -mx-5 px-5 sm:-mx-6 sm:px-6 mb-4 mt-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('detail')}
                        className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                            activeTab === 'detail'
                                ? 'border-pink-accent text-pink-accent'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Biaya Transfer
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('notes')}
                        className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                            activeTab === 'notes'
                                ? 'border-pink-accent text-pink-accent'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Info lainnya
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="min-h-[200px] flex flex-col justify-start">
                    {activeTab === 'detail' && (
                        <div className="space-y-2.5">
                            <div className="grid grid-cols-[130px_1fr] items-center gap-4">
                                <label className="text-xs sm:text-sm font-medium text-slate-700">Nama Akun</label>
                                <TextInput
                                    type="text"
                                    value={feeCustomName}
                                    onChange={(e) => setFeeCustomName(e.target.value)}
                                    placeholder="Nama Akun..."
                                    className="h-[34px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                />
                            </div>

                            <div className="grid grid-cols-[130px_1fr] items-center gap-4">
                                <label className="text-xs sm:text-sm font-medium text-slate-700">
                                    Nilai <span className="text-red-500">*</span>
                                </label>
                                <div className="max-w-[276px]">
                                    <TextInput
                                        type="text"
                                        value={feeAmount}
                                        onChange={(e) => setFeeAmount(e.target.value)}
                                        prefix="Rp"
                                        className="h-[34px] rounded-[4px] border-ui-border"
                                        prefixClassName="min-w-[42px] justify-center border-r-ui-border-medium bg-ui-bg-hover px-2 text-xs sm:text-sm text-text-light"
                                        inputClassName="text-right text-xs sm:text-sm text-brand-dark"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-[130px_1fr] items-center gap-4">
                                <label className="text-xs sm:text-sm font-medium text-slate-700">Dibebankan ke</label>
                                <SelectField
                                    value={feeChargedTo}
                                    onChange={(e) => setFeeChargedTo(e.target.value)}
                                    className="h-[34px] rounded-[4px] border-ui-border text-xs sm:text-sm text-brand-dark"
                                >
                                    <option value="Bank Pengirim">Bank Pengirim</option>
                                    <option value="Bank Tujuan">Bank Tujuan</option>
                                </SelectField>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-2.5">
                            <div className="grid grid-cols-[130px_1fr] items-start gap-4">
                                <label className="text-xs sm:text-sm font-medium text-slate-700">Catatan</label>
                                <TextareaField
                                    value={feeNotes}
                                    onChange={(e) => setFeeNotes(e.target.value)}
                                    rows={4}
                                    className="rounded-[4px] border-ui-border"
                                    textareaClassName="min-h-[70px] px-4 py-3 text-xs sm:text-sm text-brand-dark"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </WorkspaceDialog>
        </>
    );
}
