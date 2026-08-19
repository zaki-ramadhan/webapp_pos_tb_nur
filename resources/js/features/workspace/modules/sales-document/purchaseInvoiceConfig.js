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

export function buildPurchaseInvoiceRecord(row = {}, config = {}) {
    const record = buildSalesDocumentRecord(row, config.draft ?? defaultPurchaseInvoiceConfig.draft, config.detailRecords ?? {}, {
        customerPrefix: '[VJKT-0002]',
        includeAdvanceSummary: false,
        includePrintedSummary: false,
        dockActions: sharedDetailDockActions,
        showProcessButton: true,
        processStamp: 'BELUM\nLUNAS',
        approvalStamp: '',
        processedBy: null,
    });

    const currency = record.currency || row.currency || 'IDR';
    const currencyPrefix = currency === 'USD' ? '$' : 'Rp';
    const totalValue = row.total ? `${currencyPrefix} ${row.total}` : (record.total || `${currencyPrefix} 0`);

    const rawStatus = row.rawStatus ?? row.status ?? row.__backendRecord?.status ?? record.status ?? record.rawStatus;
    const normalizedStatus = String(rawStatus ?? '').trim().toLowerCase();
    const total = parseNumericInput(row.total ?? row.total_amount ?? record.total ?? record.total_amount);
    const paid = parseNumericInput(row.paid_amount ?? row.paidAmount ?? record.paid_amount ?? record.paidAmount);
    const outstanding = row.outstanding_amount !== undefined && row.outstanding_amount !== null
        ? parseNumericInput(row.outstanding_amount)
        : (row.outstandingAmount !== undefined && row.outstandingAmount !== null
            ? parseNumericInput(row.outstandingAmount)
            : (record.outstandingAmount !== undefined && record.outstandingAmount !== null
                ? parseNumericInput(record.outstandingAmount)
                : Math.max(0, total - paid)));

    const isLunas = normalizedStatus === 'lunas' || normalizedStatus === 'paid' || (total > 0 && outstanding <= 0.01);

    return {
        ...record,
        status: isLunas ? 'Lunas' : (paid > 0 && outstanding > 0.01 ? 'Sebagian' : 'Belum Lunas'),
        rawStatus: rawStatus ?? (isLunas ? 'Lunas' : 'Belum Lunas'),
        paidAmount: paid,
        outstandingAmount: outstanding,
        purchaseOrderNumber: row.billNumber ?? record.purchaseOrderNumber ?? '',
        summary: buildPurchaseInvoiceSummary(row, {
            ...record,
            total: totalValue,
        }),
        summaryStatusTone: isLunas ? 'success' : 'warning',
        showSecondaryHeaderAction: false,
        showProcessButton: true,
        showProcessButtonOnCreate: false,
        processDisabled: isLunas,
        processStamp: isLunas ? 'LUNAS' : 'BELUM\nLUNAS',
        processStampTone: isLunas ? 'green' : 'gray',
        subtotal: record.subtotal || totalValue,
        discountPrefix: record.discountPrefix || currencyPrefix,
        total: record.total || totalValue,
        dockActions: row.id ? sharedDetailDockActions : (record.dockActions?.length ? record.dockActions : purchaseInvoiceCreateDockActions),
    };
}
