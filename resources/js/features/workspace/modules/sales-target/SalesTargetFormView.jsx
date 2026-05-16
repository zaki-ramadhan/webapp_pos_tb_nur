import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import TargetDetailEntryModal from '@/features/workspace/modules/shared/TargetDetailEntryModal';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { resolveSaveDisabledState } from '@/features/workspace/shared/formValidation';
import { SalesTargetAdditionalInfoSection, SalesTargetDetailsSection, SalesTargetHeader } from './SalesTargetSections';
import { buildTargetState, findTargetRecord } from './salesTargetShared';

export default function SalesTargetFormView({ pageId, config, activeLevel2Tab }) {
    const detailRecord = useMemo(() => findTargetRecord(config, activeLevel2Tab), [activeLevel2Tab, config]);
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildTargetState(detailRecord ?? config.draft, config));
    const [activeModalRow, setActiveModalRow] = useState(null);
    const isDetail = Boolean(detailRecord);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildTargetState(detailRecord ?? config.draft, config));
        setActiveModalRow(null);
    }, [config, detailRecord]);

    const initialComparable = useMemo(
        () => ({
            name: (detailRecord ?? config.draft)?.name ?? '',
            targetType: (detailRecord ?? config.draft)?.targetType ?? '',
            branch: (detailRecord ?? config.draft)?.branch ?? '',
            startDate: (detailRecord ?? config.draft)?.startDate ?? '',
            endDate: (detailRecord ?? config.draft)?.endDate ?? '',
            notes: (detailRecord ?? config.draft)?.notes ?? '',
            analyst: (detailRecord ?? config.draft)?.analyst ?? '',
        }),
        [config.draft, detailRecord],
    );

    const currentComparable = useMemo(
        () => ({
            name: values.name,
            targetType: values.targetType,
            branch: values.branch,
            startDate: values.startDate,
            endDate: values.endDate,
            notes: values.notes,
            analyst: values.analyst,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.name, value: values.name },
                    { label: config.labels.endDate, value: values.endDate },
                ],
                initialComparable,
                currentComparable,
            }),
        [config.labels.endDate, config.labels.name, currentComparable, initialComparable, values.endDate, values.name],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    const dockActions = useMemo(() => {
        const baseActions = isDetail ? config.detailDockActions : config.createDockActions;

        return (baseActions ?? []).map((action) =>
            action.id === 'save'
                ? {
                      ...action,
                      disabled: saveDisabled,
                  }
                : action,
        );
    }, [config.createDockActions, config.detailDockActions, isDetail, saveDisabled]);

    return (
        <>
            <TransactionFormLayout
                header={<SalesTargetHeader config={config} values={values} setValues={setValues} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={dockActions}
            >
                {activeSectionId === 'additional-info' ? (
                    <SalesTargetAdditionalInfoSection config={config} values={values} setValues={setValues} />
                ) : (
                    <SalesTargetDetailsSection values={values} setValues={setValues} onOpenModal={setActiveModalRow} />
                )}
            </TransactionFormLayout>
            <TargetDetailEntryModal
                open={Boolean(activeModalRow)}
                modal={values.detailModal}
                row={activeModalRow}
                onClose={() => setActiveModalRow(null)}
            />
        </>
    );
}
