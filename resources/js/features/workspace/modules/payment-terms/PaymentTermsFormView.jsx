import { useEffect, useState } from 'react';

import DockActionButton from '@/features/workspace/shared/DockActionButton';
import SectionTab from '@/features/workspace/shared/SectionTab';
import { SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import { PaymentTermsCreateSection, PaymentTermsDetailSection } from './PaymentTermsSections';
import { buildCreateValues, buildDetailValues } from './paymentTermsShared';

export default function PaymentTermsFormView({ page, activeLevel2Tab }) {
    const config = page.paymentTerms;
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetailMode = Boolean(recordId);
    const [createValues, setCreateValues] = useState(() => buildCreateValues(config));
    const [detailValues, setDetailValues] = useState(() => buildDetailValues(config, recordId));

    useEffect(() => {
        setCreateValues(buildCreateValues(config));
    }, [config]);

    useEffect(() => {
        setDetailValues(buildDetailValues(config, recordId));
    }, [config, recordId]);

    return (
        <>
            <div className="flex flex-1 min-h-0 flex-col gap-5 rounded-[4px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-stretch overflow-hidden">
                <div className="order-2 min-w-0 flex-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col lg:order-1">
                    <div className="flex-1 min-h-0 flex flex-col">
                        {isDetailMode ? (
                            <PaymentTermsDetailSection config={config} detailValues={detailValues} setDetailValues={setDetailValues} />
                        ) : (
                            <PaymentTermsCreateSection config={config} createValues={createValues} setCreateValues={setCreateValues} />
                        )}
                    </div>
                </div>

                <div className="order-1 flex justify-end lg:order-2 lg:shrink-0 lg:self-start">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        <DockActionButton label={config.saveLabel} tone="muted" icon={<SaveIcon className="h-8 w-8 sm:h-9 sm:w-9" />} />
                        {isDetailMode ? <DockActionButton label={config.deleteLabel} tone="danger" icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />} /> : null}
                    </div>
                </div>
            </div>
        </>
    );
}
