import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import { BankTransferHeader, TransferFeeSection, TransferInfoSection, TransferMoneySection, TransferSummaryCards } from './BankTransferSections';
import { buildDetailRecordFromRow, buildFormState } from './bankTransferShared';

export default function BankTransferFormView({ pageId, config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.draft;
        }

        return config.detailRecords?.[activeRecordId] ?? buildDetailRecordFromRow(config.rowMap?.[activeRecordId], config);
    }, [activeRecordId, config]);
    const [values, setValues] = useState(() => buildFormState(sourceRecord, config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord, config));
    }, [config, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            entryDate: sourceRecord.entryDate ?? config.draft?.entryDate ?? '',
            autoNumber: sourceRecord.autoNumber ?? config.draft?.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? config.draft?.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? config.draft?.documentNumber ?? '',
            fromBankAccounts: sourceRecord.fromBankAccounts ?? config.draft?.fromBankAccounts ?? [],
            fromBranches: sourceRecord.fromBranches ?? config.draft?.fromBranches ?? [],
            transferValue: sourceRecord.transferValue ?? config.draft?.transferValue ?? '',
            toBankAccounts: sourceRecord.toBankAccounts ?? config.draft?.toBankAccounts ?? [],
            toBranches: sourceRecord.toBranches ?? config.draft?.toBranches ?? [],
            notes: sourceRecord.notes ?? config.draft?.notes ?? '',
        }),
        [config.draft, sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            entryDate: values.entryDate,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            fromBankAccounts: values.fromBankAccounts,
            fromBranches: values.fromBranches,
            transferValue: values.transferValue,
            toBankAccounts: values.toBankAccounts,
            toBranches: values.toBranches,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.entryDate, value: values.entryDate },
                    {
                        label: config.labels.documentNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                    { label: config.labels.fromBank, type: 'array', value: values.fromBankAccounts },
                    { label: config.labels.fromBranch, type: 'array', value: values.fromBranches },
                    { label: config.labels.transferValue, value: values.transferValue },
                    { label: config.labels.toBank, type: 'array', value: values.toBankAccounts },
                    { label: config.labels.toBranch, type: 'array', value: values.toBranches },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.documentNumber,
            config.labels.entryDate,
            config.labels.fromBank,
            config.labels.fromBranch,
            config.labels.toBank,
            config.labels.toBranch,
            config.labels.transferValue,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.documentNumber,
            values.entryDate,
            values.fromBankAccounts,
            values.fromBranches,
            values.numberingType,
            values.toBankAccounts,
            values.toBranches,
            values.transferValue,
        ],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => (activeRecordId ? true : !['delete', 'more'].includes(action.id)))
                .map((action) =>
                    action.id === 'save'
                        ? { ...action, tone: values.saveTone, disabled: saveDisabled }
                        : action,
                ),
        [activeRecordId, config.dockActions, saveDisabled, values.saveTone],
    );

    return (
        <TransactionFormLayout
            header={<BankTransferHeader config={config} values={values} setValues={setValues} activeRecordId={activeRecordId} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            footer={<TransferSummaryCards values={values} />}
            dockActions={dockActions}
        >
            {activeSectionId === 'fee' ? (
                <TransferFeeSection config={config} values={values} />
            ) : activeSectionId === 'additional-info' ? (
                <TransferInfoSection config={config} values={values} isDetail={Boolean(activeRecordId)} />
            ) : (
                <TransferMoneySection config={config} values={values} isDetail={Boolean(activeRecordId)} />
            )}
        </TransactionFormLayout>
    );
}
