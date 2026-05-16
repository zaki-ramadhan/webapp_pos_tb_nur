import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionDualTotalCard, TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import {
    GeneralJournalHeader,
    JournalAdditionalInfoSection,
    JournalLinesSection,
} from './GeneralJournalSections';
import { buildFormState, buildRecordFromTableRow } from './generalJournalShared';

export default function GeneralJournalFormView({ pageId, config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.defaults;
        }

        return config.records?.[activeRecordId] ?? buildRecordFromTableRow(config.rowMap?.[activeRecordId], config);
    }, [activeRecordId, config]);
    const [values, setValues] = useState(() => buildFormState(sourceRecord, config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord, config));
    }, [config, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            documentNumber: sourceRecord.documentNumber ?? '',
            entryDate: sourceRecord.entryDate ?? config.defaults?.entryDate ?? '',
            autoNumber: sourceRecord.autoNumber ?? config.defaults?.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? config.defaults?.numberingType ?? '',
            branches: sourceRecord.branches ?? config.defaults?.branches ?? [],
            notes: sourceRecord.notes ?? config.defaults?.notes ?? '',
            lineItems: sourceRecord.lineItems ?? [],
        }),
        [config.defaults?.autoNumber, config.defaults?.branches, config.defaults?.entryDate, config.defaults?.notes, config.defaults?.numberingType, sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            documentNumber: values.documentNumber,
            entryDate: values.entryDate,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
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
            config.labels.documentNumber,
            config.labels.entryDate,
            config.lineSectionTitle,
            currentComparable,
            initialComparable,
            values.autoNumber,
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
            header={<GeneralJournalHeader config={config} values={values} setValues={setValues} activeRecordId={activeRecordId} />}
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
            {activeSectionId === 'additional-info' ? (
                <JournalAdditionalInfoSection config={config} values={values} setValues={setValues} />
            ) : (
                <JournalLinesSection config={config} values={values} setValues={setValues} />
            )}
        </TransactionFormLayout>
    );
}
