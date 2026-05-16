import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import WorkOrderItemModal from '@/features/workspace/modules/shared/WorkOrderItemModal';
import {
    TransactionFormLayout,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { buildWorkOrderFormValues } from '@/features/workspace/modules/work-order/workOrderViewShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import { buildWorkOrderRecord } from '@/features/workspace/modules/work-order/workOrderConfig';
import {
    WorkOrderAdditionalInfoSection,
    WorkOrderChargesSection,
    WorkOrderHeader,
    WorkOrderItemsSection,
    WorkOrderSummarySection,
    WorkOrderTotalsBar,
} from './WorkOrderSections';

export default function WorkOrderFormView({ pageId, config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildWorkOrderRecord(
                      config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId },
                      config,
                  )
                : config.draft,
        [activeRecordId, config],
    );
    const [values, setValues] = useState(() => buildWorkOrderFormValues(sourceRecord));
    const [selectedItem, setSelectedItem] = useState(null);
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildWorkOrderFormValues(sourceRecord));
        setSelectedItem(null);
    }, [config.sectionTabs, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            date: sourceRecord.date ?? '',
            autoNumber: sourceRecord.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? '',
            items: sourceRecord.items ?? [],
            customerReference: sourceRecord.customerReference ?? '',
            expenseAccounts: sourceRecord.expenseAccounts ?? [],
            varianceAccounts: sourceRecord.varianceAccounts ?? [],
            branches: sourceRecord.branches ?? [],
            notes: sourceRecord.notes ?? '',
        }),
        [sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            date: values.date,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            items: values.items,
            customerReference: values.customerReference,
            expenseAccounts: values.expenseAccounts,
            varianceAccounts: values.varianceAccounts,
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
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.branches,
            values.date,
            values.documentNumber,
            values.numberingType,
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
                header={<WorkOrderHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={values.showTotals ? <WorkOrderTotalsBar values={values} /> : null}
                dockActions={dockActions}
            >
                {activeSectionId === 'charges' ? (
                    <WorkOrderChargesSection config={config} values={values} setValues={setValues} />
                ) : activeSectionId === 'additional-info' ? (
                    <WorkOrderAdditionalInfoSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                    />
                ) : activeSectionId === 'work-info' ? (
                    <WorkOrderSummarySection config={config} values={values} />
                ) : (
                    <WorkOrderItemsSection
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
