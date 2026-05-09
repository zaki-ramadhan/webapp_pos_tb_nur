import { sharedDetailDockActions } from '@/features/workspace/modules/salesOrderConfig';
import {
    createAttachmentDockAction,
    createDocumentDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';

const purchaseDepositTopActions = [
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

const purchaseDepositSectionTabs = [
    { id: 'deposit', label: 'Uang Muka', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'invoice-info', label: 'Informasi Faktur', icon: 'receipt' },
];

const purchaseDepositListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'billNumber', label: 'No Faktur #', widthClassName: 'w-[160px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'supplierShort', label: 'Pemasok', widthClassName: 'w-[210px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[42%]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'age', label: 'Umur (hr)', widthClassName: 'w-[100px]', align: 'right' },
    { id: 'total', label: 'Total', widthClassName: 'w-[160px]', align: 'right' },
];

const purchaseDepositCreateDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
];

const purchaseDepositTableRows = [
    {
        id: 'PI.2016.10.00003',
        number: 'PI.2016.10.00003',
        billNumber: '010.070-16.2232...',
        fullBillNumber: '010.070-16.22325234',
        date: '17/10/2016',
        supplier: 'Toko Mega Mendung',
        supplierShort: 'Toko Mega Mendung',
        notes: '',
        status: 'Lunas',
        age: '0',
        total: '8,360,000',
        printedStatus: 'all',
    },
];

const purchaseDepositDraft = {
    supplier: [],
    entryDate: '29/04/2026',
    autoNumber: true,
    numberingType: 'Faktur Pembelian',
    documentNumber: '',
    currency: '',
    processButtonLabel: 'Proses',
    processDisabled: false,
    purchaseOrderNumber: '',
    orderTotal: 'Rp 0',
    depositAmount: '0',
    paymentTerms: [],
    taxEnabled: false,
    taxIncluded: true,
    supplierInvoiceNumber: '',
    bankAccounts: [],
    address: '',
    branches: ['JAKARTA'],
    notes: '',
    taxInvoiceDate: '',
    taxTransactionType: 'Faktur Pembelian',
    taxTransactionDetail: 'Perolehan Dalam Negeri - 01 - Bukan Pemungut PPN (legacy)',
    taxInvoiceNumber: '',
    summary: [],
    paymentHistoryRows: [],
    usedDepositRows: [],
    statusStamp: '',
    statusTone: 'gray',
    footerItems: [
        { id: 'subtotal', label: 'Sub Total', value: '0' },
        { id: 'total', label: 'Total', value: '0' },
    ],
    dockActions: purchaseDepositCreateDockActions,
};

const purchaseDepositDetailRecords = {
    'PI.2016.10.00003': {
        supplier: ['[VSBY-0002] Toko Mega Mendung'],
        entryDate: '17/10/2016',
        autoNumber: false,
        numberingType: 'Faktur Pembelian',
        documentNumber: 'PI.2016.10.00003',
        currency: 'IDR',
        processButtonLabel: 'Proses',
        processDisabled: true,
        purchaseOrderNumber: 'PO.2016.10.00006',
        orderTotal: 'Rp 8,360,000',
        depositAmount: '7,600,000',
        paymentTerms: ['C.O.D'],
        taxEnabled: true,
        taxIncluded: false,
        supplierInvoiceNumber: '010.070-16.22325234',
        bankAccounts: [],
        address: 'Jl. Pluit Karang Cantik Blok B4 No.39\nPenjaringan, Jakarta Utara - 14450\nJakarta DKI Jakarta 14450\nIndonesia',
        branches: ['SURABAYA'],
        notes: '',
        taxInvoiceDate: '17/10/2016',
        taxTransactionType: 'Faktur Pajak',
        taxTransactionDetail: 'Perolehan Dalam Negeri - 01 - Bukan Pemungut PPN (legacy)',
        taxInvoiceNumber: '010.070-16.22325234',
        summary: [
            ['Total', 'Rp 8,360,000'],
            ['Uang Muka Terpakai/Retur', 'Rp 8,360,000'],
            ['Sisa Uang Muka', 'Rp 0'],
            ['Pembayaran', 'Rp 8,360,000'],
            ['Retur', 'Rp 0'],
            ['Utang', 'Rp 0'],
            ['Status', 'Lunas'],
            ['Dicetak/email', 'Belum cetak/email'],
        ],
        paymentHistoryRows: [
            {
                id: 'purchase-deposit-payment-1',
                number: '111.201-02.2016.10.00002',
                date: '17/10/2016',
                amount: 'Rp 8,360,000',
            },
        ],
        usedDepositRows: [
            {
                id: 'purchase-deposit-used-1',
                number: 'PI.2016.10.00004',
                date: '20/10/2016',
                amount: 'Rp 8,360,000',
            },
        ],
        statusStamp: 'LUNAS',
        statusTone: 'green',
        footerItems: [
            { id: 'subtotal', label: 'Sub Total', value: 'Rp 7,600,000' },
            { id: 'tax', label: 'PPN 10 %', badge: '%', value: 'Rp 760,000' },
            { id: 'total', label: 'Total', value: 'Rp 8,360,000' },
        ],
        dockActions: sharedDetailDockActions,
    },
};

