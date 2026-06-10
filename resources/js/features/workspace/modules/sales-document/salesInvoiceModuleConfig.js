import {
    createAttachmentDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';
import {
    buildSalesDocumentRecord,
    mergeSalesDocumentConfigWithPage,
    sharedDetailDockActions,
} from '@/features/workspace/modules/sales-document/salesDocumentConfigCore';
import {
    defaultSalesOrderConfig,
    salesInvoiceAdvanceColumns,
    salesInvoiceListColumns,
    salesInvoiceSectionTabs,
    salesOrderDraft,
} from '@/features/workspace/modules/sales-document/salesOrderModuleConfig';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const salesInvoiceTableRows = [];

const salesInvoiceDraft = {
    ...salesOrderDraft,
    numberingType: 'Faktur Penjualan',
    paymentTerms: [],
    shippingDate: todayDisplayDate,
    preInvoice: false,
    contacts: [],
    taxInvoiceDate: '',
    taxTransactionType: 'Faktur Pajak',
    taxDetailTransaction: '01 - Bukan Pemungut PPN (legacy)',
    taxPayerMode: 'Auto',
    taxPayerNumber: '',
    taxPayerName: '',
    taxIdTku: '',
    taxInvoiceNumber: '',
    advancePaymentSearch: '',
    advancePayments: [],
    dockActions: [
        createSaveDockAction(),
        createDocumentDockAction(),
        createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
        createMoreDockAction({ itemId: 'smartlink', itemLabel: 'Kelola e-payment' }),
    ],
};

const salesInvoiceDetailRecords = {};

export const defaultSalesInvoiceConfig = {
    ...defaultSalesOrderConfig,
    labels: {
        ...defaultSalesOrderConfig.labels,
        customer: 'Pelanggan',
        documentNumber: 'No Faktur #',
        preInvoice: 'Faktur Dimuka',
        contact: 'Kontak',
    },
    numberingOptions: ['Faktur Penjualan'],
    table: {
        ...defaultSalesOrderConfig.table,
        createLabel: 'Tambah Faktur Penjualan',
        rows: salesInvoiceTableRows,
        pageValue: '54',
        columns: salesInvoiceListColumns,
        filters: [
            { id: 'date', rowKey: 'date', options: [{ value: 'all', label: 'Tanggal: Semua' }, { value: '10/02/2017', label: 'Tanggal: 10/02/2017' }] },
            { id: 'customer', rowKey: 'customer', options: [{ value: 'all', label: 'Pelanggan: Semua' }, { value: 'Abadi Phone Center', label: 'Pelanggan: Abadi Phone Center' }] },
            { id: 'status', rowKey: 'status', options: [{ value: 'all', label: 'Status: Semua' }, { value: 'Belum Lunas', label: 'Status: Belum Lunas' }, { value: 'Lunas', label: 'Status: Lunas' }] },
            { id: 'printed', rowKey: 'printedStatus', options: [{ value: 'all', label: 'Sudah dicetak: Semua' }, { value: 'all', label: 'Sudah dicetak: Semua' }] },
        ],
        printItems: [{ id: 'print-list', label: 'Cetak daftar faktur' }],
    },
    sectionTabs: salesInvoiceSectionTabs,
    additionalInfoTitle: 'Info lainnya',
    advancePaymentTitle: 'Uang Muka',
    advancePaymentSearchPlaceholder: 'Cari/Pilih...',
    advancePaymentTable: {
        columns: salesInvoiceAdvanceColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[760px]',
    },
    orderInfoTitle: 'Informasi Faktur',
    processedByTitle: 'Uang Muka Terpakai/Retur',
    processedByEmptyLabel: 'Belum ada data.',
    showSummarySecondarySection: false,
    showPreInvoiceOption: true,
    showContactField: true,
    showAddressPinButton: true,
    taxInfoMode: 'invoice',
    itemModal: {
        enabled: true,
    },
    draft: salesInvoiceDraft,
    detailRecords: salesInvoiceDetailRecords,
};

export function buildSalesInvoiceConfig(pageConfig = {}) {
    return mergeSalesDocumentConfigWithPage(defaultSalesInvoiceConfig, pageConfig);
}

export function buildSalesInvoiceRecord(row = {}) {
    return buildSalesDocumentRecord(row, salesInvoiceDraft, salesInvoiceDetailRecords, {
        customerPrefix: '[CSBY-0005]',
        includeAdvanceSummary: false,
        includePrintedSummary: true,
        dockActions: sharedDetailDockActions,
        approvalStamp: 'DISETUJUI',
        processStamp: 'BELUM\nLUNAS',
        taxLabel: 'PPN 10%',
        taxValue: 'Rp 0',
    });
}
