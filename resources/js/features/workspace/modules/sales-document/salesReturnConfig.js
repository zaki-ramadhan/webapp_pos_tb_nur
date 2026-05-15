import {
    buildSalesDocumentRecord,
    mergeSalesDocumentConfigWithPage,
} from '@/features/workspace/modules/sales-document/salesOrderConfig';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';

const todayDisplayDate = buildTodayDisplayDate();

const salesReturnSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'additional-costs', label: 'Biaya Lainnya', icon: 'payment' },
];

const salesReturnListColumns = [
    { id: 'rowSpacer', label: '', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'customerShort', label: 'Pelanggan', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[54%]', align: 'left' },
    { id: 'total', label: 'Total', widthClassName: 'w-[150px]', align: 'right' },
];

const salesReturnItemColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[56%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[118px]', align: 'center' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[96px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[86px]', align: 'center' },
    { id: 'price', label: '@Harga', widthClassName: 'w-[112px]', align: 'right' },
    { id: 'discount', label: 'Diskon', widthClassName: 'w-[82px]', align: 'right' },
    { id: 'total', label: 'Total Harga', widthClassName: 'w-[126px]', align: 'right' },
];

const salesReturnCostColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Biaya', widthClassName: 'w-[72%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[130px]', align: 'center' },
    { id: 'amount', label: 'Jumlah', widthClassName: 'w-[150px]', align: 'right' },
];

const salesReturnCreateDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
];

const salesReturnDetailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction(),
    createAttachmentDockAction(),
    createMoreDockAction(),
    createDeleteDockAction(),
];

