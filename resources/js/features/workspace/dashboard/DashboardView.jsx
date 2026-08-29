import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo } from 'react';

import SystemErrorModal from '@/components/ui/SystemErrorModal';
import DashboardActivePageContent from '@/features/workspace/dashboard/DashboardActivePageContent';
import DashboardSidebar from '@/features/workspace/dashboard/DashboardSidebar';
import { WorkspaceDraftStateProvider } from '@/features/workspace/dashboard/WorkspaceDraftState';
import DashboardPageTabs from '@/features/workspace/dashboard/DashboardPageTabs';

import { resolveLevel2State, resolveActivePageContentTabs } from '@/features/workspace/dashboard/dashboardPageState';
import useWorkspacePageState from './hooks/useWorkspacePageState';

const DashboardView = forwardRef(function DashboardView(
    {
        dashboard,
        widgets,
        topbarHeight = 0,
        mobileWorkspaceMenuOpen = false,
        onCloseMobileWorkspaceMenu,
    },
    ref,
) {
    const {
        activePanelId,
        setActivePanelId,
        openPages,
        activePageId,
        setActivePageId,
        pendingCloseRequest,
        setPendingCloseRequest,
        handleTogglePanel,
        openPageById,
        handleSelectPanelItem,
        activePage,
        isDashboardPageActive,
        activeLevel2TabId,
        activeLevel2Tab,
        draftStateValue,
        tabItems,
        decoratedLevel2Tabs,
        requestClosePage,
        closeAllPagesExceptDashboard,
        handleOpenDefaultContentTab,
        detailTabOpeners,
        createDetailTabOpener,
        handleSelectLevel2Tab,
        requestCloseLevel2Tab,
        handleCloseDetailTab,
        closeLevel2TabNow,
        handleConfirmPendingClose,
        activeLevel2Tabs,
        pageLevel2ContentTabs,
    } = useWorkspacePageState({
        dashboard,
        onCloseMobileWorkspaceMenu,
    });

    useImperativeHandle(ref, () => ({
        openPage: openPageById,
    }));

    const renderedPages = useMemo(() => {
        return openPages.map((page) => {
            const pageContentTabs = resolveActivePageContentTabs(page, pageLevel2ContentTabs);
            const {
                level2Tabs: pageLevel2Tabs,
                activeLevel2Tab,
                activePageMode: pageMode,
            } = resolveLevel2State(page, pageContentTabs, activeLevel2Tabs);

            return {
                page,
                mode: pageMode,
                activeLevel2Tab,
                level2Tabs: pageLevel2Tabs,
            };
        });
    }, [openPages, pageLevel2ContentTabs, activeLevel2Tabs]);

    const handleRefreshWidget = useCallback(async (widget) => {
        try {
            const response = await fetch(`/api/workspace/dashboard/widget-data?widget_id=${encodeURIComponent(widget.id)}&force_refresh=1`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data?.widget) {
                    window.dispatchEvent(new CustomEvent('pos:update-single-widget', {
                        detail: { widgetId: widget.id, widget: data.widget }
                    }));
                }
            }
        } catch (e) {
            console.error('Failed to refresh widget:', e);
        }
    }, []);

    useEffect(() => {
        if (isDashboardPageActive) {
            fetch('/api/workspace/dashboard/widgets-data?force_refresh=1', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (Array.isArray(data?.widgets) && data.widgets.length > 0) {
                    window.dispatchEvent(new CustomEvent('pos:update-dashboard-widgets', {
                        detail: { widgets: data.widgets }
                    }));
                }
            })
            .catch(() => {});
        }
    }, [isDashboardPageActive]);

    return (
        <WorkspaceDraftStateProvider value={draftStateValue}>
            <section className="flex h-full min-w-0 flex-1 flex-col lg:flex-row lg:items-stretch">
                <div className="min-h-0 shrink-0 self-stretch lg:w-[58px]">
                    <DashboardSidebar
                        sidebar={dashboard.sidebar}
                        activePanelId={activePanelId}
                        onTogglePanel={handleTogglePanel}
                        onClosePanel={() => setActivePanelId(null)}
                        onSelectPanelItem={handleSelectPanelItem}
                        desktopTopOffset={topbarHeight}
                        mobileMenuOpen={mobileWorkspaceMenuOpen}
                        onCloseMobileMenu={onCloseMobileWorkspaceMenu}
                        preferences={dashboard.preferences}
                        user={dashboard.user}
                    />
                </div>

                <div
                    className="flex min-h-0 min-w-0 flex-1 flex-col border border-tab-overflow-panel-border border-t-0 bg-white/96 overflow-hidden lg:border-l-0 lg:border-t"
                >
                    <DashboardPageTabs
                        tabs={tabItems}
                        activePage={activePage}
                        onSelectPage={setActivePageId}
                        onClosePage={requestClosePage}
                        onCloseAllPages={closeAllPagesExceptDashboard}
                        level2Tabs={decoratedLevel2Tabs}
                        activeLevel2TabId={activeLevel2TabId}
                        onSelectLevel2Tab={handleSelectLevel2Tab}
                        onCloseLevel2Tab={requestCloseLevel2Tab}
                    />

                    <DashboardActivePageContent
                        dashboard={dashboard}
                        widgets={widgets ?? dashboard?.widgets}
                        isLoading={false}
                        handleRefreshWidget={handleRefreshWidget}
                        renderedPages={renderedPages}
                        activePageId={activePageId}
                        detailTabOpeners={detailTabOpeners}
                        createDetailTabOpener={createDetailTabOpener}
                        handleOpenDefaultContentTab={handleOpenDefaultContentTab}
                        handleCloseDetailTab={handleCloseDetailTab}
                        closeLevel2TabNow={closeLevel2TabNow}
                        isDashboardPageActive={isDashboardPageActive}
                    />
                </div>
            </section>

            {Boolean(pendingCloseRequest) && (
                <SystemErrorModal
                    open={Boolean(pendingCloseRequest)}
                    onClose={() => setPendingCloseRequest(null)}
                    onConfirm={handleConfirmPendingClose}
                    onCancel={() => setPendingCloseRequest(null)}
                    title="Konfirmasi"
                    description=""
                    message="Perubahan yang Anda lakukan akan dibatalkan, lanjutkan?"
                    confirmLabel="Ya"
                    cancelLabel="Batal"
                    showCloseButton={false}
                    maxWidthClassName="max-w-[460px]"
                />
            )}
        </WorkspaceDraftStateProvider>
    );
});

export default DashboardView;
