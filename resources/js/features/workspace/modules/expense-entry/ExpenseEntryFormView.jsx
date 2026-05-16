import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout, TransactionTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import {
    ExpenseAdditionalInfoSection,
    ExpenseEntryHeader,
    ExpenseLineItemsSection,
    ExpenseSummarySection,
} from './ExpenseEntrySections';
import { buildFormState } from './expenseEntryShared';

export default function ExpenseEntryFormView({ pageId, config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const showAutoNumberSwitch = !activeRecordId;
    const entryContent = useMemo(() => {
        if (activeRecordId) {
            return config.records?.[activeRecordId] ?? config.draft;
        }

        return config.draft;
    }, [activeRecordId, config.draft, config.records]);
    const [values, setValues] = useState(() => buildFormState(entryContent));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(entryContent));
    }, [config.sectionTabs, entryContent]);

    const initialComparable = useMemo(
        () => ({
            liabilityAccounts: entryContent.liabilityAccounts ?? [],
            entryDate: entryContent.entryDate ?? '',
            autoNumber: entryContent.autoNumber ?? true,
            numberingType: entryContent.numberingType ?? '',
            documentNumber: entryContent.documentNumber ?? '',
            dueDate: entryContent.dueDate ?? '',
            branches: entryContent.branches ?? [],
            notes: entryContent.notes ?? '',
            lineItems: entryContent.lineItems ?? [],
        }),
        [entryContent],
    );

    const currentComparable = useMemo(
        () => ({
            liabilityAccounts: values.liabilityAccounts,
            entryDate: values.entryDate,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            dueDate: values.dueDate,
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
                    { label: config.labels.liabilityAccount, type: 'array', value: values.liabilityAccounts },
                    { label: config.labels.entryDate, value: values.entryDate },
                    {
                        label: config.labels.documentNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                    { label: config.labels.dueDate, value: values.dueDate },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                    { label: config.lineSectionTitle, type: 'array', value: values.lineItems },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.branch,
            config.labels.documentNumber,
            config.labels.dueDate,
            config.labels.entryDate,
            config.labels.liabilityAccount,
            config.lineSectionTitle,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.branches,
            values.documentNumber,
            values.dueDate,
            values.entryDate,
            values.liabilityAccounts,
            values.lineItems,
            values.numberingType,
        ],
    );

    const dockActions = useMemo(() => {
        const baseActions = config.dockActions ?? [];

        return baseActions
            .filter((action) => (activeRecordId ? true : action.id !== 'delete'))
            .map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          tone: values.saveTone,
                          disabled: saveDisabled,
                      }
                    : action,
            );
    }, [activeRecordId, config.dockActions, saveDisabled, values.saveTone]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    return (
        <TransactionFormLayout
            header={<ExpenseEntryHeader config={config} values={values} setValues={setValues} showAutoNumberSwitch={showAutoNumberSwitch} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            footer={<TransactionTotalCard label={config.totalCardLabel} value={values.totalValue} />}
            dockActions={dockActions}
        >
            {activeSectionId === 'additional-info' ? (
                <ExpenseAdditionalInfoSection config={config} values={values} setValues={setValues} />
            ) : activeSectionId === 'summary' ? (
                <ExpenseSummarySection config={config} values={values} />
            ) : (
                <ExpenseLineItemsSection config={config} values={values} setValues={setValues} />
            )}
        </TransactionFormLayout>
    );
}
