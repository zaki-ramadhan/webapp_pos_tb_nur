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

export const salesOrderTopActions = [
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

export const salesOrderSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'additional-costs', label: 'Biaya Lainnya', icon: 'payment' },
    { id: 'order-info', label: 'Informasi Pesanan', icon: 'receipt' },
];

export const salesDeliverySectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'order-info', label: 'Informasi Pengiriman', icon: 'receipt' },
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

export const salesDeliveryListColumns = [
    { id: 'statusIcon', label: '#', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'customerShort', label: 'Pelanggan', widthClassName: 'w-[180px]', align: 'left' },
    { id: 'shippingShort', label: 'Pengiriman', widthClassName: 'w-[140px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[54%]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[190px]', align: 'left' },
];

export const salesDeliveryItemColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[72%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[130px]', align: 'center' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[110px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[92px]', align: 'center' },
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

const salesOrderTableRows = [
    { id: 'SO.2017.02.00002', number: 'SO.2017.02.00002', date: '10/02/2017', customer: 'Pelanggan Umum - Jakarta', customerShort: 'Pelanggan Umum - Jak...', notes: '', status: 'Terproses', total: '17,600,000', statusTone: 'processed' },
    { id: 'SO.2017.02.00001', number: 'SO.2017.02.00001', date: '10/02/2017', customer: 'Abadi Phone Center', customerShort: 'Abadi Phone Center', notes: '', status: 'Terproses', total: '1,925,000', statusTone: 'processed' },
    { id: 'SO.2017.01.00003', number: 'SO.2017.01.00003', date: '15/01/2017', customer: 'Pelanggan Umum - Surabaya', customerShort: 'Pelanggan Umum - Sur...', notes: '', status: 'Terproses', total: '4,675,000', statusTone: 'processed' },
    { id: 'SO.2017.01.00002', number: 'SO.2017.01.00002', date: '06/01/2017', customer: 'Pelanggan Umum - Surabaya', customerShort: 'Pelanggan Umum - Sur...', notes: '', status: 'Sebagian diproses', total: '11,000,000', statusTone: 'partial' },
    { id: 'SO.2017.01.00001', number: 'SO.2017.01.00001', date: '03/01/2017', customer: 'PT Sinar Bumi', customerShort: 'PT Sinar Bumi', notes: '', status: 'Menunggu diproses', total: '1,650,000', statusTone: 'pending' },
    { id: 'SO.2016.12.00003', number: 'SO.2016.12.00003', date: '13/12/2016', customer: 'Cinema Phone Cellular', customerShort: 'Cinema Phone Cellular', notes: '', status: 'Terproses', total: '25,960,000', statusTone: 'processed' },
    { id: 'SO.2016.12.00002', number: 'SO.2016.12.00002', date: '13/12/2016', customer: 'Abadi Phone Center', customerShort: 'Abadi Phone Center', notes: '', status: 'Terproses', total: '13,750,000', statusTone: 'processed' },
    { id: 'SO.2016.11.00002', number: 'SO.2016.11.00002', date: '15/11/2016', customer: 'PT Kapuk Kartika', customerShort: 'PT Kapuk Kartika', notes: '', status: 'Sebagian diproses', total: '660,000', statusTone: 'partial' },
    { id: 'SO.2016.11.00001', number: 'SO.2016.11.00001', date: '11/11/2016', customer: 'PT Titik Terang', customerShort: 'PT Titik Terang', notes: '', status: 'Menunggu diproses', total: '825,000', statusTone: 'pending' },
    { id: 'SO.2016.10.00003', number: 'SO.2016.10.00003', date: '31/10/2016', customer: 'PT Kapuk Kartika', customerShort: 'PT Kapuk Kartika', notes: '', status: 'Menunggu diproses', total: '4,125,000', statusTone: 'pending' },
    { id: 'SO.2016.10.00002', number: 'SO.2016.10.00002', date: '15/10/2016', customer: 'PT Galaxy Phone', customerShort: 'PT Galaxy Phone', notes: '', status: 'Sebagian diproses', total: '219.99', statusTone: 'partial' },
    { id: 'SO.2016.10.00001', number: 'SO.2016.10.00001', date: '14/10/2016', customer: 'PT Emas Sentosa', customerShort: 'PT Emas Sentosa', notes: '', status: 'Menunggu diproses', total: '3,300,000', statusTone: 'pending' },
];

