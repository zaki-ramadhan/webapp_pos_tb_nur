import {
    buildSalesDocumentRecord,
    mergeSalesDocumentConfigWithPage,
    sharedDetailDockActions,
} from '@/features/workspace/modules/sales-document/salesDocumentConfigCore';

import {
    defaultPurchaseInvoiceConfig,
    purchaseInvoiceCreateDockActions,
    purchaseInvoiceSectionTabs,
} from './purchaseInvoiceConfigData';

function ensurePurchaseInvoiceSectionTabs(sectionTabs = []) {
    const normalizedTabs = Array.isArray(sectionTabs) ? [...sectionTabs] : [];

    for (const requiredTab of purchaseInvoiceSectionTabs) {
        if (!normalizedTabs.some((tab) => tab.id === requiredTab.id)) {
            normalizedTabs.push(requiredTab);
        }
    }

    return normalizedTabs;
}

function buildPurchaseInvoiceSummary(row = {}, record = {}) {
    if (record.summary?.length) {
        return record.summary;
    }

    const totalValue = record.total || `$ ${row.total ?? '0'}`;

    return [
        ['Total', totalValue],
        ['Uang Muka', '$ 0'],
        ['Pembayaran', '$ 0'],
        ['Retur', '$ 0'],
        ['Utang', totalValue],
        ['Utang Pajak', 'Rp 0'],
        ['Status', row.status ?? 'Belum Lunas'],
        ['Dicetak/email', 'Belum cetak/email'],
    ];
}

export function buildPurchaseInvoiceConfig(pageConfig = {}) {
    const config = mergeSalesDocumentConfigWithPage(defaultPurchaseInvoiceConfig, pageConfig);

    return {
        ...config,
        sectionTabs: ensurePurchaseInvoiceSectionTabs(config.sectionTabs),
    };
}

export function buildPurchaseInvoiceRecord(row = {}, config) {
    const record = buildSalesDocumentRecord(row, config.draft, config.detailRecords, {
        customerPrefix: '[VJKT-0002]',
        includeAdvanceSummary: false,
        includePrintedSummary: false,
        dockActions: sharedDetailDockActions,
        showProcessButton: true,
        processStamp: 'BELUM\nLUNAS',
        approvalStamp: '',
        processedBy: null,
    });

    const currency = record.currency || row.currency || 'USD';
    const currencyPrefix = currency === 'USD' ? '$' : 'Rp';
    const totalValue = row.total ? `${currencyPrefix} ${row.total}` : (record.total || `${currencyPrefix} 0`);

    return {
        ...record,
        purchaseOrderNumber: row.billNumber ?? record.purchaseOrderNumber ?? '',
        summary: buildPurchaseInvoiceSummary(row, {
            ...record,
            total: totalValue,
        }),
        summaryStatusTone: record.summaryStatusTone ?? 'warning',
        showSecondaryHeaderAction: false,
        showProcessButton: true,
        showProcessButtonOnCreate: false,
        processDisabled: row.status === 'Lunas',
        processStamp: row.status === 'Lunas' ? 'LUNAS' : (record.processStamp || 'BELUM\nLUNAS'),
        processStampTone: row.status === 'Lunas' ? 'green' : (record.processStampTone ?? 'gray'),
        subtotal: record.subtotal || totalValue,
        discountPrefix: record.discountPrefix || currencyPrefix,
        total: record.total || totalValue,
        dockActions: row.id ? sharedDetailDockActions : (record.dockActions?.length ? record.dockActions : purchaseInvoiceCreateDockActions),
    };
}
