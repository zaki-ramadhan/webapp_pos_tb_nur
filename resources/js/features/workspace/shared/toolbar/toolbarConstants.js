import React from 'react';

export const SIZE_STYLES = {
    compact: {
        createButton: 'h-[40px] min-w-[60px] px-3',
        utilityButton: 'h-[40px] w-[40px]',
        menuButton: 'h-[40px] min-w-[48px] px-2',
        searchInput: 'h-[40px]',
        pageInput: 'h-[40px] w-[68px] sm:w-[74px]',
        createIcon: 'h-5 w-5',
        searchIcon: 'h-5 w-5',
        searchText: 'text-sm',
    },
    default: {
        createButton: 'h-[40px] min-w-[72px] px-3.5',
        utilityButton: 'h-[40px] w-[50px]',
        menuButton: 'h-[40px] min-w-[50px] px-2',
        searchInput: 'h-[40px]',
        pageInput: 'h-[40px] w-[70px] sm:w-[76px]',
        createIcon: 'h-7 w-7',
        searchIcon: 'h-6 w-6',
        searchText: 'text-sm',
    },
};

export const PAGE_ID_TO_RESOURCE_MAP = {
    'currency-master': 'currencies',
    'warehouse-master': 'warehouses',
    'items-services': 'products',
    'item-unit': 'units',
    'item-brand': 'brands',
    'item-category': 'product-categories',
    'customer-category': 'customer-categories',
    'supplier-category': 'supplier-categories',
    'sales-category': 'sales-categories',
    'company-tax': 'taxes',
    'group-access': 'access-groups',
    'branch': 'branches',
    'department': 'departments',
    'shipping-master': 'shipping-methods',
    'supplier-price': 'supplier-prices',
    'numbering': 'numbering-sequences',
    'activity-log': 'activity-logs',
    'asset-change': 'asset-changes',
    'asset-disposal': 'asset-disposals',
    'bank-transfer': 'bank-transfers',
    'budget': 'budgets',
    'budget-transfer': 'budget-transfers',
    'cash-payment': 'cash-payments',
    'cash-receipt': 'cash-receipts',
    'expense-entry': 'expense-entries',
    'general-journal': 'general-journals',
    'item-request': 'item-requests',
    'material-addition': 'material-additions',
    'payroll-entry': 'payroll-entries',
    'period-end': 'period-ends',
    'purchase-payment': 'purchase-payments',
    'salary-allowance': 'salary-allowances',
    'sales-checkin': 'sales-checkins',
    'sales-commission': 'sales-commissions',
    'sales-deposit': 'sales-deposits',
    'sales-receipt': 'sales-receipts',
    'sales-target': 'sales-targets',
    'shipping': 'shipping-methods',
    'stock-transfer': 'stock-transfers',
    'fob-master': 'fob-terms',
    'bank-statement': 'bank-statements',
    'bank-history': 'bank-histories',
    'bank-reconciliation': 'bank-reconciliations',
    'journal-activity-log': 'journal-activity-logs',
    'sales-quote': 'sales-quotes',
    'sales-order': 'sales-orders',
    'sales-delivery': 'sales-deliveries',
    'sales-invoice': 'sales-invoices',
    'sales-return': 'sales-returns',
    'inventory-adjustment': 'inventory-adjustments',
    'price-adjustment': 'price-adjustments',
    'purchase-order': 'purchase-orders',
    'purchase-invoice': 'purchase-invoices',
    'purchase-return': 'purchase-returns',
    'goods-receipt': 'goods-receipts',
    'item-location': 'item-locations',
    'minimum-stock': 'minimum-stocks',
    'delivery-order': 'delivery-orders',
    'report-list': 'report-lists',
};

