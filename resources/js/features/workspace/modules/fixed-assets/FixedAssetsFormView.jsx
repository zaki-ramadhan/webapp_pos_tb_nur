import { useEffect, useMemo, useState } from 'react';

import FixedAssetExpenseModal from '@/features/workspace/modules/shared/FixedAssetExpenseModal';
import { buildFixedAssetsRecord } from '@/features/workspace/modules/fixed-assets/fixedAssetsConfig';
import {
    TransactionDock,
    TransactionSectionRail,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    FixedAssetsAdditionalInfoSection,
    FixedAssetsExpenseSection,
    FixedAssetsGeneralSection,
    FixedAssetsHeader,
    FixedAssetsLocationSection,
} from '@/features/workspace/modules/fixed-assets/FixedAssetsFormSections';
import {
    buildFixedAssetsFormValues,
    FixedAssetsSummary,
} from '@/features/workspace/modules/fixed-assets/fixedAssetsViewShared';

export default function FixedAssetsFormView({ config, activeLevel2Tab }) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildFixedAssetsRecord(config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId }, config)
                : config.draft,
        [activeRecordId, config],
    );
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFixedAssetsFormValues(sourceRecord));
    const [selectedExpense, setSelectedExpense] = useState(null);
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'general');
        setValues(buildFixedAssetsFormValues(sourceRecord));
        setSelectedExpense(null);
    }, [config.sectionTabs, sourceRecord]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1">
                    <div className="grid gap-4 xl:grid-cols-[36px_minmax(0,1fr)] xl:items-start">
                        <TransactionSectionRail
                            tabs={config.sectionTabs}
                            activeTabId={activeSectionId}
                            onSelectTab={setActiveSectionId}
                        />

                        <div className="grid gap-4">
                            <FixedAssetsHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />

                            {activeSectionId === 'additional-info' ? (
                                <FixedAssetsAdditionalInfoSection config={config} values={values} setValues={setValues} isDetail={isDetail} />
                            ) : activeSectionId === 'expense-account' ? (
                                <FixedAssetsExpenseSection config={config} values={values} setValues={setValues} onOpenExpense={setSelectedExpense} />
                            ) : activeSectionId === 'asset-location' ? (
                                <FixedAssetsLocationSection config={config} values={values} />
                            ) : (
                                <FixedAssetsGeneralSection config={config} values={values} setValues={setValues} isDetail={isDetail} />
                            )}
                        </div>
                    </div>
                </div>

                <TransactionDock actions={values.dockActions ?? []} />
            </div>

            <div className="flex justify-end">
                <FixedAssetsSummary values={values} />
            </div>

            <FixedAssetExpenseModal
                open={Boolean(selectedExpense)}
                onClose={() => setSelectedExpense(null)}
                modal={values.expenseModal}
                item={selectedExpense}
            />
        </div>
    );
}