export const salesOrderDraft = {
    customer: [],
    entryDate: '25/04/2026',
    autoNumber: true,
    numberingType: 'Pesanan Penjualan',
    documentNumber: '',
    currency: '',
    itemSearch: '',
    items: [],
    itemCountLabel: 'Rincian Barang',
    paymentTerms: [],
    purchaseOrderNumber: '',
    address: '',
    branches: ['JAKARTA'],
    notes: '',
    taxEnabled: false,
    taxIncluded: false,
    shippingDate: '25/04/2026',
    shippingMethod: [],
    fob: [],
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

export const salesOrderDetailRecords = {
    'SO.2017.02.00002': {
        customer: ['[CJKT-0001] Pelanggan Umum - Jakarta'],
        entryDate: '10/02/2017',
        autoNumber: false,
        numberingType: 'Pesanan Penjualan',
        documentNumber: 'SO.2017.02.00002',
        currency: 'IDR',
        itemSearch: '',
        items: [
            {
                id: 'SO.2017.02.00002-item-1',
                name: 'Iphone 5 64 GB',
                code: '5164003',
                quantity: '4',
                unit: 'PCS',
                price: '4,000,000',
                discount: '0',
                total: '16,000,000',
            },
        ],
        itemCountLabel: '1 Barang (4)',
        paymentTerms: ['C.O.D'],
        purchaseOrderNumber: '',
        address: '',
        branches: ['JAKARTA'],
        notes: '',
        taxEnabled: true,
        taxIncluded: false,
        shippingDate: '10/02/2017',
        shippingMethod: [],
        fob: [],
        costSearch: '',
        additionalCosts: [],
        summary: [
            ['Total', 'Rp 17,600,000'],
            ['Uang Muka', 'Rp 0'],
            ['Uang Muka Terpakai/Retur', 'Rp 0'],
            ['Sisa Uang Muka', 'Rp 0'],
            ['Status', 'Terproses'],
            ['Dicetak/email', 'Belum cetak/email'],
        ],
        processedBy: {
            number: 'SI.2017.02.00005',
            date: '10/02/2017',
        },
        approvalStamp: 'DISETUJUI',
        processStamp: 'TERPROSES',
        showProcessButton: true,
        processDisabled: true,
        subtotal: 'Rp 16,000,000',
        discountValue: '0',
        discountPrefix: 'Rp',
        taxLabel: 'PPN 10%',
        taxValue: 'Rp 1,600,000',
        total: 'Rp 17,600,000',
        saveTone: 'muted',
        dockActions: sharedDetailDockActions,
    },
};

export const defaultSalesOrderConfig = {
    topActions: salesOrderTopActions,
    labels: {
        customer: 'Dipesan oleh',
        entryDate: 'Tanggal',
        documentNumber: 'No Pesanan #',
        paymentTerms: 'Syarat Pembayaran',
        purchaseOrderNumber: 'No. PO',
        address: 'Alamat',
        branch: 'Cabang',
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
        rows: salesOrderTableRows,
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
    itemSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
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
    detailRecords: salesOrderDetailRecords,
};

export function buildSalesOrderConfig(pageConfig = {}) {
    return mergeSalesDocumentConfigWithPage(defaultSalesOrderConfig, pageConfig);
}

export function buildSalesOrderRecord(row = {}) {
    return buildSalesDocumentRecord(row, salesOrderDraft, salesOrderDetailRecords, {
        customerPrefix: '[CJKT-0001]',
        includeAdvanceSummary: true,
        includePrintedSummary: true,
        dockActions: sharedDetailDockActions,
    });
}
