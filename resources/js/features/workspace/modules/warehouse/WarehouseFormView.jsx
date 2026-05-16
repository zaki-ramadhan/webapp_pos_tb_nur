import { useEffect, useMemo, useState } from 'react';

import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import {
    WarehouseAddressTab,
    WarehouseGeneralTab,
    WarehouseUsersTab,
} from './WarehouseSections';
import { buildFormValues } from './warehouseShared';

function renderDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

export default function WarehouseFormView({ config, activeLevel2Tab }) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return config.table.rows.find((row) => row.id === recordId) ?? null;
    }, [activeLevel2Tab, config.table.rows]);
    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.tabs?.[0]?.id ?? 'warehouse-general');
    const [values, setValues] = useState(() => buildFormValues(config, detailRow));

    useEffect(() => {
        setActiveTabId(config.tabs?.[0]?.id ?? 'warehouse-general');
        setValues(buildFormValues(config, detailRow));
    }, [config, detailRow]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const dockActions = isDetail ? config.detailDockActions : config.createDockActions;

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PreferencesTabs
                tabs={config.tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
            />

            <div className="flex min-h-[640px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                <div className="order-2 min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4 lg:order-1">
                    {activeTabId === 'warehouse-address' ? (
                        <WarehouseAddressTab config={config} values={values} onChange={handleChange} />
                    ) : activeTabId === 'warehouse-users' ? (
                        <WarehouseUsersTab config={config} values={values} onChange={handleChange} isDetail={isDetail} />
                    ) : (
                        <WarehouseGeneralTab config={config} values={values} onChange={handleChange} isDetail={isDetail} />
                    )}
                </div>

                <div className="order-1 flex justify-end lg:order-2 lg:shrink-0">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        {dockActions.map((action) => (
                            <DockActionButton
                                key={action.id}
                                label={action.label}
                                tone={action.tone}
                                icon={renderDockIcon(action.icon)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
