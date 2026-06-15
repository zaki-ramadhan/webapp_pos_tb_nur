import { useEffect, useMemo, useState } from 'react';

import { buildStockOpnameOrderRecord } from '@/features/workspace/modules/stock-opname-order/stockOpnameOrderConfig';
import StockOpnameOrderItemModal from '@/features/workspace/modules/stock-opname-order/StockOpnameOrderItemModal';
import { TransactionDock, TransactionSectionRail } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    StockOpnameOrderHeader,
    StockOpnameOrderInfoSection,
    StockOpnameOrderProcessSection,
    StockOpnameOrderResultsSection,
} from './StockOpnameOrderSections';
import { buildFormValues } from './stockOpnameOrderShared';

export default function StockOpnameOrderFormView({ config, activeLevel2Tab }) {
    const isDetail = activeLevel2Tab?.tabType === 'detail';
    const recordId = activeLevel2Tab?.recordId;
    const baseRecord = useMemo(() => {
        if (!isDetail) {
            return buildFormValues(config.draft);
        }

        const sourceRow = (config.table.rows ?? []).find((row) => row.id === recordId) ?? { id: recordId };

        return buildFormValues(buildStockOpnameOrderRecord(sourceRow, config));
    }, [config, isDetail, recordId]);
    const [values, setValues] = useState(() => buildFormValues(baseRecord));
    const [activeSectionId, setActiveSectionId] = useState(isDetail ? config.detailSectionTabs[0]?.id ?? 'info' : config.createSectionTabs[0]?.id ?? 'info');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        setValues(buildFormValues(baseRecord));
        setActiveSectionId(isDetail ? config.detailSectionTabs[0]?.id ?? 'info' : config.createSectionTabs[0]?.id ?? 'info');
        setSelectedItem(null);
    }, [baseRecord, config.createSectionTabs, config.detailSectionTabs, isDetail]);

    const sectionTabs = isDetail ? config.detailSectionTabs : config.createSectionTabs;

    return (
        <div className="grid gap-4 xl:grid-cols-[36px_minmax(0,1fr)_112px] xl:items-start">
            <TransactionSectionRail tabs={sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

            <div className="grid gap-4">
                <StockOpnameOrderHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />

                {activeSectionId === 'results' ? (
                    <StockOpnameOrderResultsSection config={config} values={values} onOpenItem={setSelectedItem} />
                ) : activeSectionId === 'process' ? (
                    <StockOpnameOrderProcessSection values={values} />
                ) : (
                    <StockOpnameOrderInfoSection config={config} values={values} isDetail={isDetail} />
                )}
            </div>

            <TransactionDock actions={values.dockActions ?? []} />

            <StockOpnameOrderItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={values.itemModal}
                item={selectedItem}
            />
        </div>
    );
}
