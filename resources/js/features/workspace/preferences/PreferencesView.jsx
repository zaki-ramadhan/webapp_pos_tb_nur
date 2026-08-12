import React from 'react';
import { usePage } from '@inertiajs/react';
import PanelActions from '@/features/workspace/shared/PanelActions';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import PreferenceSideItem from './components/PreferenceSideItem';
import usePreferencesState from './hooks/usePreferencesState';
import usePreferencesSave from './hooks/usePreferencesSave';
import PreferencesSidebarContent from './PreferencesSidebarContent';

import { isOwnerUser } from '@/features/workspace/backend/adapters/generalAdapters';

export default function PreferencesView({ page }) {
    const inertiaPage = usePage();
    const authUser = inertiaPage?.props?.auth?.user ?? null;
    const isSuperAdmin = isOwnerUser(authUser);

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

    const resolvedActions = (workspace.actions ?? []).map(action => {
        if (action.id === 'save') {
            return {
                ...action,
                onClick: isSuperAdmin ? handleSave : undefined,
                loading: state.saving,
                disabled: !isSuperAdmin || state.saving || !state.isDirty,
                title: !isSuperAdmin ? 'Hanya Owner / Super Admin yang dapat mengubah preferensi' : action.label,
            };
        }
        return action;
    });

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-[4px] border border-tab-view-active-border-x bg-ui-bg-panel-lighter shadow-panel-subtle-alt">
            {!isSuperAdmin && (
                <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
                    <svg className="h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Akses Dibatasi: Halaman Pengaturan Preferensi toko hanya dapat diubah oleh Owner / Super Admin. Anda hanya dapat melihat konfigurasi aktif.</span>
                </div>
            )}

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
                    <fieldset disabled={!isSuperAdmin} className="flex min-h-0 flex-1 flex-col overflow-hidden border-0 p-0 m-0 w-full disabled:opacity-85">
                        <PreferencesSidebarContent
                            {...state}
                            workspace={workspace}
                            companyRootItem={companyRootItem}
                            sideItems={sideItems}
                            readOnly={!isSuperAdmin}
                        />
                    </fieldset>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-tab-overflow-border bg-ui-bg-panel-lighter px-4 py-4">
                <PanelActions actions={resolvedActions} />
            </div>
        </div>
    );
}
