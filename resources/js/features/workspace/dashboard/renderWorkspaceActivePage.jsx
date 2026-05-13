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

function renderContentPage(Component, { page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    return (
        <Component
            page={page}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
        />
    );
}

function renderLevel2ContentPage(Component, { page, mode, activeLevel2Tab, onOpenContent, onCloseDetail }) {
    return (
        <Component
            page={page}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onCloseDetail={onCloseDetail}
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
        onCloseDetail,
    },
) {
    return (
        <Component
            page={page}
            mode={mode}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
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
    handleCloseDetailTab,
}) {
    const openContent = () => handleOpenDefaultContentTab(activePage.id);
    const closeDetail = (recordId) => handleCloseDetailTab(activePage.id, recordId);
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
            activeLevel2Tab,
            onOpenContent: openContent,
            onOpenDetail: detailTabOpeners[activePage.id],
            onCloseDetail: closeDetail,
        });
    }

    const level2ContentComponent = LEVEL2_CONTENT_PAGE_COMPONENTS[activePage.id];

    if (level2ContentComponent) {
        return renderLevel2ContentPage(level2ContentComponent, {
            page: activePage,
            mode: activePageMode,
            activeLevel2Tab,
            onOpenContent: openContent,
            onCloseDetail: closeDetail,
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
            onCloseDetail: closeDetail,
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
                    onCloseDetail={closeDetail}
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
                    onCloseDetail={closeDetail}
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
                    onCloseDetail={closeDetail}
                />
            );
        case 'journal-activity-log':
            return (
                <JournalActivityLogView
                    page={activePage}
                    activeLevel2Tab={activeLevel2Tab}
                    onOpenDetail={detailTabOpeners['journal-activity-log']}
                    onCloseDetail={closeDetail}
                />
            );
        default:
            return <ModulePageView page={activePage} />;
    }
}
