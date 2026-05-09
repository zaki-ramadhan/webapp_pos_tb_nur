import {
    buildSalesDocumentRecord,
    mergeSalesDocumentConfigWithPage,
    sharedDetailDockActions,
} from '@/features/workspace/modules/sales-document/salesDocumentConfigCore';
import {
    defaultSalesOrderConfig,
    salesOrderDraft,
} from '@/features/workspace/modules/sales-document/salesOrderModuleConfig';

const salesQuoteTableRows = [
    { id: 'SQ.2017.02.00001', number: 'SQ.2017.02.00001', date: '09/02/2017', customer: 'Abadi Phone Center', customerShort: 'Abadi Phone Center', notes: '', status: 'Terproses', total: '1,925,000', statusTone: 'processed' },
    { id: 'SQ.2016.12.00002', number: 'SQ.2016.12.00002', date: '13/12/2016', customer: 'Cinema Phone Cellular', customerShort: 'Cinema Phone Cellular', notes: '', status: 'Terproses', total: '25,960,000', statusTone: 'processed' },
    { id: 'SQ.2016.12.00001', number: 'SQ.2016.12.00001', date: '13/12/2016', customer: 'Abadi Phone Center', customerShort: 'Abadi Phone Center', notes: '', status: 'Terproses', total: '13,750,000', statusTone: 'processed' },
];

const salesQuoteDraft = {
    ...salesOrderDraft,
    numberingType: 'Penawaran Penjualan',
};

const salesQuoteDetailRecords = {
    'SQ.2017.02.00001': {
        customer: ['[CSBY-0005] Abadi Phone Center'],
        entryDate: '09/02/2017',
        autoNumber: false,
        numberingType: 'Penawaran Penjualan',
        documentNumber: 'SQ.2017.02.00001',
        currency: 'IDR',
        itemSearch: '',
        items: [
            {
                id: 'SQ.2017.02.00001-item-1',
                name: 'Anti Gores Iphone 5',
                code: '9900012',
                quantity: '25',
                unit: 'PCS',
                price: '70,000',
                discount: '0',
                total: '1,750,000',
            },
        ],
        itemCountLabel: '1 Barang (25)',
        paymentTerms: ['C.O.D'],
        purchaseOrderNumber: '',
        address: 'Jl. Raya Pabean Sedati 79',
        branches: ['JAKARTA'],
        notes: '',
        taxEnabled: true,
        taxIncluded: false,
        shippingDate: '',
        shippingMethod: [],
        fob: [],
        costSearch: '',
        additionalCosts: [],
        summary: [
            ['Total', 'Rp 1,925,000'],
            ['Status', 'Terproses'],
        ],
        processedBy: [
            { number: 'SO.2017.02.00001', date: '10/02/2017' },
            { number: 'DO.2017.02.00001', date: '10/02/2017' },
            { number: 'SI.2017.02.00003', date: '10/02/2017' },
        ],
        approvalStamp: 'DISETUJUI',
        processStamp: '',
        showProcessButton: true,
        processDisabled: true,
        subtotal: 'Rp 1,750,000',
        discountValue: '0',
        discountPrefix: 'Rp',
        taxLabel: 'PPN 10%',
        taxValue: 'Rp 175,000',
        total: 'Rp 1,925,000',
        saveTone: 'muted',
        dockActions: sharedDetailDockActions,
    },
};

export const defaultSalesQuoteConfig = {
    ...defaultSalesOrderConfig,
    labels: {
        ...defaultSalesOrderConfig.labels,
        documentNumber: 'Nomor #',
    },
    numberingOptions: ['Penawaran Penjualan'],
    table: {
        ...defaultSalesOrderConfig.table,
        createLabel: 'Tambah Penawaran Penjualan',
        rows: salesQuoteTableRows,
        pageValue: '3',
    },
    orderInfoTitle: 'Informasi Penawaran',
    showPurchaseOrderNumber: false,
    showShippingInfo: false,
    showExtraInfo: false,
    showAddressPinButton: true,
    draft: salesQuoteDraft,
    detailRecords: salesQuoteDetailRecords,
};

export function buildSalesQuoteConfig(pageConfig = {}) {
    return mergeSalesDocumentConfigWithPage(defaultSalesQuoteConfig, pageConfig);
}

export function buildSalesQuoteRecord(row = {}) {
    return buildSalesDocumentRecord(row, salesQuoteDraft, salesQuoteDetailRecords, {
        customerPrefix: '[CSBY-0005]',
        includeAdvanceSummary: false,
        includePrintedSummary: false,
        dockActions: sharedDetailDockActions,
    });
}
