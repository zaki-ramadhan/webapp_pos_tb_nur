import { useEffect, useState } from 'react';

import { TransactionDock, TransactionSectionRail } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { SupplierPriceDetailsSection, SupplierPriceHeader, SupplierPriceInfoSection } from './SupplierPriceSections';
import { buildFormValues } from './supplierPriceShared';

export default function SupplierPriceFormView({ config }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildFormValues(config));

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormValues(config));
    }, [config]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="px-4 pt-4 pb-0">
                        <SupplierPriceHeader config={config} values={values} setValues={setValues} />
                    </div>

                    <div className="flex min-h-[620px] gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeSectionId === 'additional-info' ? (
                                <SupplierPriceInfoSection config={config} values={values} setValues={setValues} />
                            ) : (
                                <SupplierPriceDetailsSection config={config} values={values} setValues={setValues} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 lg:w-[96px]">
                    <TransactionDock actions={config.dockActions} />
                </div>
            </div>
        </div>
    );
}
