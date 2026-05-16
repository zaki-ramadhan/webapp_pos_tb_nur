import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import {
    buildMaterialAdditionRecord,
} from './materialAdditionConfig';
import WorkOrderItemModal from '@/features/workspace/modules/shared/WorkOrderItemModal';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import {
    MaterialAdditionAdditionalInfoSection,
    MaterialAdditionChargesSection,
    MaterialAdditionHeader,
    MaterialAdditionItemsSection,
} from './MaterialAdditionSections';
import { buildFormValues } from './materialAdditionShared';

export default function MaterialAdditionFormView({ pageId, config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildMaterialAdditionRecord(
                      config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId },
                      config,
                  )
                : config.draft,
        [activeRecordId, config],
    );
    const [values, setValues] = useState(() => buildFormValues(sourceRecord));
    const [selectedItem, setSelectedItem] = useState(null);
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormValues(sourceRecord));
        setSelectedItem(null);
    }, [config.sectionTabs, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            date: sourceRecord.date ?? '',
            type: sourceRecord.type ?? '',
            workOrderNumber: sourceRecord.workOrderNumber ?? '',
            autoNumber: sourceRecord.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? '',
            items: sourceRecord.items ?? [],
            branches: sourceRecord.branches ?? [],
            notes: sourceRecord.notes ?? '',
        }),
        [sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            date: values.date,
            type: values.type,
            workOrderNumber: values.workOrderNumber,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            items: values.items,
            branches: values.branches,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.date, value: values.date },
                    { label: config.labels.workOrderNumber, value: values.workOrderNumber },
                    {
                        label: config.labels.documentNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.branch,
            config.labels.date,
            config.labels.documentNumber,
            config.labels.workOrderNumber,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.branches,
            values.date,
            values.documentNumber,
            values.numberingType,
            values.workOrderNumber,
        ],
    );

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? []).map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          disabled: saveDisabled,
                      }
                    : action,
            ),
        [saveDisabled, values.dockActions],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    return (
        <>
            <TransactionFormLayout
                header={<MaterialAdditionHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={dockActions}
            >
                {activeSectionId === 'charges' ? (
                    <MaterialAdditionChargesSection config={config} values={values} setValues={setValues} />
                ) : activeSectionId === 'additional-info' ? (
                    <MaterialAdditionAdditionalInfoSection config={config} values={values} setValues={setValues} />
                ) : (
                    <MaterialAdditionItemsSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                        onOpenItem={setSelectedItem}
                    />
                )}
            </TransactionFormLayout>

            <WorkOrderItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={values.itemModal}
                item={selectedItem}
            />
        </>
    );
}
