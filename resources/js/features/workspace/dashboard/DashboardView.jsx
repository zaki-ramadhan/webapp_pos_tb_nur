import { forwardRef, useImperativeHandle, useMemo } from 'react';

import Button from '@/components/ui/Button';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
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
                        isLoading={!widgets && !dashboard?.widgets}
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
                <WorkspaceDialog
                    open={Boolean(pendingCloseRequest)}
                    onClose={() => setPendingCloseRequest(null)}
                    title="Tutup Halaman?"
                    closeLabel="Tutup dialog konfirmasi"
                    maxWidthClassName="max-w-[440px]"
                    footer={
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" size="md" onClick={() => setPendingCloseRequest(null)}>
                                Batal
                            </Button>
                            <Button variant="danger" size="md" onClick={handleConfirmPendingClose}>
                                Tutup Halaman
                            </Button>
                        </div>
                    }
                >
                    <p className="text-sm text-slate-600">
                        Ada perubahan yang belum disimpan di halaman ini. Apakah Anda yakin ingin menutupnya?
                    </p>
                </WorkspaceDialog>
            )}
        </WorkspaceDraftStateProvider>
    );
});

export default DashboardView;
