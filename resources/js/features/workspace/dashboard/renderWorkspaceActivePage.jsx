import { Suspense } from 'react';
import LoadingState from '@/components/ui/LoadingState';
import ModulePageView from '@/features/workspace/modules/ModulePageView';
import {
    BANK_INQUIRY_PAGE_IDS,
    BankInquiryView,
    BusinessPartnerView,
    CONTENT_PAGE_COMPONENTS,
    LEVEL2_CONTENT_PAGE_COMPONENTS,
    LEVEL2_DETAIL_PAGE_COMPONENTS,
    STATIC_PAGE_RENDERERS,
} from '@/features/workspace/dashboard/workspacePageRegistry';

function renderPage(Component, props) {
    return <Component {...props} />;
}

function renderContent({
    activePage,
    activePageMode,
    activeLevel2Tab,
    level2Tabs = [],
    detailTabOpeners,
    createDetailTabOpener,
    handleOpenDefaultContentTab,
    handleCloseDetailTab,
    closeLevel2TabNow,
}) {
    const sharedProps = {
        page: activePage,
        mode: activePageMode,
        activeLevel2Tab,
        level2Tabs,
        onOpenContent: () => handleOpenDefaultContentTab(activePage.id),
        onCloseDetail: (recordId) => handleCloseDetailTab(activePage.id, recordId),
        onCloseTab: (tabId) => closeLevel2TabNow(tabId),
    };

    const staticRenderer = STATIC_PAGE_RENDERERS[activePage.id];
    if (staticRenderer) return staticRenderer(activePage, activePageMode);

    if (BANK_INQUIRY_PAGE_IDS.has(activePage.id)) {
        return <BankInquiryView page={activePage} />;
    }

    const contentComponent = CONTENT_PAGE_COMPONENTS[activePage.id];
    if (contentComponent) {
        return renderPage(contentComponent, {
            ...sharedProps,
            onOpenDetail: detailTabOpeners[activePage.id],
        });
    }

    const level2ContentComponent = LEVEL2_CONTENT_PAGE_COMPONENTS[activePage.id];
    if (level2ContentComponent) {
        return renderPage(level2ContentComponent, sharedProps);
    }

    const level2DetailComponent = LEVEL2_DETAIL_PAGE_COMPONENTS[activePage.id];
    if (level2DetailComponent) {
        return renderPage(level2DetailComponent, {
            ...sharedProps,
            onOpenDetail: detailTabOpeners[activePage.id],
        });
    }

    switch (activePage.id) {
        case 'customers':
            return (
                <BusinessPartnerView
                    {...sharedProps}
                    onOpenDetail={detailTabOpeners.customers}
                    partnerType="customer"
                />
            );
        case 'suppliers':
            return (
                <BusinessPartnerView
                    {...sharedProps}
                    onOpenDetail={detailTabOpeners.suppliers}
                    partnerType="supplier"
                />
            );
        default:
            return <ModulePageView page={activePage} />;
    }
}

export default function renderWorkspaceActivePage(props) {
    return (
        <Suspense
            fallback={
                <div className="flex h-full min-h-[300px] w-full items-center justify-center p-6">
                    <LoadingState title="Memuat modul" description="Sedang menyiapkan tampilan..." />
                </div>
            }
        >
            {renderContent(props)}
        </Suspense>
    );
}

