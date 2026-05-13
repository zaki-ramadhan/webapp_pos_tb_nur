import {
    buildSalesDocumentRecord,
    mergeSalesDocumentConfigWithPage,
} from '@/features/workspace/modules/salesOrderConfig';
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

const purchaseReturnTableRows = [
    { id: 'PRT.2017.01.00003', number: 'PRT.2017.01.00003', date: '30/01/2017', customer: 'SAMSANG', customerShort: 'SAMSANG', notes: '', total: '2,105', printedStatus: 'all' },
    { id: 'PRT.2017.01.00002', number: 'PRT.2017.01.00002', date: '20/01/2017', customer: 'Applus', customerShort: 'Applus', notes: '', total: '6,181', printedStatus: 'all' },
    { id: 'PRT.2017.01.00001', number: 'PRT.2017.01.00001', date: '15/01/2017', customer: 'Toko Samudra Sparepart', customerShort: 'Toko Samudra Sparepart', notes: '', total: '190,000', printedStatus: 'all' },
    { id: 'PRT.2016.12.00004', number: 'PRT.2016.12.00004', date: '30/12/2016', customer: 'Applus', customerShort: 'Applus', notes: '', total: '5,278', printedStatus: 'all' },
    { id: 'PRT.2016.12.00003', number: 'PRT.2016.12.00003', date: '20/12/2016', customer: 'SAMSANG', customerShort: 'SAMSANG', notes: '', total: '1,660', printedStatus: 'all' },
    { id: 'PRT.2016.12.00002', number: 'PRT.2016.12.00002', date: '20/12/2016', customer: 'Toko Samudra Sparepart', customerShort: 'Toko Samudra Sparepart', notes: '', total: '95,000', printedStatus: 'all' },
    { id: 'PRT.2016.12.00001', number: 'PRT.2016.12.00001', date: '15/12/2016', customer: 'ASMUS', customerShort: 'ASMUS', notes: '', total: '6,224', printedStatus: 'all' },
    { id: 'PRT.2016.11.00004', number: 'PRT.2016.11.00004', date: '30/11/2016', customer: 'Toko Yan Gadget', customerShort: 'Toko Yan Gadget', notes: '', total: '1,140,000', printedStatus: 'all' },
    { id: 'PRT.2016.11.00002', number: 'PRT.2016.11.00002', date: '30/11/2016', customer: 'Toko Mega Mendung', customerShort: 'Toko Mega Mendung', notes: '', total: '79,135,000', printedStatus: 'all' },
    { id: 'PRT.2016.11.00003', number: 'PRT.2016.11.00003', date: '20/11/2016', customer: 'Toko Yan Gadget', customerShort: 'Toko Yan Gadget', notes: '', total: '1,520,000', printedStatus: 'all' },
    { id: 'PRT.2016.11.00001', number: 'PRT.2016.11.00001', date: '16/11/2016', customer: 'Toko Mega Mendung', customerShort: 'Toko Mega Mendung', notes: '', total: '190,000', printedStatus: 'all' },
    { id: 'PRT.2016.10.00004', number: 'PRT.2016.10.00004', date: '31/10/2016', customer: 'Applus', customerShort: 'Applus', notes: '', total: '5,916', printedStatus: 'all' },
    { id: 'PRT.2016.10.00003', number: 'PRT.2016.10.00003', date: '30/10/2016', customer: 'Applus', customerShort: 'Applus', notes: '', total: '4,248', printedStatus: 'all' },
    { id: 'PRT.2016.10.00001', number: 'PRT.2016.10.00001', date: '30/10/2016', customer: 'Toko Berkat Cell', customerShort: 'Toko Berkat Cell', notes: '', total: '6,412,500', printedStatus: 'all' },
    { id: 'PRT.2016.10.00002.1', number: 'PRT.2016.10.00002.1', date: '29/10/2016', customer: 'Applus', customerShort: 'Applus', notes: '', total: '14,920', printedStatus: 'all' },
    { id: 'PRT.2016.10.00006', number: 'PRT.2016.10.00006', date: '28/10/2016', customer: 'SAMSANG', customerShort: 'SAMSANG', notes: '', total: '3,456', printedStatus: 'all' },
    { id: 'PRT.2016.10.00005', number: 'PRT.2016.10.00005', date: '25/10/2016', customer: 'SAMSANG', customerShort: 'SAMSANG', notes: '', total: '4,620', printedStatus: 'all' },
    { id: 'PRT.2017.02.00001', number: 'PRT.2017.02.00001', date: '20/10/2016', customer: 'Beautiful Cellular', customerShort: 'Beautiful Cellular', notes: '', total: '6,650,000', printedStatus: 'all' },
];

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
    branches: ['JAKARTA'],
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

const purchaseReturnDetailRecords = {
    'PRT.2017.01.00003': {
        customer: ['[VJKT-0001] SAMSANG'],
        entryDate: '30/01/2017',
        autoNumber: false,
        numberingType: 'Retur Pembelian',
        documentNumber: 'PRT.2017.01.00003',
        currency: 'SGD',
        exchangeRate: '9,450',
        exchangeRateLabel: '',
        exchangeRatePrefix: 'Rtl',
        secondaryExchangeRate: '',
        secondaryExchangeRatePrefix: 'Pjk',
        showSecondaryExchangeRateField: true,
        returnSource: 'Faktur',
        returnSourceReferences: ['SS-2483217'],
        itemSearch: '',
        items: [
            {
                id: 'purchase-return-detail-item-1',
                name: 'Samsung Galaxy Tab S2 8.0 (32 GB)',
                code: '1100007',
                quantity: '5',
                unit: 'PCS',
                price: '421',
                total: '2,105',
                discount: '0',
            },
        ],
        itemCountLabel: '1 Barang (5)',
        address: 'JustOffice @ Asia Square, Asia Square Tow..., #23-01, 12 Marina View, 018961',
        branches: ['JAKARTA'],
        notes: '',
        printedStatus: 'Belum cetak/email',
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
        subtotal: '$ 2,105',
        discountValue: '0',
        discountPrefix: '$',
        taxLabel: '',
        taxValue: '',
        total: '$ 2,105',
        dockActions: purchaseReturnDetailDockActions,
    },
};

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
    itemSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
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