const salesReturnTableRows = [
    { id: 'SRT.2017.01.00005', rowSpacer: '', number: 'SRT.2017.01.00005', date: '31/01/2017', customer: 'PT Galaxy Phone', customerShort: 'PT Galaxy Phone', notes: '', total: '7,600', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2017.01.00004', rowSpacer: '', number: 'SRT.2017.01.00004', date: '30/01/2017', customer: 'PT CIRCLE PHONE', customerShort: 'PT CIRCLE PHONE', notes: '', total: '2,400', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2017.01.00003', rowSpacer: '', number: 'SRT.2017.01.00003', date: '20/01/2017', customer: 'Global Phone Jaya', customerShort: 'Global Phone Jaya', notes: '', total: '39,160,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2017.01.00002', rowSpacer: '', number: 'SRT.2017.01.00002', date: '20/01/2017', customer: 'Pelanggan Umum - Surabaya', customerShort: 'Pelanggan Umum - Sur...', notes: '', total: '6,000,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2017.01.00001', rowSpacer: '', number: 'SRT.2017.01.00001', date: '18/01/2017', customer: 'Pelanggan Umum - Jakarta', customerShort: 'Pelanggan Umum - Jak...', notes: '', total: '3,600,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.12.00004', rowSpacer: '', number: 'SRT.2016.12.00004', date: '31/12/2016', customer: 'Abadi Phone Center', customerShort: 'Abadi Phone Center', notes: '', total: '1,705,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.12.00003', rowSpacer: '', number: 'SRT.2016.12.00003', date: '25/12/2016', customer: 'PT Global Makmur', customerShort: 'PT Global Makmur', notes: '', total: '37,400,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.12.00002', rowSpacer: '', number: 'SRT.2016.12.00002', date: '20/12/2016', customer: 'PT CIRCLE PHONE', customerShort: 'PT CIRCLE PHONE', notes: '', total: '2,400', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.12.00001', rowSpacer: '', number: 'SRT.2016.12.00001', date: '13/12/2016', customer: 'Abadi Phone Center', customerShort: 'Abadi Phone Center', notes: 'Barang Rusak.', total: '1,100,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.11.00004', rowSpacer: '', number: 'SRT.2016.11.00004', date: '30/11/2016', customer: 'Dimas seraya Accessories', customerShort: 'Dimas seraya Accessories', notes: '', total: '300,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.11.00001', rowSpacer: '', number: 'SRT.2016.11.00001', date: '30/11/2016', customer: 'Abadi Phone Center', customerShort: 'Abadi Phone Center', notes: '', total: '12,210,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.11.00003', rowSpacer: '', number: 'SRT.2016.11.00003', date: '25/11/2016', customer: 'Global Phone Jaya', customerShort: 'Global Phone Jaya', notes: '', total: '1,950,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.11.00002', rowSpacer: '', number: 'SRT.2016.11.00002', date: '20/11/2016', customer: 'Dimas seraya Accessories', customerShort: 'Dimas seraya Accessories', notes: '', total: '500,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.10.00004', rowSpacer: '', number: 'SRT.2016.10.00004', date: '31/10/2016', customer: 'Pelanggan Umum - Surabaya', customerShort: 'Pelanggan Umum - Sur...', notes: '', total: '4,000,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.10.00003', rowSpacer: '', number: 'SRT.2016.10.00003', date: '30/10/2016', customer: 'Pelanggan Umum - Jakarta', customerShort: 'Pelanggan Umum - Jak...', notes: '', total: '4,000,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.10.00001', rowSpacer: '', number: 'SRT.2016.10.00001', date: '30/10/2016', customer: 'PT Nusantara Indah', customerShort: 'PT Nusantara Indah', notes: '', total: '46,500,000', returnType: 'Faktur', printedStatus: 'all' },
    { id: 'SRT.2016.10.00002', rowSpacer: '', number: 'SRT.2016.10.00002', date: '25/10/2016', customer: 'PT Nusantara Indah', customerShort: 'PT Nusantara Indah', notes: '', total: '34,100,000', returnType: 'Faktur', printedStatus: 'all' },
];

const salesReturnDraft = {
    customer: [],
    entryDate: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Retur Penjualan',
    documentNumber: '',
    currency: '',
    exchangeRate: '',
    exchangeRateLabel: '',
    exchangeRatePrefix: 'Rtl',
    secondaryExchangeRate: '',
    secondaryExchangeRatePrefix: 'Pjk',
    showSecondaryExchangeRateField: false,
    returnSource: 'Faktur',
    returnSourceReferences: [],
    itemSearch: '',
    items: [],
    itemCountLabel: 'Rincian Barang',
    address: '',
    branches: ['JAKARTA'],
    notes: '',
    returnItemMode: 'returned',
    printedBy: '',
    printedDate: '',
    taxEnabled: false,
    taxIncluded: false,
    costSearch: '',
    additionalCosts: [],
    summary: [],
    processedBy: null,
    approvalStamp: '',
    processStamp: '',
    showProcessButton: false,
    processDisabled: false,
    showHeaderTakeButton: false,
    subtotal: '0',
    discountValue: '0',
    discountPrefix: '',
    taxLabel: '',
    taxValue: '',
    total: '0',
    dockActions: salesReturnCreateDockActions,
};

const salesReturnDetailRecords = {
    'SRT.2017.01.00005': {
        customer: ['[CJKT-0002] PT Galaxy Phone'],
        entryDate: '31/01/2017',
        autoNumber: false,
        numberingType: 'Retur Penjualan',
        documentNumber: 'SRT.2017.01.00005',
        currency: 'SGD',
        exchangeRate: '9,543',
        exchangeRateLabel: '',
        exchangeRatePrefix: 'Rtl',
        secondaryExchangeRate: '9,391.68',
        secondaryExchangeRatePrefix: 'Pjk',
        showSecondaryExchangeRateField: true,
        returnSource: 'Faktur',
        returnSourceReferences: ['SI.2017.02.00009'],
        itemSearch: '',
        items: [
            {
                id: 'sales-return-detail-item-1',
                name: 'Samsung S7',
                code: '1100004',
                quantity: '5',
                unit: 'PCS',
                price: '1,520',
                discount: '0',
                total: '7,600',
            },
        ],
        itemCountLabel: '1 Barang (5)',
        address: 'Peakview Estate, 3, 3 Jalan Pari Dedap, 488606',
        branches: ['JAKARTA'],
        notes: '',
        returnItemMode: 'returned',
        printedBy: '',
        printedDate: '',
        taxEnabled: false,
        taxIncluded: false,
        costSearch: '',
        additionalCosts: [],
        summary: [],
        processedBy: null,
        approvalStamp: '',
        processStamp: '',
        showProcessButton: false,
        processDisabled: false,
        showHeaderTakeButton: false,
        subtotal: '$ 7,600',
        discountValue: '0',
        discountPrefix: '$',
        taxLabel: '',
        taxValue: '',
        total: '$ 7,600',
        dockActions: salesReturnDetailDockActions,
    },
};

const defaultSalesReturnConfig = {
    labels: {
        customer: 'Pelanggan',
        entryDate: 'Tanggal',
        documentNumber: 'No Retur #',
        address: 'Dari Alamat',
        branch: 'Cabang',
        notes: 'Keterangan',
        tax: 'Pajak',
        exchangeRate: 'Kurs',
    },
    numberingOptions: ['Retur Penjualan'],
    customerPlaceholder: 'Cari/Pilih Pelanggan...',
    customerSearchLabel: 'Cari pelanggan',
    table: {
        createLabel: 'Tambah Retur Penjualan',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        pageValue: '17',
        columns: salesReturnListColumns,
        rows: salesReturnTableRows,
        filters: [
            { id: 'date', rowKey: 'date', options: [{ value: 'all', label: 'Tanggal: Semua' }, { value: '31/01/2017', label: 'Tanggal: 31/01/2017' }] },
            { id: 'customer', rowKey: 'customer', options: [{ value: 'all', label: 'Pelanggan: Semua' }, { value: 'PT Galaxy Phone', label: 'Pelanggan: PT Galaxy Phone' }, { value: 'PT CIRCLE PHONE', label: 'Pelanggan: PT CIRCLE PHONE' }] },
            { id: 'returnType', rowKey: 'returnType', options: [{ value: 'all', label: 'Tipe Pengembalian: Semua' }, { value: 'Faktur', label: 'Tipe Pengembalian: Faktur' }] },
            { id: 'printed', rowKey: 'printedStatus', options: [{ value: 'all', label: 'Sudah dicetak: Semua' }] },
        ],
        downloadItems: [],
        printItems: [{ id: 'print-list', label: 'Cetak daftar retur penjualan' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: salesReturnSectionTabs,
    itemSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
    itemSectionTitle: 'Rincian Barang',
    itemSectionLeadingAction: { label: 'Ambil' },
    itemSectionLeadingActionDetailOnly: true,
    showItemTitleSearchButton: true,
    hideItemSearchField: true,
    itemTable: {
        columns: salesReturnItemColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[1060px]',
    },
    additionalInfoTitle: 'Info lainnya',
    taxInfoTitle: 'Info Pajak',
    additionalInfoLeadingFields: [
        {
            type: 'radio-group',
            label: 'Pengembalian Barang',
            valueKey: 'returnItemMode',
            detailOnly: true,
            options: [
                { value: 'returned', label: 'Barang Dikembalikan', showInfoIcon: true },
                { value: 'not-returned', label: 'Barang TIDAK Dikembalikan', showInfoIcon: true },
                { value: 'partial-returned', label: 'Sebagian Barang Dikembalikan', showInfoIcon: true },
            ],
        },
    ],
    additionalInfoTrailingFields: [
        { type: 'text', label: 'Dicetak oleh', valueKey: 'printedBy', detailOnly: true },
        { type: 'text', label: 'Tanggal Cetak', valueKey: 'printedDate', detailOnly: true },
    ],
    headerSelectLookupField: {
        label: 'Retur dari',
        required: true,
        selectValueKey: 'returnSource',
        valueKey: 'returnSourceReferences',
        options: ['Faktur'],
        placeholder: 'Cari/Pilih Faktur...',
        searchLabel: 'Cari faktur',
    },
    showHeaderTakeButton: false,
    showPaymentTerms: false,
    showPurchaseOrderNumber: false,
    showTaxInfo: true,
    showShippingInfo: false,
    showExtraInfo: false,
    showFooter: true,
    costSearchPlaceholder: 'Cari/Pilih Akun Perkiraan...',
    additionalCostsTitle: 'Biaya Lainnya',
    costSectionLeadingAction: { label: 'Ambil' },
    costSectionLeadingActionDetailOnly: true,
    hideCostSearchField: true,
    costTable: {
        columns: salesReturnCostColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[860px]',
    },
    takeButtonLabel: 'Ambil',
    processButtonLabel: 'Proses',
    draft: salesReturnDraft,
    detailRecords: salesReturnDetailRecords,
};

export function buildSalesReturnConfig(pageConfig = {}) {
    return mergeSalesDocumentConfigWithPage(defaultSalesReturnConfig, pageConfig);
}

export function buildSalesReturnRecord(row = {}, config) {
    const record = buildSalesDocumentRecord(row, config.draft, config.detailRecords, {
        customerPrefix: '[CJKT-0002]',
        currency: 'IDR',
        includeAdvanceSummary: false,
        includePrintedSummary: false,
        showProcessButton: false,
        processStamp: '',
        approvalStamp: '',
        processedBy: null,
        dockActions: salesReturnDetailDockActions,
    });

    return {
        ...record,
        returnSource: record.returnSource ?? 'Faktur',
        returnSourceReferences: record.returnSourceReferences ?? [],
        returnItemMode: record.returnItemMode ?? 'returned',
        printedBy: record.printedBy ?? '',
        printedDate: record.printedDate ?? '',
        showHeaderTakeButton: false,
        subtotal: record.subtotal || `Rp ${row.total ?? '0'}`,
        total: record.total || `Rp ${row.total ?? '0'}`,
        dockActions: row.id ? salesReturnDetailDockActions : salesReturnCreateDockActions,
    };
}
