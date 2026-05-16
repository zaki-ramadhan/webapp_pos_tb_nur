import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { resolveSaveDisabledState } from '@/features/workspace/shared/formValidation';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { BudgetHeader, BudgetInfoSection, BudgetLinesSection } from './BudgetSections';
import { buildBudgetFormValues } from './budgetShared';

export default function BudgetFormView({ page, activeLevel2Tab }) {
    const config = page.budgetPage;
    const [activeTabId, setActiveTabId] = useState(config.sectionTabs?.[0]?.id ?? 'budget-lines');
    const [values, setValues] = useState(() => buildBudgetFormValues(config));

    useEffect(() => {
        setActiveTabId(config.sectionTabs?.[0]?.id ?? 'budget-lines');
        setValues(buildBudgetFormValues(config));
    }, [config]);

    const initialComparable = useMemo(() => {
        const initialValues = buildBudgetFormValues(config);

        return {
            month: initialValues.month,
            year: initialValues.year,
            type: initialValues.type,
            branches: initialValues.branches,
            keyword: initialValues.keyword,
            notes: initialValues.notes,
            analyzer: initialValues.analyzer,
        };
    }, [config]);

    const currentComparable = useMemo(
        () => ({
            month: values.month,
            year: values.year,
            type: values.type,
            branches: values.branches,
            keyword: values.keyword,
            notes: values.notes,
            analyzer: values.analyzer,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.month, value: values.month },
                    { label: config.labels.branch, value: values.branches[0] ?? '' },
                ],
                initialComparable,
                currentComparable,
            }),
        [config.labels.branch, config.labels.month, currentComparable, initialComparable, values.branches, values.month],
    );

    useWorkspaceDirtyRegistration({
        pageId: page.id,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? []).map((action) => ({
                ...action,
                tone: action.tone === 'green' ? 'success' : action.tone,
                disabled: action.id === 'save' ? saveDisabled : action.disabled,
            })),
        [config.dockActions, saveDisabled],
    );

    return (
        <TransactionFormLayout
            header={<BudgetHeader config={config} values={values} setValues={setValues} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeTabId}
            onSectionChange={setActiveTabId}
            dockActions={dockActions}
        >
            {activeTabId === 'budget-info' ? (
                <BudgetInfoSection config={config} values={values} setValues={setValues} />
            ) : (
                <BudgetLinesSection config={config} values={values} setValues={setValues} />
            )}
        </TransactionFormLayout>
    );
}
