import BusinessPartnerView from '@/features/workspace/modules/BusinessPartnerView';
import JournalActivityLogView from '@/features/workspace/modules/JournalActivityLogView';
import ModulePageView from '@/features/workspace/modules/ModulePageView';
import WorkCompletionView from '@/features/workspace/modules/WorkCompletionView';
import {
    BANK_INQUIRY_PAGE_IDS,
    BankInquiryView,
    CONTENT_PAGE_COMPONENTS,
    LEVEL2_CONTENT_PAGE_COMPONENTS,
    LEVEL2_DETAIL_PAGE_COMPONENTS,
    STATIC_PAGE_RENDERERS,
} from '@/features/workspace/dashboard/workspacePageRegistry';

function renderContentPage(Component, { page, mode, onOpenContent }) {
    return <Component page={page} mode={mode} onOpenContent={onOpenContent} />;
}

function renderLevel2ContentPage(Component, { page, mode, activeLevel2Tab, onOpenContent }) {
    return (
        <Component
            page={page}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
        />
    );
}

function renderLevel2DetailPage(
    Component,
    {
        page,
        mode,
        activeLevel2Tab,
        onOpenContent,
        onOpenDetail,
    },
) {
    return (
        <Component
            page={page}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    );
}

export default function renderWorkspaceActivePage({
    activePage,
    activePageMode,
    activeLevel2Tab,
    detailTabOpeners,
    createDetailTabOpener,
    handleOpenDefaultContentTab,
}) {
    const openContent = () => handleOpenDefaultContentTab(activePage.id);
    const staticRenderer = STATIC_PAGE_RENDERERS[activePage.id];

    if (staticRenderer) {
        return staticRenderer(activePage, activePageMode);
    }

    if (BANK_INQUIRY_PAGE_IDS.has(activePage.id)) {
        return <BankInquiryView page={activePage} />;
    }

    const contentComponent = CONTENT_PAGE_COMPONENTS[activePage.id];

    if (contentComponent) {
        return renderContentPage(contentComponent, {
            page: activePage,
            mode: activePageMode,
            onOpenContent: openContent,
        });
    }

    const level2ContentComponent = LEVEL2_CONTENT_PAGE_COMPONENTS[activePage.id];

    if (level2ContentComponent) {
        return renderLevel2ContentPage(level2ContentComponent, {
            page: activePage,
            mode: activePageMode,
            activeLevel2Tab,
            onOpenContent: openContent,
        });
    }

    const level2DetailComponent = LEVEL2_DETAIL_PAGE_COMPONENTS[activePage.id];

    if (level2DetailComponent) {
        return renderLevel2DetailPage(level2DetailComponent, {
            page: activePage,
            mode: activePageMode,
            activeLevel2Tab,
            onOpenContent: openContent,
            onOpenDetail: detailTabOpeners[activePage.id],
        });
    }

    switch (activePage.id) {
        case 'customers':
            return (
                <BusinessPartnerView
                    page={activePage}
                    mode={activePageMode}
                    activeLevel2Tab={activeLevel2Tab}
                    onOpenContent={openContent}
                    onOpenDetail={detailTabOpeners.customers}
                    partnerType="customer"
                />
            );
        case 'suppliers':
            return (
                <BusinessPartnerView
                    page={activePage}
                    mode={activePageMode}
                    activeLevel2Tab={activeLevel2Tab}
                    onOpenContent={openContent}
                    onOpenDetail={detailTabOpeners.suppliers}
                    partnerType="supplier"
                />
            );
        case 'work-completion':
            return (
                <WorkCompletionView
                    page={activePage}
                    mode={activePageMode}
                    activeLevel2Tab={activeLevel2Tab}
                    onOpenContent={openContent}
                    onOpenDetail={createDetailTabOpener('work-completion')}
                />
            );
        case 'journal-activity-log':
            return (
                <JournalActivityLogView
                    page={activePage}
                    activeLevel2Tab={activeLevel2Tab}
                    onOpenDetail={detailTabOpeners['journal-activity-log']}
                />
            );
        default:
            return <ModulePageView page={activePage} />;
    }
}
