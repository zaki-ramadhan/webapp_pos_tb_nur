import { useEffect, useMemo, useState } from 'react';

import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import { SalesCommissionCommissionTab, SalesCommissionOtherTab } from './SalesCommissionSections';
import { buildCommissionFormValues } from './salesCommissionShared';

export default function SalesCommissionFormView({ config, activeLevel2Tab }) {
    const detailRow = useMemo(
        () =>
            activeLevel2Tab?.tabType === 'detail'
                ? (config.table.rows ?? []).find((row) => row.id === activeLevel2Tab.recordId) ?? null
                : null,
        [activeLevel2Tab, config.table.rows],
    );
    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.formTabs?.[0]?.id ?? 'commission');
    const [values, setValues] = useState(() => buildCommissionFormValues(config, detailRow));

    useEffect(() => {
        setActiveTabId(config.formTabs?.[0]?.id ?? 'commission');
        setValues(buildCommissionFormValues(config, detailRow));
    }, [config, detailRow]);

    const dockActions = isDetail ? config.detailDockActions : config.createDockActions;

    return (
        <div className="relative flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <PreferencesTabs
                    tabs={config.formTabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                    className="pt-0"
                />
            </div>

            <div className="flex min-h-[642px] flex-col gap-4 rounded-[4px] border border-[#cfd6e2] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-start xl:px-4 xl:py-4">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4">
                    {activeTabId === 'others' ? (
                        <SalesCommissionOtherTab config={config} values={values} setValues={setValues} />
                    ) : (
                        <SalesCommissionCommissionTab config={config} values={values} setValues={setValues} />
                    )}
                </div>

                <div className="flex shrink-0 flex-row justify-end gap-3 lg:flex-col">
                    {dockActions.map((action) => (
                        <DockActionButton
                            key={action.id}
                            label={action.label}
                            tone={action.tone}
                            icon={action.icon === 'trash' ? <TrashIcon className="h-9 w-9" /> : <SaveIcon className="h-9 w-9" />}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
