const inactiveWorkspacePageIds = new Set([
    'numbering',
    'print-design',
    'branch',
    'payment-terms',
    'shipping-master',
    'fob-master',
    'recurring-transactions',
    'contacts',
    'favorite-transactions',
    'calendar-master',
    'budget-monitor',
    'budget-transfer',
    'account-history',
    'smartlink-virtual-account',
    'smartlink-payment',
    'sales-quote',
    'sales-order',
    'sales-delivery',
    'customer-category',
    'sales-category',
    'sales-target',
    'smartlink-commerce',
    'purchase-deposit',
    'purchase-order',
    'goods-receipt',
    'supplier-category',
    'payment-order',
    'supplier-transfer',
    'stock-transfer',
    'stock-opname-order',
    'stock-opname-result',
    'order-fulfillment',
    'asset-location',
]);

const inactiveReportCategoryIds = new Set([]);

const inactivePreferenceChecklistItemIds = new Set([
    'invoice-swap',
]);

const inactiveWorkspaceControlIds = new Set([
    'item-brand-field',
    'item-brand-filter',
]);

export const WORKSPACE_INACTIVE_BADGE_LABEL = 'Nonaktif';
export const WORKSPACE_INACTIVE_HINT = 'Dinonaktifkan sementara';

export function isWorkspacePageInactive(pageId) {
    return inactiveWorkspacePageIds.has(String(pageId ?? ''));
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
