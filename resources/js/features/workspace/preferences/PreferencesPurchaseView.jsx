import React from 'react';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import usePreferencesTabsState from '@/features/workspace/preferences/usePreferencesTabsState';
import usePreferencesSectionHandlers from './hooks/usePreferencesSectionHandlers';
import { PurchaseSection } from './purchase/PurchasePreferenceComponents';

export default function PreferencesPurchaseView({
    tabs,
    activeTabId,
    onSelectTab,
    onUpdate,
}) {
    const { tabState, activeTab, updateActiveTab } = usePreferencesTabsState(tabs, activeTabId, onUpdate);

    const {
        handleChangeRadio,
        handleToggleSingle,
        handleChangeControl,
    } = usePreferencesSectionHandlers(updateActiveTab, true);

    if (!activeTab) {
        return null;
    }

    return (
        <PreferencesTabPanel
            tabs={tabs}
            activeTabId={activeTab.id}
            onSelectTab={onSelectTab}
            panelClassName={`max-w-[760px] space-y-6 ${activeTab.contentClassName ?? ''}`.trim()}
        >
            {(activeTab.sections ?? []).map((section) => (
                <PurchaseSection
                    key={section.id}
                    section={section}
                    onChangeRadio={handleChangeRadio}
                    onToggleSingle={handleToggleSingle}
                    onChangeControl={handleChangeControl}
                />
            ))}
        </PreferencesTabPanel>
    );
}
