import { useEffect, useState } from 'react';

import {
    TransactionDock,
    TransactionSectionRail,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    PaymentOrderDetailsSection,
    PaymentOrderFooter,
    PaymentOrderHeader,
    PaymentOrderInfoSection,
} from './PaymentOrderSections';
import { buildFormValues } from './paymentOrderShared';

export default function PaymentOrderFormView({ config }) {
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
                    <div className="border-b border-[#d8dde7] px-4 py-4">
                        <PaymentOrderHeader config={config} values={values} setValues={setValues} />
                    </div>

                    <div className="flex min-h-[620px] gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeSectionId === 'additional-info' ? (
                                <PaymentOrderInfoSection config={config} values={values} setValues={setValues} />
                            ) : (
                                <PaymentOrderDetailsSection config={config} values={values} setValues={setValues} />
                            )}
                        </div>
                    </div>

                    <div className="px-3 pb-3">
                        <PaymentOrderFooter config={config} values={values} />
                    </div>
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <TransactionDock actions={config.dockActions} />
                </div>
            </div>
        </div>
    );
}
