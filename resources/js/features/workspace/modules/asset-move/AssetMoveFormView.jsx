import { useEffect, useMemo, useState } from 'react';

import AssetMoveItemModal from '@/features/workspace/modules/asset-move/AssetMoveItemModal';
import {
    TransactionDock,
    TransactionSectionRail,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { buildAssetMoveRecord } from './assetMoveConfig';
import {
    AssetMoveDetailsSection,
    AssetMoveHeader,
    AssetMoveInfoSection,
} from './AssetMoveSections';
import { buildAssetMoveFormValues } from './assetMoveShared';

export default function AssetMoveFormView({ config, activeLevel2Tab }) {
    const activeSectionIdDefault = config.sectionTabs?.[0]?.id ?? 'details';
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildAssetMoveRecord(
                      config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId },
                      config,
                  )
                : config.draft,
        [activeRecordId, config],
    );
    const [activeSectionId, setActiveSectionId] = useState(activeSectionIdDefault);
    const [values, setValues] = useState(() => buildAssetMoveFormValues(sourceRecord));
    const [selectedItem, setSelectedItem] = useState(null);
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(activeSectionIdDefault);
        setValues(buildAssetMoveFormValues(sourceRecord));
        setSelectedItem(null);
    }, [activeSectionIdDefault, sourceRecord]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <AssetMoveHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />

                    <div className="flex min-h-0 flex-col gap-4 px-4 py-4 lg:flex-row">
                        <TransactionSectionRail
                            tabs={config.sectionTabs}
                            activeTabId={activeSectionId}
                            onSelectTab={setActiveSectionId}
                        />

                        <div className="min-w-0 flex-1">
                            {activeSectionId === 'additional-info' ? (
                                <AssetMoveInfoSection
                                    config={config}
                                    values={values}
                                    setValues={setValues}
                                    isDetail={isDetail}
                                />
                            ) : (
                                <AssetMoveDetailsSection
                                    config={config}
                                    values={values}
                                    setValues={setValues}
                                    isDetail={isDetail}
                                    onOpenItem={setSelectedItem}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <TransactionDock actions={values.dockActions ?? []} />
            </div>

            <AssetMoveItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={values.itemModal}
                item={selectedItem}
            />
        </div>
    );
}
