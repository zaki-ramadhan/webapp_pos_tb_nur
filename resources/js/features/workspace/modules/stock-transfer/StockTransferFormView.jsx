import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import StockTransferItemModal from '@/features/workspace/modules/shared/StockTransferItemModal';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import { buildStockTransferRecord } from './stockTransferConfig';
import {
    StockTransferDetailsSection,
    StockTransferHeader,
    StockTransferInfoSection,
} from './StockTransferSections';
import { buildFormValues } from './stockTransferShared';

export default function StockTransferFormView({ pageId, config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildStockTransferRecord(
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
            process: sourceRecord.process ?? '',
            warehouse: sourceRecord.warehouse ?? [],
            counterpartWarehouse: sourceRecord.counterpartWarehouse ?? [],
            autoNumber: sourceRecord.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? '',
            date: sourceRecord.date ?? '',
            items: sourceRecord.items ?? [],
            branches: sourceRecord.branches ?? [],
            notes: sourceRecord.notes ?? '',
        }),
        [sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            process: values.process,
            warehouse: values.warehouse,
            counterpartWarehouse: values.counterpartWarehouse,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            date: values.date,
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
                    { label: config.labels.warehouse, type: 'array', value: values.warehouse },
                    { label: config.labels.counterpartWarehouse, type: 'array', value: values.counterpartWarehouse },
                    {
                        label: config.labels.documentNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                    { label: config.labels.date, value: values.date },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.branch,
            config.labels.counterpartWarehouse,
            config.labels.date,
            config.labels.documentNumber,
            config.labels.warehouse,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.branches,
            values.counterpartWarehouse,
            values.date,
            values.documentNumber,
            values.numberingType,
            values.warehouse,
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
                header={<StockTransferHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={dockActions}
            >
                {activeSectionId === 'additional-info' ? (
                    <StockTransferInfoSection config={config} values={values} setValues={setValues} isDetail={isDetail} />
                ) : (
                    <StockTransferDetailsSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                        onOpenItem={setSelectedItem}
                    />
                )}
            </TransactionFormLayout>

            <StockTransferItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={values.itemModal}
                item={selectedItem}
            />
        </>
    );
}
