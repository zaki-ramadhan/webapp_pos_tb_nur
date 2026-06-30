import {
    buildSalesDocumentRecord,
    mergeSalesDocumentConfigWithPage,
} from '@/features/workspace/modules/sales-document/salesDocumentConfigCore';
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
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[56%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[118px]', align: 'center' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[96px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[86px]', align: 'center' },
    { id: 'price', label: '@Harga', widthClassName: 'w-[112px]', align: 'right' },
    { id: 'discount', label: 'Diskon', widthClassName: 'w-[82px]', align: 'right' },
    { id: 'total', label: 'Total Harga', widthClassName: 'w-[126px]', align: 'right' },
];

const salesReturnCostColumns = [
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

const salesReturnTableRows = [];

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

const salesReturnDetailRecords = {};

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
        searchPlaceholder: 'Cari nomor atau pelanggan...',
        pageValue: '17',
        columns: salesReturnListColumns,
        rows: salesReturnTableRows,
        resourceName: 'sales-returns',
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
        options: ['Faktur', 'Penerimaan', 'Tanpa Faktur'],
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
    hideImportButton: true,
    hideFilterButton: true,
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
