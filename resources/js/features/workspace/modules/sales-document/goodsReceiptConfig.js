import {
    buildSalesDocumentRecord,
    mergeSalesDocumentConfigWithPage,
    sharedDetailDockActions,
} from '@/features/workspace/modules/sales-document/salesOrderConfig';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import {
    createAttachmentDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';

const todayDisplayDate = buildTodayDisplayDate();

const goodsReceiptListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'receiptNumber', label: 'No Terima #', widthClassName: 'w-[180px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'customer', label: 'Pemasok', widthClassName: 'w-[190px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[44%]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[170px]', align: 'left' },
];

const goodsReceiptItemColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[70%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[130px]', align: 'center' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[110px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[92px]', align: 'center' },
];

const goodsReceiptSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'order-info', label: 'Informasi Penerimaan', icon: 'receipt' },
];

const goodsReceiptCreateDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
    createMoreDockAction({ itemId: 'duplicate', itemLabel: 'Duplikasi penerimaan barang' }),
];

const defaultGoodsReceiptDraft = {
    customer: [],
    entryDate: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Penerimaan Barang',
    documentNumber: '',
    currency: '',
    receiptNumber: '',
    itemSearch: '',
    items: [],
    itemCountLabel: 'Rincian Barang',
    address: '',
    branches: ['JAKARTA'],
    notes: '',
    shippingDate: todayDisplayDate,
    shippingMethod: [],
    fob: [],
    summary: [
        ['Status', '-'],
        ['Dicetak/email', 'Belum cetak/email'],
    ],
    processedBy: null,
    showSecondaryHeaderAction: true,
    showProcessButton: false,
    processDisabled: false,
    itemModal: {
        title: 'Rincian Barang',
        tabs: [
            { id: 'details', label: 'Rincian Barang' },
            { id: 'info', label: 'Info lainnya' },
        ],
        values: {
            code: '',
            name: '',
            quantity: '',
            unit: [],
            warehouse: [],
            department: [],
            notes: '',
        },
    },
    dockActions: goodsReceiptCreateDockActions,
};

const goodsReceiptProcessedByMap = {
    'RI.2017.01.00002': [
        {
            number: 'PI.2017.01.00016',
            date: '15/01/2017',
        },
    ],
};

const defaultGoodsReceiptConfig = {
    labels: {
        customer: 'Terima dari',
        entryDate: 'Tanggal',
        documentNumber: 'No Form #',
        paymentTerms: 'Syarat Pembayaran',
        purchaseOrderNumber: 'No Terima #',
        address: 'Alamat',
        branch: 'Cabang',
        notes: 'Keterangan',
        shippingDate: 'Tgl Kirim',
        shippingMethod: 'Pengiriman',
        fob: 'FOB',
    },
    numberingOptions: ['Penerimaan Barang'],
    secondaryActionLabel: 'Faktur',
    showPaymentTerms: false,
    showPurchaseOrderNumber: false,
    showTaxInfo: false,
    showShippingInfo: true,
    showExtraInfo: false,
    showFobInShippingInfo: true,
    showFooter: false,
    initialSectionId: 'details',
    detailInitialSectionId: 'order-info',
    headerTextField: {
        label: 'No Terima #',
        valueKey: 'receiptNumber',
        required: true,
    },
    itemModal: {
        enabled: true,
    },
    table: {
        createLabel: 'Tambah Penerimaan Barang',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        pageValue: '6',
        columns: goodsReceiptListColumns,
        rows: [],
        filters: [],
        downloadItems: [],
        printItems: [{ id: 'print-list', label: 'Cetak daftar penerimaan barang' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: goodsReceiptSectionTabs,
    itemSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
    itemSectionTitle: 'Rincian Barang',
    itemTable: {
        columns: goodsReceiptItemColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[880px]',
    },
    additionalInfoTitle: 'Info lainnya',
    orderInfoTitle: 'Informasi Penerimaan',
    processedByTitle: 'Diproses Oleh',
    processedByEmptyLabel: 'Belum ada faktur pembelian terkait.',
    takeButtonLabel: 'Ambil',
    processButtonLabel: 'Proses',
    draft: defaultGoodsReceiptDraft,
    detailRecords: {},
};

function buildGoodsReceiptSummary(row = {}, record = {}) {
    if (record.summary?.length) {
        return record.summary;
    }

    return [
        ['Status', row.status ?? '-'],
        ['Dicetak/email', 'Belum cetak/email'],
    ];
}

function resolveProcessedBy(row = {}, record = {}) {
    if (record.processedBy) {
        return Array.isArray(record.processedBy) ? record.processedBy : [record.processedBy];
    }

    return goodsReceiptProcessedByMap[row.id] ?? null;
}

function ensureGoodsReceiptSectionTabs(sectionTabs = []) {
    const normalizedTabs = Array.isArray(sectionTabs) ? [...sectionTabs] : [];

    if (!normalizedTabs.some((tab) => tab.id === 'order-info')) {
        normalizedTabs.push(goodsReceiptSectionTabs[2]);
    }

    return normalizedTabs;
}

export function buildGoodsReceiptConfig(pageConfig = {}) {
    const config = mergeSalesDocumentConfigWithPage(defaultGoodsReceiptConfig, pageConfig);

    return {
        ...config,
        sectionTabs: ensureGoodsReceiptSectionTabs(config.sectionTabs),
    };
}

export function buildGoodsReceiptRecord(row = {}, config) {
    const record = buildSalesDocumentRecord(row, config.draft, config.detailRecords, {
        customerPrefix: '[VJKT-0008]',
        includeAdvanceSummary: false,
        includePrintedSummary: true,
        dockActions: sharedDetailDockActions,
        showProcessButton: false,
        processStamp: '',
        approvalStamp: 'DISETUJUI',
        processedBy: null,
    });

    return {
        ...record,
        receiptNumber: row.receiptNumber ?? record.receiptNumber ?? '',
        summary: buildGoodsReceiptSummary(row, record),
        processedBy: resolveProcessedBy(row, record),
        showSecondaryHeaderAction: row.id ? false : (record.showSecondaryHeaderAction ?? true),
        showProcessButton: false,
        processDisabled: false,
        processStamp: '',
        dockActions: row.id
            ? sharedDetailDockActions
            : (record.dockActions?.length ? record.dockActions : goodsReceiptCreateDockActions),
    };
}
