import { useEffect, useMemo, useState } from 'react';

import { buildPurchaseDepositRecord } from './purchaseDepositConfig';
import {
    DepositFooterSummary,
    buildDepositFormState,
} from '@/features/workspace/modules/shared/DepositWorkspaceShared';
import { TransactionDock, TransactionSectionRail } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    PurchaseDepositAdditionalInfoSection,
    PurchaseDepositHeader,
    PurchaseDepositInvoiceInfoSection,
    PurchaseDepositMainSection,
} from './PurchaseDepositSections';

export default function PurchaseDepositFormView({ config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'deposit');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildPurchaseDepositRecord(
                      config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId },
                      config,
                  )
                : config.draft,
        [activeRecordId, config],
    );
    const [values, setValues] = useState(() => buildDepositFormState(sourceRecord));
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'deposit');
        setValues(buildDepositFormState(sourceRecord));
    }, [config.sectionTabs, sourceRecord]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-[#d8dde7] px-4 py-4">
                        <PurchaseDepositHeader config={config} values={values} isDetail={isDetail} setValues={setValues} />
                    </div>

                    <div className="flex items-start gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeSectionId === 'additional-info' ? (
                                <PurchaseDepositAdditionalInfoSection config={config} values={values} isDetail={isDetail} />
                            ) : activeSectionId === 'invoice-info' ? (
                                <PurchaseDepositInvoiceInfoSection config={config} values={values} isDetail={isDetail} />
                            ) : (
                                <PurchaseDepositMainSection config={config} values={values} isDetail={isDetail} />
                            )}
                        </div>
                    </div>

                    <div className="px-3 pb-3">
                        <DepositFooterSummary items={values.footerItems} />
                    </div>
                </div>

                <div className="shrink-0 lg:w-[96px]">
                    <TransactionDock actions={values.dockActions} />
                </div>
            </div>
        </div>
    );
}
