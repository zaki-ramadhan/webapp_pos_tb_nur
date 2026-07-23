import {
    defaultPurchasePaymentConfig,
    purchasePaymentDetailDockActions,
} from './purchasePaymentConfigData';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

function mergePurchasePaymentConfig(baseConfig, pageConfig = {}) {
    return {
        ...baseConfig,
        ...pageConfig,
        labels: {
            ...baseConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        table: {
            ...baseConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns ?? baseConfig.table.columns,
            rows: pageConfig.table?.rows ?? baseConfig.table.rows,
            filters: pageConfig.table?.filters ?? baseConfig.table.filters,
            downloadItems: pageConfig.table?.downloadItems ?? baseConfig.table.downloadItems,
            printItems: pageConfig.table?.printItems ?? baseConfig.table.printItems,
            settingsItems: pageConfig.table?.settingsItems ?? baseConfig.table.settingsItems,
        },
        invoiceTable: {
            ...baseConfig.invoiceTable,
            ...(pageConfig.invoiceTable ?? {}),
            columns: pageConfig.invoiceTable?.columns ?? baseConfig.invoiceTable.columns,
        },
        sectionTabs: pageConfig.sectionTabs ?? baseConfig.sectionTabs,
        detailSectionTabs: pageConfig.detailSectionTabs ?? baseConfig.detailSectionTabs,
        draft: {
            ...baseConfig.draft,
            ...(pageConfig.draft ?? {}),
        },
        detailRecords: {
            ...baseConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildPurchasePaymentConfig(pageConfig = {}) {
    return mergePurchasePaymentConfig(defaultPurchasePaymentConfig, pageConfig);
}

export function buildPurchasePaymentRecord(row = {}, config) {
    if (row.id && config.detailRecords?.[row.id]) {
        return config.detailRecords[row.id];
    }

    const amount = row.paymentAmount ?? '0';
    const invoices = Array.isArray(row.invoices) ? row.invoices : [];

    return {
        ...config.draft,
        payee: row.supplier ? [`[V.00001] ${row.supplier}`] : [],
        bankAccounts: row.bank ? [row.bank] : [],
        paymentAmount: amount,
        paymentAmountPrefix: 'Rp',
        paymentAmountDisplay: amount,
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? '',
        documentNumber: row.number ?? '',
        currency: row.currency ?? 'IDR',
        invoices,
        invoiceTitle: invoices.length ? `Faktur (${formatAmountInput(invoices.length)})` : 'Faktur',
        paymentMethod: row.method ?? 'Tunai',
        dueDatePph: row.checkDate ?? row.date ?? '',
        notes: row.notes ?? '',
        branches: row.branch ? [row.branch] : ['JAKARTA'],
        __branchId: row.branch === 'SURABAYA' ? 2 : (row.branch === 'JAKARTA' ? 1 : (config.draft?.__branchId ?? 1)),
        reconcileStatus: row.reconcileStatus ?? 'Belum',
        printStatus: row.printStatus ?? 'Belum cetak/email',
        paidWith: row.method ?? 'Tunai',
        paidAt: row.paidAt ?? '-',
        footerPaymentValue: `Rp ${amount}`,
        footerInvoiceValue: `Rp ${amount}`,
        showSecondaryAmountButton: false,
        dockActions: purchasePaymentDetailDockActions,
    };
}
