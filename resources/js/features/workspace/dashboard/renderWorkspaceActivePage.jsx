import BusinessPartnerView from '@/features/workspace/modules/business-partner/BusinessPartnerView';
import ModulePageView from '@/features/workspace/modules/ModulePageView';
import WorkCompletionView from '@/features/workspace/modules/inventory-fulfillment/WorkCompletionView';
import {
    BANK_INQUIRY_PAGE_IDS,
    BankInquiryView,
    CONTENT_PAGE_COMPONENTS,
    LEVEL2_CONTENT_PAGE_COMPONENTS,
    LEVEL2_DETAIL_PAGE_COMPONENTS,
    STATIC_PAGE_RENDERERS,
} from '@/features/workspace/dashboard/workspacePageRegistry';

/**
 * Render komponen halaman workspace.
 */
function renderPage(Component, props) {
    return <Component {...props} />;
}

export default function renderWorkspaceActivePage({
    activePage,
    activePageMode,
    activeLevel2Tab,
    detailTabOpeners,
    createDetailTabOpener,
    handleOpenDefaultContentTab,
    handleCloseDetailTab,
}) {
    const sharedProps = {
        page: activePage,
        mode: activePageMode,
        activeLevel2Tab,
        onOpenContent: () => handleOpenDefaultContentTab(activePage.id),
        onCloseDetail: (recordId) => handleCloseDetailTab(activePage.id, recordId),
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
        case 'work-completion':
            return (
                <WorkCompletionView
                    {...sharedProps}
                    onOpenDetail={createDetailTabOpener('work-completion')}
                />
            );
        default:
            return <ModulePageView page={activePage} />;
    }
}
