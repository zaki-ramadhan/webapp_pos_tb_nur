export const PAGE_LEVEL2_ACTION_KEYS = [
    'generalJournal',
    'cashPayment',
    'cashReceipt',
    'bankTransfer',
    'expenseEntry',
    'fixedAssets',
    'assetChange',
    'assetCategory',
    'assetTaxCategory',
    'assetDisposal',
    'assetMove',
    'salesOrder',
    'salesQuote',
    'salesDelivery',
    'salesInvoice',
    'salesDeposit',
    'salesReceipt',
    'salesReturn',
    'stockTransfer',
    'workOrder',
    'materialAddition',
    'stockOpnameOrder',
    'stockOpnameResult',
    'inventoryAdjustment',
    'priceAdjustment',
    'purchaseOrder',
    'purchaseDeposit',
    'purchaseInvoice',
    'purchasePayment',
    'purchaseReturn',
    'goodsReceipt',
    'itemRequest',
    'workCompletion',
    'supplierPrice',
    'supplierCategory',
    'customers',
    'suppliers',
    'reportList',
    'paymentOrder',
    'salesCommission',
    'salesTarget',
    'payrollEntry',
    'warehouse',
    'itemsServices',
    'accounts',
    'itemCategory',
    'itemLocation',
    'itemUnit',
    'supplierTransfer',
    'assetLocation',
];

export function buildDefaultLevel2ContentTabs(page) {
    if (!page?.subtab) {
        return [];
    }

    return [
        {
            id: page.subtab.id,
            kind: 'content',
            label: page.subtab.label,
            closable: true,
            tabType: 'create',
        },
    ];
}

export function getDefaultLevel2TabId(page) {
    if (page?.subtab?.id || page?.detailTabsOnly) {
        return `${page.id}-view`;
    }

    return null;
}

export function resolvePageLevel2Actions(page) {
    for (const key of PAGE_LEVEL2_ACTION_KEYS) {
        if (page?.[key]?.topActions?.length) {
            return page[key].topActions;
        }
    }

    return [];
}

export function buildDetailContentTab(pageId, detail) {
    return {
        id: `${pageId}-detail-${detail.recordId}`,
        kind: 'content',
        label: detail.tabLabel ?? detail.label,
        title: detail.label,
        closable: true,
        tabType: 'detail',
        recordId: detail.recordId,
    };
}
