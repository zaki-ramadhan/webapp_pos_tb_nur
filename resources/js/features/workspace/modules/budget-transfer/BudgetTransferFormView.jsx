import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import { BudgetTransferHeader, TransferDetailsSection, TransferInfoSection } from './BudgetTransferSections';
import { buildInitialValues } from './budgetTransferShared';

export default function BudgetTransferFormView({ pageId, activeLevel2Tab, config }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildInitialValues(config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildInitialValues(config));
    }, [config]);

    const initialComparable = useMemo(() => {
        const initialValues = buildInitialValues(config);

        return {
            year: initialValues.year,
            type: initialValues.type,
            branches: initialValues.branches,
            autoNumber: initialValues.autoNumber,
            numberingType: initialValues.numberingType,
            transferNumber: initialValues.transferNumber,
            date: initialValues.date,
            fromMonth: initialValues.fromMonth,
            fromBudget: initialValues.fromBudget,
            transferAmount: initialValues.transferAmount,
            toMonth: initialValues.toMonth,
            toBudget: initialValues.toBudget,
            notes: initialValues.notes,
        };
    }, [config]);

    const currentComparable = useMemo(
        () => ({
            year: values.year,
            type: values.type,
            branches: values.branches,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            transferNumber: values.transferNumber,
            date: values.date,
            fromMonth: values.fromMonth,
            fromBudget: values.fromBudget,
            transferAmount: values.transferAmount,
            toMonth: values.toMonth,
            toBudget: values.toBudget,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.year, value: values.year },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                    {
                        label: config.labels.transferNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.transferNumber),
                    },
                    { label: config.labels.date, value: values.date },
                    { label: `${config.fromTitle} - ${config.labels.month}`, value: values.fromMonth },
                    { label: `${config.fromTitle} - ${config.labels.budget}`, value: values.fromBudget },
                    { label: config.labels.transferAmount, value: values.transferAmount },
                    { label: `${config.toTitle} - ${config.labels.month}`, value: values.toMonth },
                    { label: `${config.toTitle} - ${config.labels.budget}`, value: values.toBudget },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.fromTitle,
            config.labels.branch,
            config.labels.budget,
            config.labels.date,
            config.labels.month,
            config.labels.transferAmount,
            config.labels.transferNumber,
            config.labels.year,
            config.toTitle,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.branches,
            values.date,
            values.fromBudget,
            values.fromMonth,
            values.numberingType,
            values.toBudget,
            values.toMonth,
            values.transferAmount,
            values.transferNumber,
            values.year,
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
            (config.dockActions ?? []).map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          disabled: saveDisabled,
                      }
                    : action,
            ),
        [config.dockActions, saveDisabled],
    );

    return (
        <TransactionFormLayout
            header={<BudgetTransferHeader config={config} values={values} setValues={setValues} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            dockActions={dockActions}
        >
            {activeSectionId === 'additional-info' ? (
                <TransferInfoSection config={config} values={values} setValues={setValues} />
            ) : (
                <TransferDetailsSection config={config} values={values} setValues={setValues} />
            )}
        </TransactionFormLayout>
    );
}
