import React from 'react';
import PanelActions from '@/features/workspace/shared/PanelActions';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import PreferenceSideItem from './components/PreferenceSideItem';
import usePreferencesState from './hooks/usePreferencesState';
import usePreferencesSave from './hooks/usePreferencesSave';
import PreferencesSidebarContent from './PreferencesSidebarContent';

export default function PreferencesView({ page }) {
    const workspace = page.workspace;
    const { rows: backendRows, reload } = useBackendIndexResource({
        resource: 'preferences',
        filters: { per_page: 500 },
    });

    const state = usePreferencesState(workspace, backendRows);

    const handleSave = usePreferencesSave(
        state.values,
        state.tabsData,
        state.setIsDirty,
        state.saving,
        state.setSaving,
        reload
    );

    const companyRootItem = { id: 'company-root', label: workspace.topTab };
    const sideItems = [companyRootItem, ...workspace.sidebarItems];

    const resolvedActions = (workspace.actions ?? []).map(action => 
        action.id === 'save' 
            ? { ...action, onClick: handleSave, loading: state.saving, disabled: (state.saving || !state.isDirty) && action.tone === 'primary' }
            : action
    );

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-[4px] border border-[#cad1dd] bg-[#f7f7f8] shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-[#d7dde8] bg-[#f8f8f8] px-2 pt-1 md:flex-row">
                <div className="flex min-h-0 w-full shrink-0 flex-col md:w-[190px]">
                    <div className="min-h-0 flex-1 border border-[#cfd6e2] bg-[#efefef] px-3 pb-3 pt-2 md:rounded-l-sm md:border-r-0 md:pr-0">
                        <div className="space-y-2">
                            {sideItems.map((item) => (
                                <PreferenceSideItem
                                    key={item.id}
                                    item={item}
                                    active={state.activeSideItemId === item.id}
                                    onClick={state.setActiveSideItemId}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-sm border border-[#d3d9e5] bg-[#fbfbfc] md:rounded-r-[4px] md:rounded-bl-none md:border-t md:border-l-0">
                    <PreferencesSidebarContent
                        {...state}
                        workspace={workspace}
                        companyRootItem={companyRootItem}
                        sideItems={sideItems}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#d5dbe6] bg-white px-4 py-4">
                <PanelActions actions={resolvedActions} />
            </div>
        </div>
    );
}
