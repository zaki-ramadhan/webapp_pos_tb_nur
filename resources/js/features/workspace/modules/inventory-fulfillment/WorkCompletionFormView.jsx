import { useEffect, useMemo, useState } from 'react';

import { buildWorkCompletionRecord } from './inventoryFulfillmentConfig';
import {
    TransactionDock,
    TransactionSectionRail,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    WorkCompletionAdditionalInfoSection,
    WorkCompletionDetailsSection,
    WorkCompletionHeader,
} from './WorkCompletionSections';
import { buildWorkCompletionFormState } from './workCompletionShared';

export default function WorkCompletionFormView({ config, activeLevel2Tab }) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.draft;
        }

        const row = config.table.rows.find((item) => item.id === activeRecordId);

        return buildWorkCompletionRecord(row, config);
    }, [activeRecordId, config]);
    const isDetail = Boolean(activeRecordId);
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildWorkCompletionFormState(sourceRecord));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs[0]?.id ?? 'details');
        setValues(buildWorkCompletionFormState(sourceRecord));
    }, [config, sourceRecord]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <WorkCompletionHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />

                    <div className="flex items-start gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeSectionId === 'additional-info' ? (
                                <WorkCompletionAdditionalInfoSection config={config} values={values} />
                            ) : (
                                <WorkCompletionDetailsSection config={config} values={values} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <TransactionDock actions={values.dockActions} />
                </div>
            </div>
        </div>
    );
}
