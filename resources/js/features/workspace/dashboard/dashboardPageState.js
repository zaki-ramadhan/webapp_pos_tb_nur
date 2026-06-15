import {
    buildDefaultLevel2ContentTabs,
    buildDetailContentTab,
    getDefaultLevel2TabId,
} from '@/features/workspace/dashboard/dashboardLevel2Tabs';

const DETAIL_TAB_PAGE_IDS = [
    'group-access',
    'company-tax',
    'accounts',
    'customers',
    'suppliers',
    'currency-master',
    'payment-terms',
    'warehouse-master',
    'items-services',
    'item-unit',
    'item-category',
    'customer-category',
    'supplier-category',
    'sales-category',
    'purchase-order',
    'purchase-deposit',
    'purchase-invoice',
    'purchase-payment',
    'purchase-return',
    'goods-receipt',
    'item-request',
    'sales-commission',
    'sales-target',
    'expense-entry',
    'fixed-assets',
    'asset-change',
    'asset-category',
    'asset-tax-category',
    'asset-disposal',
    'asset-move',
    'sales-order',
    'sales-quote',
    'sales-delivery',
    'sales-invoice',
    'sales-deposit',
    'sales-receipt',
    'sales-return',
    'stock-transfer',
    'work-order',
    'material-addition',
    'stock-opname-order',
    'stock-opname-result',
    'inventory-adjustment',
    'price-adjustment',
    'general-journal',
    'cash-payment',
    'cash-receipt',
    'bank-transfer',
    'journal-activity-log',
    'department',
    'employees',
    'branch',
    'shipping-master',
    'users',
    'payroll-entry',
];

export function buildInitialLevel2TabsState(pages) {
    return Object.values(pages).reduce((items, page) => {
        const defaultTabId = getDefaultLevel2TabId(page);

        if (defaultTabId) {
            items[page.id] = defaultTabId;
        }

        return items;
    }, {});
}

export function buildInitialLevel2ContentTabsState(pages) {
    return Object.values(pages).reduce((items, page) => {
        if (page.subtab) {
            items[page.id] = buildDefaultLevel2ContentTabs(page);
        }

        return items;
    }, {});
}

export function buildTabItems(openPages, dashboardPageId) {
    return openPages.map((page) => ({
        ...page,
        closable: page.id !== dashboardPageId,
    }));
}

export function resolveActivePage(openPages, activePageId, dashboardPage) {
    return openPages.find((page) => page.id === activePageId) ?? dashboardPage;
}

export function resolveActivePageContentTabs(activePage, pageLevel2ContentTabs) {
    return pageLevel2ContentTabs[activePage.id] ?? buildDefaultLevel2ContentTabs(activePage);
}

export function resolveLevel2State(activePage, activePageContentTabs, activeLevel2Tabs) {
    const shouldShowLevel2Tabs =
        activePage.id !== 'dashboard' &&
        (activePage.subtab || (activePage.detailTabsOnly && activePageContentTabs.length));

    const level2Tabs = shouldShowLevel2Tabs
        ? [
              {
                  id: `${activePage.id}-view`,
                  kind: 'view',
                  label: `${activePage.label} View`,
                  ariaLabel: `Tampilkan mode view data ${activePage.label}`,
                  title: `View data ${activePage.label}`,
                  closable: false,
              },
              ...activePageContentTabs,
          ]
        : [];

    const activeLevel2TabId = activeLevel2Tabs[activePage.id] ?? getDefaultLevel2TabId(activePage);
    const activeLevel2Tab =
        level2Tabs.find((tab) => tab.id === activeLevel2TabId) ??
        (activePage.detailTabsOnly && !activePageContentTabs.length
            ? {
                  id: `${activePage.id}-view`,
                  kind: 'view',
              }
            : level2Tabs[0] ?? null);

    return {
        shouldShowLevel2Tabs,
        level2Tabs,
        activeLevel2TabId,
        activeLevel2Tab,
        activePageMode: activeLevel2Tab?.kind === 'content' ? 'form' : 'table',
    };
}

export function createDetailTabOpener(pages, pageId) {
    return (detail) => buildDetailContentTab(pageId, detail);
}

export function createDetailTabOpeners(pages) {
    return DETAIL_TAB_PAGE_IDS.reduce((result, pageId) => {
        if (pages[pageId]) {
            result[pageId] = createDetailTabOpener(pages, pageId);
        }

        return result;
    }, {});
}