export const defaultPurchaseDepositConfig = {
    topActions: purchaseDepositTopActions,
    labels: {
        supplier: 'Pemasok',
        entryDate: 'Tanggal',
        documentNumber: 'No Form #',
        purchaseOrderNumber: 'No. PO',
        orderTotal: 'Total Pesanan',
        depositAmount: 'Uang Muka',
        tax: 'Pajak',
        paymentTerms: 'Syarat Pembayaran',
        supplierInvoiceNumber: 'No Faktur #',
        bankAccount: 'Rekening Bank',
        address: 'Alamat',
        branch: 'Cabang',
        notes: 'Keterangan',
        taxInvoiceDate: 'Tgl Faktur Pajak',
        taxTransactionType: 'Tipe Transaksi',
        taxTransactionDetail: 'Detail Transaksi',
        taxInvoiceNumber: 'No. Faktur Pajak',
    },
    numberingOptions: ['Faktur Pembelian'],
    table: {
        createLabel: 'Tambah Uang Muka Pembelian',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        pageValue: '1',
        minWidthClassName: 'min-w-[1460px]',
        emptyLabel: 'Belum ada data',
        columns: purchaseDepositListColumns,
        rows: purchaseDepositTableRows,
        filters: [
            { id: 'date', rowKey: 'date', options: [{ value: 'all', label: 'Tanggal: Semua' }, { value: '17/10/2016', label: 'Tanggal: 17/10/2016' }] },
            { id: 'supplier', rowKey: 'supplier', options: [{ value: 'all', label: 'Pemasok: Semua' }, { value: 'Toko Mega Mendung', label: 'Pemasok: Toko Mega Mendung' }] },
            { id: 'status', rowKey: 'status', options: [{ value: 'all', label: 'Status: Semua' }, { value: 'Lunas', label: 'Status: Lunas' }] },
        ],
        downloadItems: [{ id: 'download-excel', label: 'Unduh Excel' }],
        printItems: [{ id: 'print-list', label: 'Cetak daftar uang muka pembelian' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: purchaseDepositSectionTabs,
    draft: purchaseDepositDraft,
    detailRecords: purchaseDepositDetailRecords,
    depositTitle: 'Uang Muka',
    taxInfoTitle: 'Info Pajak',
    additionalInfoTitle: 'Info lainnya',
    invoiceInfoTitle: 'Informasi Faktur',
    paymentHistoryTitle: 'Riwayat Pembayaran',
    usedDepositTitle: 'Uang Muka Terpakai/Retur',
};

function mergePurchaseDepositConfig(baseConfig, pageConfig = {}) {
    return {
        ...baseConfig,
        ...pageConfig,
        topActions: pageConfig.topActions ?? baseConfig.topActions,
        labels: {
            ...baseConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        table: {
            ...baseConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns ?? baseConfig.table.columns,
            rows: pageConfig.table?.rows ?? baseConfig.table.rows,
            filters: pageConfig.table?.filters ?? baseConfig.table.filters,
            downloadItems: pageConfig.table?.downloadItems ?? baseConfig.table.downloadItems,
            printItems: pageConfig.table?.printItems ?? baseConfig.table.printItems,
            settingsItems: pageConfig.table?.settingsItems ?? baseConfig.table.settingsItems,
        },
        sectionTabs: pageConfig.sectionTabs ?? baseConfig.sectionTabs,
        draft: {
            ...baseConfig.draft,
            ...(pageConfig.draft ?? {}),
        },
        detailRecords: {
            ...baseConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildPurchaseDepositConfig(pageConfig = {}) {
    return mergePurchaseDepositConfig(defaultPurchaseDepositConfig, pageConfig);
}

export function buildPurchaseDepositRecord(row = {}, config) {
    const detailRecord = config.detailRecords?.[row.id] ?? purchaseDepositDetailRecords[row.id];

    if (detailRecord) {
        return {
            ...config.draft,
            ...detailRecord,
        };
    }

    const totalValue = row.total ? `Rp ${row.total}` : 'Rp 0';

    return {
        ...config.draft,
        supplier: row.supplier ? [`[VSBY-0002] ${row.supplier}`] : [],
        entryDate: row.date ?? config.draft.entryDate,
        autoNumber: false,
        documentNumber: row.number ?? '',
        currency: 'IDR',
        supplierInvoiceNumber: row.fullBillNumber ?? '',
        summary: [
            ['Total', totalValue],
            ['Uang Muka Terpakai/Retur', totalValue],
            ['Sisa Uang Muka', 'Rp 0'],
            ['Pembayaran', totalValue],
            ['Retur', 'Rp 0'],
            ['Utang', 'Rp 0'],
            ['Status', row.status ?? '-'],
            ['Dicetak/email', 'Belum cetak/email'],
        ],
        statusStamp: row.status === 'Lunas' ? 'LUNAS' : '',
        statusTone: row.status === 'Lunas' ? 'green' : 'gray',
        footerItems: [
            { id: 'subtotal', label: 'Sub Total', value: totalValue },
            { id: 'total', label: 'Total', value: totalValue },
        ],
        dockActions: sharedDetailDockActions,
    };
}
