import { useEffect, useMemo, useState } from 'react';

import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import {
    ItemGeneralTab,
    ItemSalesPurchaseTab,
} from '@/features/workspace/modules/items-services/ItemsServicesPrimaryTabs';
import {
    ItemAccountsTab,
    ItemImagesTab,
    ItemOtherTab,
    ItemStockTab,
} from '@/features/workspace/modules/items-services/ItemsServicesSecondaryTabs';
import {
    buildItemsServicesFormValues,
    DetailActionButton,
    renderItemsServicesDockIcon,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';

export default function ItemsServicesFormView({ config, activeLevel2Tab }) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return config.table.rows.find((row) => row.id === recordId) ?? null;
    }, [activeLevel2Tab, config.table.rows]);
    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.tabs?.[0]?.id ?? 'general');
    const [values, setValues] = useState(() => buildItemsServicesFormValues(config, detailRow));

    useEffect(() => {
        setActiveTabId(config.tabs?.[0]?.id ?? 'general');
        setValues(buildItemsServicesFormValues(config, detailRow));
    }, [config, detailRow]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-2 border-b border-[#d5d9e1] bg-[#f4f4f5] px-2 pt-[6px] lg:flex-row lg:items-end lg:justify-between">
                <PreferencesTabs
                    tabs={config.tabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                    className="flex-1 border-none bg-transparent px-0 pt-0 sm:px-0"
                />

                {isDetail ? (
                    <div className="flex flex-wrap items-center gap-1.5 pb-[1px]">
                        {config.detailQuickActions.map((label) => (
                            <DetailActionButton key={label} label={label} />
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="flex min-h-[640px] flex-col gap-5 px-4 py-4 xl:flex-row xl:items-start">
                <div className="order-2 min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4 xl:order-1">
                    {activeTabId === 'sales-purchase' ? (
                        <ItemSalesPurchaseTab config={config} values={values} onChange={handleChange} />
                    ) : activeTabId === 'stock' ? (
                        <ItemStockTab config={config} values={values} />
                    ) : activeTabId === 'accounts' ? (
                        <ItemAccountsTab config={config} values={values} onChange={handleChange} />
                    ) : activeTabId === 'images' ? (
                        <ItemImagesTab />
                    ) : activeTabId === 'other' ? (
                        <ItemOtherTab config={config} values={values} onChange={handleChange} />
                    ) : (
                        <ItemGeneralTab
                            config={config}
                            values={values}
                            onChange={handleChange}
                            isDetail={isDetail}
                        />
                    )}
                </div>

                <div className="order-1 flex justify-end xl:order-2 xl:shrink-0">
                    <div className="flex flex-row gap-3 xl:flex-col">
                        {(isDetail ? config.detailDockActions : config.createDockActions).map((action) => (
                            <DockActionButton
                                key={action.id}
                                label={action.label}
                                tone={action.tone}
                                icon={renderItemsServicesDockIcon(action.icon)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
