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
        <div className="relative flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab label={config.sectionLabel} tone="accent" className="h-[34px]" />
            </div>

            <div className="flex min-h-[642px] flex-col gap-5 rounded-[4px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    {isDetailMode ? (
                        <PaymentTermsDetailSection config={config} detailValues={detailValues} setDetailValues={setDetailValues} />
                    ) : (
                        <PaymentTermsCreateSection config={config} createValues={createValues} setCreateValues={setCreateValues} />
                    )}
                </div>

                <div className="flex justify-end lg:shrink-0">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        <DockActionButton label={config.saveLabel} tone="muted" icon={<SaveIcon className="h-8 w-8 sm:h-9 sm:w-9" />} />
                        {isDetailMode ? <DockActionButton label={config.deleteLabel} tone="danger" icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />} /> : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
