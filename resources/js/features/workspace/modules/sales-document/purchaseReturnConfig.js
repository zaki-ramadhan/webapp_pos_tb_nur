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

const purchaseReturnSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'additional-costs', label: 'Biaya Lainnya', icon: 'payment' },
];

const purchaseReturnListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[210px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[130px]', align: 'left' },
    { id: 'customerShort', label: 'Pemasok', widthClassName: 'w-[220px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[52%]', align: 'left' },
    { id: 'total', label: 'Total', widthClassName: 'w-[160px]', align: 'right' },
];

const purchaseReturnItemColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[56%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[122px]', align: 'center' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[96px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[86px]', align: 'center' },
    { id: 'price', label: '@Harga', widthClassName: 'w-[112px]', align: 'right' },
    { id: 'total', label: 'Total Harga', widthClassName: 'w-[126px]', align: 'right' },
    { id: 'discount', label: 'Diskon', widthClassName: 'w-[84px]', align: 'right' },
];

const purchaseReturnCostColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Biaya', widthClassName: 'w-[58%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[120px]', align: 'center' },
    { id: 'amount', label: 'Jumlah', widthClassName: 'w-[120px]', align: 'right' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[22%]', align: 'left' },
];

const purchaseReturnTableRows = [];

const purchaseReturnCreateDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
];

const purchaseReturnDetailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction(),
    createAttachmentDockAction(),
    createMoreDockAction(),
    createDeleteDockAction(),
];

const defaultPurchaseReturnDraft = {
    customer: [],
    entryDate: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Retur Pembelian',
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
    printedStatus: '',
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
    dockActions: purchaseReturnCreateDockActions,
};

const purchaseReturnDetailRecords = {};

const defaultPurchaseReturnConfig = {
    labels: {
        customer: 'Pemasok',
        entryDate: 'Tanggal',
        documentNumber: 'No Retur #',
        address: 'Ke Alamat',
        branch: 'Cabang',
        notes: 'Keterangan',
        tax: 'Pajak',
        exchangeRate: 'Kurs',
    },
    numberingOptions: ['Retur Pembelian'],
    customerPlaceholder: 'Cari/Pilih Pemasok...',
    customerSearchLabel: 'Cari pemasok',
    table: {
        createLabel: 'Tambah Retur Pembelian',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        pageValue: '18',
        columns: purchaseReturnListColumns,
        rows: purchaseReturnTableRows,
        filters: [
            { id: 'date', rowKey: 'date', options: [{ value: 'all', label: 'Tanggal: Semua' }, { value: '30/01/2017', label: 'Tanggal: 30/01/2017' }] },
            { id: 'customer', rowKey: 'customer', options: [{ value: 'all', label: 'Pemasok: Semua' }, { value: 'SAMSANG', label: 'Pemasok: SAMSANG' }, { value: 'Applus', label: 'Pemasok: Applus' }] },
            { id: 'printed', rowKey: 'printedStatus', options: [{ value: 'all', label: 'Sudah dicetak: Semua' }, { value: 'all', label: 'Sudah dicetak: Semua' }] },
        ],
        downloadItems: [],
        printItems: [{ id: 'print-list', label: 'Cetak daftar retur pembelian' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: purchaseReturnSectionTabs,
    itemSearchPlaceholder: 'Cari/Pilih Barang dan Jasa...',
    itemSectionTitle: 'Rincian Barang',
    itemSectionLeadingAction: { label: 'Ambil' },
    showItemTitleSearchButton: true,
    hideItemSearchField: true,
    itemTable: {
        columns: purchaseReturnItemColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[1060px]',
    },
    costSearchPlaceholder: 'Cari/Pilih Akun Perkiraan...',
    additionalCostsTitle: 'Biaya Lainnya',
    costSectionLeadingAction: { label: 'Ambil' },
    hideCostSearchField: true,
    costTable: {
        columns: purchaseReturnCostColumns,
        emptyLabel: 'Belum ada data',
    },
    additionalInfoTitle: 'Info lainnya',
    taxInfoTitle: 'Info Pajak',
    additionalInfoTrailingFields: [
        {
            type: 'text',
            label: 'Dicetak/email',
            valueKey: 'printedStatus',
        },
    ],
    headerSelectLookupField: {
        label: 'Retur dari',
        required: true,
        selectValueKey: 'returnSource',
        valueKey: 'returnSourceReferences',
        options: ['Faktur'],
        placeholder: 'Cari/Pilih Pembelian/Pemasok...',
        searchLabel: 'Cari pembelian atau pemasok',
    },
    showHeaderTakeButton: false,
    showPaymentTerms: false,
    showPurchaseOrderNumber: false,
    showTaxInfo: true,
    showShippingInfo: false,
    showExtraInfo: false,
    showFooter: true,
    takeButtonLabel: 'Ambil',
    processButtonLabel: 'Proses',
    draft: defaultPurchaseReturnDraft,
    detailRecords: purchaseReturnDetailRecords,
};

function ensurePurchaseReturnSectionTabs(sectionTabs = []) {
    const normalizedTabs = Array.isArray(sectionTabs) ? [...sectionTabs] : [];

    for (const requiredTab of purchaseReturnSectionTabs) {
        if (!normalizedTabs.some((tab) => tab.id === requiredTab.id)) {
            normalizedTabs.push(requiredTab);
        }
    }

    return normalizedTabs;
}

export function buildPurchaseReturnConfig(pageConfig = {}) {
    const config = mergeSalesDocumentConfigWithPage(defaultPurchaseReturnConfig, pageConfig);

    return {
        ...config,
        sectionTabs: ensurePurchaseReturnSectionTabs(config.sectionTabs),
    };
}

export function buildPurchaseReturnRecord(row = {}, config) {
    const record = buildSalesDocumentRecord(row, config.draft, config.detailRecords, {
        customerPrefix: '[VJKT-0001]',
        includeAdvanceSummary: false,
        includePrintedSummary: false,
        showProcessButton: false,
        processStamp: '',
        approvalStamp: '',
        processedBy: null,
        dockActions: purchaseReturnDetailDockActions,
    });

    return {
        ...record,
        returnSource: record.returnSource ?? 'Faktur',
        returnSourceReferences: record.returnSourceReferences ?? [],
        showHeaderTakeButton: false,
        subtotal: record.subtotal || `Rp ${row.total ?? '0'}`,
        total: record.total || `Rp ${row.total ?? '0'}`,
        dockActions: row.id ? purchaseReturnDetailDockActions : purchaseReturnCreateDockActions,
    };
}
