const inactiveWorkspacePageIds = new Set(['transaction-approval']);

const inactiveReportCategoryIds = new Set([]);

const inactivePreferenceChecklistItemIds = new Set([]);

const inactiveWorkspaceControlIds = new Set([
    'item-brand-field',
    'item-brand-filter',
]);

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
    'sales-deposit': 'sales-quote-order',
    'sales-return': 'sales-return',
    'price-adjustment': 'price-adjustment',
    'sales-commission': 'salesman',
    'sales-target': 'salesman',

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
    'work-order': 'simple-production',
    'material-addition': 'simple-production',
    'work-completion': 'simple-production',
};

const featureDefaults = {
    'multi-branch': false,
    'multi-currency': true,
    'tax-feature': true,
    'approval-feature': true,
    'asset-feature': true,
    'budget-feature': true,
    'department-center': true,
    'sales-quote-order': true,
    'sales-return': true,
    'price-adjustment': true,
    'salesman': true,
    'delivery-service': true,
    'payment-terms': true,
    'purchase-order': true,
    'supplier-price-list': true,
    'item-request': true,
    'multi-warehouse': true,
    'multi-unit': true,
    'simple-production': true,
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

