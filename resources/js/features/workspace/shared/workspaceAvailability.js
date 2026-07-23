const inactiveWorkspacePageIds = new Set(['transaction-approval']);

const inactiveReportCategoryIds = new Set([
    'profit-center',
]);

const inactivePreferenceChecklistItemIds = new Set([
    'multi-branch',
    'tax-feature',
    'delivery-service',
    'payment-terms',
    'purchase-order',
    'multi-unit',
    'simple-production',
    'sales-quote-order',
    'department-center',
]);

const inactiveWorkspaceControlIds = new Set([]);

const pageToFeatureMap = {
    // Fitur dasar
    'branch': 'multi-branch',
    'currency-master': 'multi-currency',
    'company-tax': 'tax-feature',
    'transaction-approval': 'approval-feature',
    'department': 'department-center',
    
    // Seed anggaran
    'budget': 'budget-feature',
    'budget-monitor': 'budget-feature',
    'budget-transfer': 'budget-feature',

    // Penjualan
    'sales-quote': 'sales-quote-order',
    'sales-order': 'sales-quote-order',
    'sales-delivery': 'sales-quote-order',
    'sales-return': 'sales-return',
    'price-adjustment': 'price-adjustment',
    'sales-commission': 'salesman',
    'sales-target': 'sales-target',

    // Pembelian
    'purchase-order': 'purchase-order',
    'goods-receipt': 'purchase-order',
    'purchase-deposit': 'purchase-order',
    'supplier-price': 'supplier-price-list',

    // Pengiriman
    'shipping-master': 'delivery-service',
    'fob-master': 'delivery-service',
    'payment-terms': 'payment-terms',

    // Persediaan
    'item-request': 'item-request',
    'stock-transfer': 'multi-warehouse',
    'warehouse-master': 'multi-warehouse',
    'item-location': 'multi-warehouse',
    'work-order': 'simple-production',
    'material-addition': 'simple-production',
    'work-completion': 'simple-production',
};

const featureDefaults = {
    'multi-branch': false,
    'multi-currency': true,
    'tax-feature': false,
    'approval-feature': false,
    'asset-feature': false,
    'budget-feature': false,
    'department-center': false,
    'sales-quote-order': false,
    'sales-return': true,
    'price-adjustment': true,
    'salesman': true,
    'sales-target': true,
    'delivery-service': false,
    'payment-terms': false,
    'purchase-order': false,
    'supplier-price-list': true,
    'item-request': true,
    'multi-warehouse': true,
    'multi-unit': false,
    'simple-production': false,
};

export const WORKSPACE_INACTIVE_BADGE_LABEL = 'Nonaktif';
export const WORKSPACE_INACTIVE_HINT = 'Dinonaktifkan sementara';

export function isWorkspacePageInactive(pageId, preferences = {}) {
    const normalizedPageId = String(pageId ?? '');
    
    const featureKey = pageToFeatureMap[normalizedPageId];
    if (featureKey !== undefined) {
        let value = preferences[featureKey];
        if (value === undefined) {
            value = featureDefaults[featureKey];
        }
        
        if (value === false || value === 0 || value === 'false' || value === '0') {
            return true;
        }
        return false;
    }

    return inactiveWorkspacePageIds.has(normalizedPageId);
}

export function isReportCategoryInactive(categoryId) {
    return inactiveReportCategoryIds.has(String(categoryId ?? ''));
}

export function isPreferenceChecklistItemInactive(itemId) {
    return inactivePreferenceChecklistItemIds.has(String(itemId ?? ''));
}

export function isWorkspaceControlInactive(controlId) {
    return inactiveWorkspaceControlIds.has(String(controlId ?? ''));
}

export {
    inactivePreferenceChecklistItemIds,
    inactiveReportCategoryIds,
    inactiveWorkspaceControlIds,
    inactiveWorkspacePageIds,
};

