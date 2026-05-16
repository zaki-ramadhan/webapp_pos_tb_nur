import { useEffect, useMemo, useState } from 'react';

import StockOpnameResultItemModal from '@/features/workspace/modules/shared/StockOpnameResultItemModal';
import { TransactionDock, TransactionSectionRail } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    buildStockOpnameResultRecord,
} from '@/features/workspace/modules/stock-opname-result/stockOpnameResultConfig';
import { StockOpnameResultHeader, StockOpnameResultInfoSection, StockOpnameResultItemsSection } from './StockOpnameResultSections';
import { buildFormValues } from './stockOpnameResultShared';

export default function StockOpnameResultFormView({ config, activeLevel2Tab }) {
    const isDetail = activeLevel2Tab?.tabType === 'detail';
    const recordId = activeLevel2Tab?.recordId;
    const baseRecord = useMemo(() => {
        if (!isDetail) {
            return buildFormValues(config.draft);
        }

        const sourceRow = (config.table.rows ?? []).find((row) => row.id === recordId) ?? { id: recordId };

        return buildFormValues(buildStockOpnameResultRecord(sourceRow, config));
    }, [config, isDetail, recordId]);
    const [values, setValues] = useState(() => buildFormValues(baseRecord));
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs[0]?.id ?? 'items');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        setValues(buildFormValues(baseRecord));
        setActiveSectionId(config.sectionTabs[0]?.id ?? 'items');
        setSelectedItem(null);
    }, [baseRecord, config.sectionTabs]);

    return (
        <div className="grid gap-4 xl:grid-cols-[36px_minmax(0,1fr)_112px] xl:items-start">
            <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

            <div className="grid gap-4">
                <StockOpnameResultHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />

                {activeSectionId === 'info' ? (
                    <StockOpnameResultInfoSection config={config} values={values} setValues={setValues} isDetail={isDetail} />
                ) : (
                    <StockOpnameResultItemsSection config={config} values={values} setValues={setValues} onOpenItem={setSelectedItem} />
                )}
            </div>

            <TransactionDock actions={values.dockActions ?? []} />

            <StockOpnameResultItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={values.itemModal}
                item={selectedItem}
            />
        </div>
    );
}
