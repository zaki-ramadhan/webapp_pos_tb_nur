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
                <div className="min-w-0 flex-1 flex flex-col gap-3">
                    <div className="px-4 py-4 bg-white border border-ui-border rounded-[6px] shadow-card-light">
                        <SupplierPriceHeader config={config} values={values} setValues={setValues} />
                    </div>

                    <div className="flex min-h-[620px] gap-0">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 px-3 py-3 bg-white border border-ui-border rounded-[6px] shadow-card-light">
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
