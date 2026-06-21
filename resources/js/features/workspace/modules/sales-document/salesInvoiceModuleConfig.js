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
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const salesOrderTopActions = [
    {
        id: 'settings',
        label: 'Pengaturan',
        icon: 'settings',
        tone: 'outline',
    },
    {
        id: 'tips',
        label: 'Petunjuk',
        icon: 'idea',
        tone: 'warning',
    },
];

const salesOrderSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'additional-costs', label: 'Biaya Lainnya', icon: 'payment' },
    { id: 'order-info', label: 'Informasi Pesanan', icon: 'receipt' },
];

export const salesInvoiceSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'additional-costs', label: 'Biaya Lainnya', icon: 'payment' },
    { id: 'smartlink', label: 'SmartLink', icon: 'smartlink' },
    { id: 'advance-payments', label: 'Uang Muka', icon: 'payment' },
    { id: 'order-info', label: 'Informasi Faktur', icon: 'receipt' },
];

const salesOrderListColumns = [
    { id: 'statusIcon', label: '#', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'customerShort', label: 'Pelanggan', widthClassName: 'w-[180px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[52%]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[170px]', align: 'left' },
    { id: 'total', label: 'Total', widthClassName: 'w-[150px]', align: 'right' },
];

const salesOrderItemColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[54%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[115px]', align: 'center' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[92px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[84px]', align: 'center' },
    { id: 'price', label: '@Harga', widthClassName: 'w-[118px]', align: 'right' },
    { id: 'discount', label: 'Diskon', widthClassName: 'w-[82px]', align: 'right' },
    { id: 'total', label: 'Total Harga', widthClassName: 'w-[126px]', align: 'right' },
];

const salesOrderCostColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Biaya', widthClassName: 'w-[70%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[130px]', align: 'center' },
    { id: 'amount', label: 'Jumlah', widthClassName: 'w-[150px]', align: 'right' },
];

export const salesInvoiceAdvanceColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'number', label: 'No Faktur #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'amount', label: 'Uang Muka', widthClassName: 'w-[180px]', align: 'right' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[58%]', align: 'left' },
];

export const salesInvoiceListColumns = [
    { id: 'statusIcon', label: '#', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[190px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'customerShort', label: 'Pelanggan', widthClassName: 'w-[190px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[48%]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'requiredIdType', label: 'Tipe ID Waj...', widthClassName: 'w-[100px]', align: 'left' },
    { id: 'age', label: 'Umur (hr)', widthClassName: 'w-[100px]', align: 'right' },
    { id: 'total', label: 'Total', widthClassName: 'w-[160px]', align: 'right' },
];

const salesOrderDraft = {
    customer: [],
    entryDate: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Pesanan Penjualan',
    documentNumber: '',
    currency: '',
    itemSearch: '',
    items: [],
    itemCountLabel: 'Rincian Barang',
    purchaseOrderNumber: '',
    address: '',
    notes: '',
    taxEnabled: false,
    taxIncluded: false,
    shippingDate: todayDisplayDate,
    costSearch: '',
    additionalCosts: [],
    summary: [],
    processedBy: null,
    approvalStamp: '',
    processStamp: '',
    showProcessButton: false,
    processDisabled: false,
    subtotal: '0',
    discountValue: '0',
    discountPrefix: '',
    taxLabel: '',
    taxValue: '',
    total: '0',
    saveTone: 'primary',
    dockActions: [
        createSaveDockAction(),
        createDocumentDockAction(),
        createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
        createMoreDockAction({ itemId: 'duplicate', itemLabel: 'Duplikasi pesanan' }),
    ],
};

const defaultSalesOrderConfig = {
    topActions: salesOrderTopActions,
    labels: {
        customer: 'Dipesan oleh',
        entryDate: 'Tanggal',
        documentNumber: 'No Pesanan #',
        paymentTerms: 'Syarat Pembayaran',
        purchaseOrderNumber: 'No. PO',
        address: 'Alamat',
        notes: 'Keterangan',
        tax: 'Pajak',
        shippingDate: 'Tgl Pengiriman',
        shippingMethod: 'Pengiriman',
        fob: 'FOB',
    },
    numberingOptions: ['Pesanan Penjualan'],
    table: {
        createLabel: 'Tambah Pesanan Penjualan',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        pageValue: '12',
        columns: salesOrderListColumns,
        rows: [],
        filters: [
            { id: 'date', rowKey: 'date', options: [{ value: 'all', label: 'Tanggal: Semua' }, { value: '10/02/2017', label: 'Tanggal: 10/02/2017' }] },
            { id: 'customer', rowKey: 'customer', options: [{ value: 'all', label: 'Dipesan oleh: Semua' }, { value: 'Abadi Phone Center', label: 'Dipesan oleh: Abadi Phone Center' }] },
            { id: 'status', rowKey: 'status', options: [{ value: 'all', label: 'Status: Semua' }, { value: 'Terproses', label: 'Status: Terproses' }, { value: 'Sebagian diproses', label: 'Status: Sebagian diproses' }, { value: 'Menunggu diproses', label: 'Status: Menunggu diproses' }] },
            { id: 'printed', rowKey: 'printedStatus', options: [{ value: 'all', label: 'Sudah dicetak: Semua' }, { value: 'all', label: 'Sudah dicetak: Semua' }] },
        ],
        downloadItems: [{ id: 'download-excel', label: 'Unduh Excel' }, { id: 'download-pdf', label: 'Unduh PDF' }],
        printItems: [{ id: 'print-list', label: 'Cetak daftar pesanan' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: salesOrderSectionTabs,
    itemSearchPlaceholder: 'Cari/Pilih Barang dan Jasa...',
    itemSectionTitle: 'Rincian Barang',
    itemTable: {
        columns: salesOrderItemColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[1280px]',
    },
    additionalInfoTitle: 'Info lainnya',
    taxInfoTitle: 'Info Pajak',
    shippingInfoTitle: 'Info Pengiriman',
    extraInfoTitle: 'Info Tambahan',
    additionalCostsTitle: 'Biaya Lainnya',
    costSearchPlaceholder: 'Cari/Pilih Akun Perkiraan...',
    costTable: {
        columns: salesOrderCostColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[980px]',
    },
    orderInfoTitle: 'Informasi Pesanan',
    processedByTitle: 'Diproses Oleh',
    takeButtonLabel: 'Ambil',
    processButtonLabel: 'Proses',
    draft: salesOrderDraft,
    detailRecords: {},
};

const salesInvoiceTableRows = [];

const salesInvoiceDraft = {
    ...salesOrderDraft,
    numberingType: 'Faktur Penjualan',
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
