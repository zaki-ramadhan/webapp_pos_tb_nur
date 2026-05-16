import { useEffect, useMemo, useState } from 'react';

import {
    TransactionDock,
    TransactionSectionRail,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { buildAssetDisposalConfig } from './assetDisposalConfig';
import {
    AssetDisposalGeneralSection,
    AssetDisposalHeader,
    SectionCard,
} from './AssetDisposalSections';
import { buildFormValues } from './assetDisposalShared';

export default function AssetDisposalFormView({ page, activeLevel2Tab }) {
    const config = useMemo(
        () => buildAssetDisposalConfig(page.assetDisposal ?? {}),
        [page.assetDisposal],
    );
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return config.table.rows.find((row) => row.id === recordId) ?? null;
    }, [activeLevel2Tab, config.table.rows]);
    const isDetail = Boolean(detailRow);
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFormValues(config, detailRow));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs[0]?.id ?? 'general');
        setValues(buildFormValues(config, detailRow));
    }, [config, detailRow]);

    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div className="space-y-4">
                <AssetDisposalHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />

                <div className="flex flex-col gap-4 xl:flex-row">
                    <TransactionSectionRail
                        tabs={config.sectionTabs}
                        activeTabId={activeSectionId}
                        onSelectTab={setActiveSectionId}
                    />

                    <SectionCard className="min-h-[642px] flex-1">
                        <AssetDisposalGeneralSection config={config} values={values} setValues={setValues} />
                    </SectionCard>
                </div>
            </div>

            <TransactionDock actions={values.dockActions} />
        </div>
    );
}
