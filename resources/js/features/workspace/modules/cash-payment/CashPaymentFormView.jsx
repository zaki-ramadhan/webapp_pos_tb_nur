import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import {
    TransactionFormLayout,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import {
    CashPaymentHeader,
    PaymentInfoSection,
    PaymentLineItemsSection,
} from './CashPaymentSections';
import { buildDetailRecordFromRow, buildFormState } from './cashPaymentShared';

export default function CashPaymentFormView({ pageId, config, activeLevel2Tab }) {
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
            bankAccounts: sourceRecord.bankAccounts ?? config.draft?.bankAccounts ?? [],
            entryDate: sourceRecord.entryDate ?? config.draft?.entryDate ?? '',
            autoNumber: sourceRecord.autoNumber ?? config.draft?.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? config.draft?.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? config.draft?.documentNumber ?? '',
            branches: sourceRecord.branches ?? config.draft?.branches ?? [],
            notes: sourceRecord.notes ?? config.draft?.notes ?? '',
            lineItems: sourceRecord.lineItems ?? config.draft?.lineItems ?? [],
        }),
        [config.draft?.autoNumber, config.draft?.bankAccounts, config.draft?.branches, config.draft?.documentNumber, config.draft?.entryDate, config.draft?.lineItems, config.draft?.notes, config.draft?.numberingType, sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            bankAccounts: values.bankAccounts,
            entryDate: values.entryDate,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            branches: values.branches,
            notes: values.notes,
            lineItems: values.lineItems,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.cashBank, type: 'array', value: values.bankAccounts },
                    { label: config.labels.entryDate, value: values.entryDate },
                    {
                        label: config.labels.documentNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                    { label: config.lineSectionTitle, type: 'array', value: values.lineItems },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.branch,
            config.labels.cashBank,
            config.labels.documentNumber,
            config.labels.entryDate,
            config.lineSectionTitle,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.bankAccounts,
            values.branches,
            values.documentNumber,
            values.entryDate,
            values.lineItems,
            values.numberingType,
        ],
    );

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => (activeRecordId ? true : action.id !== 'delete'))
                .map((action) =>
                    action.id === 'save'
                        ? {
                              ...action,
                              tone: values.saveTone,
                              disabled: saveDisabled,
                          }
                        : action,
                ),
        [activeRecordId, config.dockActions, saveDisabled, values.saveTone],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    return (
        <TransactionFormLayout
            header={<CashPaymentHeader config={config} values={values} setValues={setValues} activeRecordId={activeRecordId} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            footer={<TransactionTotalCard label={config.totalCardLabel} value={values.totalValue} />}
            dockActions={dockActions}
        >
            {activeSectionId === 'additional-info' ? (
                <PaymentInfoSection config={config} values={values} isDetail={Boolean(activeRecordId)} />
            ) : (
                <PaymentLineItemsSection config={config} values={values} setValues={setValues} />
            )}
        </TransactionFormLayout>
    );
}