export function mapImportRow(row, columns) {
    const mapped = {};
    const rowKeys = Object.keys(row);

    columns.forEach(col => {
        if (!col.id || col.kind === 'spacer' || col.id === 'actions') return;

        const normalizedLabel = String(col.label || '').toLowerCase().trim();
        const normalizedId = String(col.id).toLowerCase().trim();

        const matchedKey = rowKeys.find(k => {
            const normalizedKey = k.toLowerCase().trim();
            return normalizedKey === normalizedLabel || 
                   normalizedKey === normalizedId ||
                   normalizedKey.replace(/[^a-z0-9]/g, '') === normalizedId.replace(/[^a-z0-9]/g, '');
        });

        if (matchedKey !== undefined) {
            mapped[col.id] = row[matchedKey];
        } else {
            const aliasMap = {
                code: ['kode', 'no', 'nomor', 'employee_code', 'number'],
                name: ['nama', 'nama lengkap', 'description', 'full_name'],
                description: ['keterangan', 'deskripsi', 'catatan'],
                notes: ['keterangan', 'deskripsi', 'catatan'],
                rate: ['rate', 'persentase', 'persen', 'nilai'],
                percentage: ['rate', 'persentase', 'persen', 'nilai'],
            };
            const aliases = aliasMap[col.id] || [];
            const matchedAliasKey = rowKeys.find(k => {
                const normalizedKey = k.toLowerCase().trim();
                return aliases.includes(normalizedKey);
            });
            if (matchedAliasKey !== undefined) {
                mapped[col.id] = row[matchedAliasKey];
            }
        }
    });

    return mapped;
}

export function cleanRightControls(controls) {
    if (!controls) return null;

    const flatten = (nodes) => {
        let result = [];
        React.Children.forEach(nodes, (node) => {
            if (!node) return;
            if (node.type === React.Fragment) {
                result = result.concat(flatten(node.props.children));
            } else {
                result.push(node);
            }
        });
        return result;
    };

    const controlsArray = flatten(controls);

    const isDummyAction = (element) => {
        if (!React.isValidElement(element)) return false;

        const props = element.props || {};
        const key = String(element.key || '').toLowerCase();
        const icon = String(props.icon || '').toLowerCase();
        const id = String(props.id || props.action?.id || '').toLowerCase();
        const label = String(props.label || props.action?.label || '').toLowerCase();

        const dummyKeys = ['download', 'print', 'settings', 'cog', 'columns'];
        const dummyIcons = ['download', 'print', 'settings', 'cog', 'columns'];
        const dummyIds = [
            'download',
            'print',
            'settings',
            'cog',
            'columns',
            'arrange-columns',
            'download-excel',
            'share-link',
        ];
        const dummyLabels = [
            'unduh',
            'cetak',
            'pengaturan',
            'download',
            'print',
            'settings',
            'cog',
            'kolom',
            'tampilan',
        ];

        return (
            dummyKeys.some(dk => key.includes(dk)) ||
            dummyIcons.some(di => icon.includes(di)) ||
            dummyIds.some(di => id === di || id.includes(di)) ||
            dummyLabels.some(dl => label.includes(dl))
        );
    };

    const cleaned = controlsArray.filter(child => !isDummyAction(child));
    return cleaned.length > 0 ? cleaned : null;
}

export function hasFunnelButton(node) {
    if (!node) return false;
    if (React.isValidElement(node)) {
        const type = node.type;
        const typeName = typeof type === 'function' ? (type.name || type.displayName || '') : (typeof type === 'string' ? type : '');
        const ariaLabel = String(node.props?.['aria-label'] || '').toLowerCase();
        
        if (
            typeName === 'FunnelIcon' ||
            typeName.toLowerCase().includes('filter') ||
            ariaLabel.includes('filter') ||
            node.props?.icon?.type?.name === 'FunnelIcon'
        ) {
            return true;
        }
        if (node.props?.children) {
            return React.Children.toArray(node.props.children).some(child => hasFunnelButton(child));
        }
    }
    if (Array.isArray(node)) {
        return node.some(child => hasFunnelButton(child));
    }
    return false;
}
