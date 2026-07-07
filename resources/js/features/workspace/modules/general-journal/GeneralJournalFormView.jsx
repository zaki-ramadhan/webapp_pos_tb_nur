import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
    getBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import { TransactionDualTotalCard, TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';
import {
    GeneralJournalHeader,
    JournalAdditionalInfoSection,
    JournalLinesSection,
} from './GeneralJournalSections';
import {
    applyJournalLineItems,
    buildFormState,
    buildGeneratedJournalNumber,
    buildGeneralJournalPayload,
    buildLookupLabel,
    buildRecordFromTableRow,
    buildJournalRecordFromBackend,
    promptJournalLineItem,
    validateJournalValues,
    buildGeneralJournalRow,
} from './generalJournalShared';

export default function GeneralJournalFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const buildRecord = useCallback((data, cfg) => {
        return buildRecordFromTableRow(buildGeneralJournalRow(data), cfg);
    }, []);
    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: 'general-journals',
        activeRecordId,
        buildRecord,
        config,
    });
    const [values, setValues] = useState(() => buildFormState(sourceRecord, config));
    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);
    const initialComparable = useMemo(() => buildFormState(sourceRecord, config), [config, sourceRecord]);

    const lastInitialComparableRef = useRef(initialComparable);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord, config));
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
        lastInitialComparableRef.current = initialComparable;
    }, [config, sourceRecord, initialComparable]);

    const validationMessage = useMemo(() => validateJournalValues(values, config), [config, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(lastInitialComparableRef.current, values), [values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage && (validationMessage.includes('wajib diisi') || validationMessage.includes('wajib dipilih') || validationMessage.includes('wajib diisi minimal 1')));

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function selectLookup(resource, title, onApply) {
        try {
            const record = await promptSelectBackendRecord(resource, title, buildLookupLabel);

            if (!record) {
                return;
            }

            onApply(record);
            setStatus({ tone: '', message: '' });
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error, error.message) });
        }
    }

    async function applyLineItemUpdate(record, currentItem = null) {
        try {
            const nextItem = await promptJournalLineItem(record, currentItem);

            if (!nextItem) {
                return;
            }

            if (nextItem.action === 'delete') {
                if (currentItem) {
                    setValues((current) =>
                        applyJournalLineItems(
                            {
                                ...current,
                                lineLookup: '',
                            },
                            (current.lineItems ?? []).filter((item) => item.id !== currentItem.id),
                        ),
                    );
                    showSuccessToast({
                        message: 'Baris jurnal dihapus.',
                    });
                }
                return;
            }

            setValues((current) =>
                applyJournalLineItems(
                    {
                        ...current,
                        lineLookup: '',
                    },
                    currentItem
                        ? (current.lineItems ?? []).map((item) => (item.id === currentItem.id ? nextItem : item))
                        : [...(current.lineItems ?? []), nextItem],
                ),
            );
            showSuccessToast({
                message: currentItem ? 'Baris jurnal diperbarui.' : 'Baris jurnal ditambahkan.',
            });
        } catch (error) {
            showErrorToast({
                message: error?.message ?? 'Baris jurnal tidak valid.',
            });
        }
    }

    const handleSave = useCallback(async () => {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui jurnal umum.' : 'Sedang menyimpan jurnal umum.',
            successMessage: isDetail ? 'Jurnal umum berhasil diperbarui.' : 'Jurnal umum berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedJournalNumber()
                        : values.documentNumber;
                const payload = buildGeneralJournalPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = isDetail && values.__backendRecordId
                    ? await updateBackendResource('general-journals', values.__backendRecordId, payload)
                    : await createBackendResource('general-journals', payload);

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
                    const parsed = buildJournalRecordFromBackend(record, config);
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
    }, [validationMessage, isDetail, values, config, onRefresh, activeLevel2Tab, pageId, onOpenDetail]);

    const requestDelete = useCallback(() => {
        if (!values.__backendRecordId || saving) {
            return;
        }

        setDeleteConfirmationOpen(true);
    }, [values.__backendRecordId, saving]);

    const isExternalTransaction = values.transactionTypeValue && values.transactionTypeValue !== 'general-journal';

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => (isDetail ? true : action.id !== 'delete'))
                .map((action) => {
                    if (action.id === 'save') {
                        return {
                            ...action,
                            tone: 'primary',
                            disabled: saveDisabled || isExternalTransaction,
                            label: saving ? 'Memproses...' : action.label,
                            onClick: handleSave,
                        };
                    }

                    if (action.id === 'delete') {
                        return {
                            ...action,
                            disabled: isExternalTransaction,
                            label: saving ? 'Memproses...' : action.label,
                            onClick: requestDelete,
                        };
                    }

                    return action;
                }),
        [config.dockActions, isDetail, saveDisabled, saving, handleSave, requestDelete, isExternalTransaction],
    );

    async function handleDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus jurnal umum.',
            successMessage: 'Jurnal umum berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('general-journals', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
            onSelectBranch: () =>
                selectLookup('branches', 'cabang', (record) =>
                    setValues((current) => ({
                        ...current,
                        __branchId: record.id,
                        branches: [buildLookupLabel(record)],
                    })),
                ),
            onSelectLineAccount: (record) => applyLineItemUpdate(record),
            onEditLineItem: (item) => applyLineItemUpdate(null, item),
        }),
        [selectLookup, setStatus],
    );

    return (
        <>
            <TransactionFormLayout
            isLoading={isLoading}
            validationMessage={validationMessage}
                header={<GeneralJournalHeader config={config} values={values} setValues={setValues} activeRecordId={activeRecordId} handlers={handlers} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={
                    <TransactionDualTotalCard
                        items={[
                            { label: config.totalLabels.debit, value: values.totalDebit },
                            { label: config.totalLabels.credit, value: values.totalCredit },
                        ]}
                    />
                }
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                {activeSectionId === 'additional-info' ? (
                    <JournalAdditionalInfoSection config={config} values={values} setValues={setValues} handlers={handlers} />
                ) : (
                    <JournalLinesSection config={config} values={values} setValues={setValues} handlers={handlers} />
                )}
            </TransactionFormLayout>
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
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
