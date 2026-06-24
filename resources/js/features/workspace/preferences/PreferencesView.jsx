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
        initialPerPage: 500,
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
        <div className="flex h-full flex-col overflow-hidden rounded-[4px] border border-tab-view-active-border-x bg-ui-bg-panel-lighter shadow-panel-subtle-alt">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-ui-border-medium bg-ui-bg-panel-lighter px-2 pt-1 md:flex-row">
                <div className="flex min-h-0 w-full shrink-0 flex-col md:w-[190px]">
                    <div className="min-h-0 flex-1 border border-ui-border bg-bg-scrollbar-track-alt px-3 pb-3 pt-2 sm:pt-2.5 md:pt-3.5 md:rounded-sm md:pr-0">
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

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
                    <PreferencesSidebarContent
                        {...state}
                        workspace={workspace}
                        companyRootItem={companyRootItem}
                        sideItems={sideItems}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-tab-overflow-border bg-ui-bg-panel-lighter px-4 py-4">
                <PanelActions actions={resolvedActions} />
            </div>
        </div>
    );
}
