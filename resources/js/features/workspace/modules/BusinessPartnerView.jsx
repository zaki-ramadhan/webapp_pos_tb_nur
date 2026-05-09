import { useEffect, useMemo, useState } from 'react';

import { buildBusinessPartnerConfig, buildBusinessPartnerRecord } from '@/features/workspace/modules/businessPartnerConfig';
import {
    buildFormState,
    BusinessPartnerTableView,
    DockIcon,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import { renderPartnerTab } from '@/features/workspace/modules/business-partner/BusinessPartnerFormSections';
import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';

function BusinessPartnerFormView({ config, activeLevel2Tab, partnerType }) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const isDetail = Boolean(recordId);
    const sourceRow = config.table.rows.find((row) => row.id === recordId) ?? {};
    const sourceRecord = useMemo(
        () => (isDetail ? buildBusinessPartnerRecord(partnerType, sourceRow, config) : config.formDefaults),
        [config, isDetail, partnerType, sourceRow],
    );
    const [activeTabId, setActiveTabId] = useState(config.tabs[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildFormState(sourceRecord));

    useEffect(() => {
        setActiveTabId(config.tabs[0]?.id ?? 'general');
        setValues(buildFormState(sourceRecord));
    }, [config.tabs, sourceRecord]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const dockActions = isDetail
        ? [
              { id: 'save', label: 'Simpan', tone: 'muted', icon: 'save' },
              { id: 'attachment', label: 'Lampiran', tone: 'primary', icon: 'attachment' },
              { id: 'delete', label: 'Hapus', tone: 'danger', icon: 'trash' },
          ]
        : [
              { id: 'save', label: 'Simpan', tone: 'muted', icon: 'save' },
              { id: 'attachment', label: 'Lampiran', tone: 'primary', icon: 'attachment' },
          ];

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={config.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[700px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                <div className="order-2 min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-3 py-4 sm:px-4 lg:order-1">
                    {renderPartnerTab({
                        config,
                        values,
                        isDetail,
                        activeTabId,
                        onChange: handleChange,
                    })}
                </div>

                <div className="order-1 flex justify-end lg:order-2 lg:shrink-0">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        {dockActions.map((action) => (
                            <DockActionButton
                                key={action.id}
                                label={action.label}
                                tone={action.tone}
                                icon={<DockIcon icon={action.icon} />}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BusinessPartnerView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    partnerType = 'customer',
}) {
    const pageConfig = partnerType === 'supplier' ? page.suppliers ?? {} : page.customers ?? {};
    const config = useMemo(() => buildBusinessPartnerConfig(partnerType, pageConfig), [pageConfig, partnerType]);

    return mode === 'table' ? (
        <BusinessPartnerTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <BusinessPartnerFormView config={config} activeLevel2Tab={activeLevel2Tab} partnerType={partnerType} />
    );
}
