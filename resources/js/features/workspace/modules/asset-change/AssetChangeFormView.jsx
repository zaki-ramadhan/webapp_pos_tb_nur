import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import { buildAssetChangeRecord } from './assetChangeConfig';
import {
    AssetChangeAdditionalInfoSection,
    AssetChangeExpenseSection,
    AssetChangeGeneralSection,
    AssetChangeHeader,
} from './AssetChangeSections';
import { buildFormValues } from './assetChangeShared';

export default function AssetChangeFormView({ pageId, config, activeLevel2Tab }) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildAssetChangeRecord(
                      config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId },
                      config,
                  )
                : config.draft,
        [activeRecordId, config],
    );
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFormValues(sourceRecord));
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'general');
        setValues(buildFormValues(sourceRecord));
    }, [config.sectionTabs, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            changeType: sourceRecord.changeType ?? '',
            asset: sourceRecord.asset ?? [],
            autoNumber: sourceRecord.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? '',
            transactionDate: sourceRecord.transactionDate ?? '',
            depreciationMethod: sourceRecord.depreciationMethod ?? '',
            residualValue: sourceRecord.residualValue ?? '',
            changeNotes: sourceRecord.changeNotes ?? '',
            branch: sourceRecord.branch ?? [],
            department: sourceRecord.department ?? [],
            assetAccount: sourceRecord.assetAccount ?? [],
            taxEnabled: sourceRecord.taxEnabled ?? false,
        }),
        [sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            changeType: values.changeType,
            asset: values.asset,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            transactionDate: values.transactionDate,
            depreciationMethod: values.depreciationMethod,
            residualValue: values.residualValue,
            changeNotes: values.changeNotes,
            branch: values.branch,
            department: values.department,
            assetAccount: values.assetAccount,
            taxEnabled: values.taxEnabled,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.asset, type: 'array', value: values.asset },
                    {
                        label: config.labels.number,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.asset,
            config.labels.number,
            currentComparable,
            initialComparable,
            values.asset,
            values.autoNumber,
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
        <TransactionFormLayout
            header={<AssetChangeHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            dockActions={dockActions}
        >
            {activeSectionId === 'expense' ? (
                <AssetChangeExpenseSection config={config} values={values} setValues={setValues} />
            ) : activeSectionId === 'additional-info' ? (
                <AssetChangeAdditionalInfoSection
                    config={config}
                    values={values}
                    setValues={setValues}
                    isDetail={isDetail}
                />
            ) : (
                <AssetChangeGeneralSection
                    config={config}
                    values={values}
                    setValues={setValues}
                    isDetail={isDetail}
                />
            )}
        </TransactionFormLayout>
    );
}
