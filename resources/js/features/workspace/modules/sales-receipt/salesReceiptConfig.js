import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const salesReceiptTopActions = [
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

const salesReceiptSectionTabs = [
    { id: 'details', label: 'Faktur', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
];

const salesReceiptListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[220px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'checkNumber', label: 'No. Cek', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'checkDate', label: 'Tanggal Cek', widthClassName: 'w-[130px]', align: 'left' },
    { id: 'customerShort', label: 'Pelanggan', widthClassName: 'w-[320px]', align: 'left' },
    { id: 'bank', label: 'Bank', widthClassName: 'w-[360px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[28%]', align: 'left' },
    { id: 'useCredit', label: 'Pakai Kredit', widthClassName: 'w-[130px]', align: 'left' },
    { id: 'paymentAmount', label: 'Nilai Pembayaran', widthClassName: 'w-[160px]', align: 'right' },
];

const salesReceiptInvoiceColumns = [
    { id: 'invoiceNumber', label: 'No. Faktur', widthClassName: 'w-[260px]', align: 'left' },
    { id: 'invoiceDate', label: 'Tgl Faktur', widthClassName: 'w-[100px]', align: 'left' },
    { id: 'invoiceTotal', label: 'Total Faktur', widthClassName: 'w-[150px]', align: 'right' },
    { id: 'outstanding', label: 'Terhutang', widthClassName: 'w-[150px]', align: 'right' },
    { id: 'paid', label: 'Bayar', widthClassName: 'w-[150px]', align: 'right' },
    { id: 'discount', label: 'Diskon', widthClassName: 'w-[130px]', align: 'right' },
    { id: 'payment', label: 'Pembayaran', widthClassName: 'w-[150px]', align: 'right' },
];

const draftDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
];

const detailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
    createMoreDockAction(),
    createDeleteDockAction(),
];

const salesReceiptTableRows = [];

const salesReceiptDraft = {
    customer: [],
    bankAccounts: [],
    entryDate: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Bank BCA IDR Jakarta (069-773-3993)',
    documentNumber: '',
    currency: '',
    paymentAmount: '0',
    invoiceSearch: '',
    invoices: [],
    paymentMethod: 'Tunai',
    checkNumber: '',
    checkDate: '',
    voided: false,
    branches: ['JAKARTA'],
    __branchId: 1,
    notes: '',
    reconcileStatus: '',
    printStatus: '',
    amountButtons: ['refresh', 'stack'],
    dockActions: draftDockActions,
};

const salesReceiptDetailRecords = {};

export const defaultSalesReceiptConfig = {
    topActions: salesReceiptTopActions,
    labels: {
        customer: 'Terima dari',
        bank: 'Bank',
        paymentAmount: 'Nilai Pembayaran',
        documentNumber: 'No Bukti #',
        entryDate: 'Tgl Bayar',
        paymentMethod: 'Metode Bayar',
        checkDate: 'Tanggal Cek',
        voided: 'V O I D',
        branch: 'Cabang',
        notes: 'Keterangan',
        reconcileStatus: 'Terekonsiliasi',
        printStatus: 'Dicetak/email',
    },
    numberingOptions: ['Bank BCA IDR Jakarta (069-773-3993)'],
    table: {
        createLabel: 'Tambah Penerimaan Penjualan',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        pageValue: '10',
        columns: salesReceiptListColumns,
        rows: salesReceiptTableRows,
        filters: [
            { id: 'date', rowKey: 'date', options: [{ value: 'all', label: 'Tanggal: Semua' }, { value: '10/02/2017', label: 'Tanggal: 10/02/2017' }] },
            { id: 'checkDate', rowKey: 'checkDate', options: [{ value: 'all', label: 'Tanggal Cek: Semua' }, { value: '24/02/2017', label: 'Tanggal Cek: 24/02/2017' }] },
            { id: 'paymentMethod', rowKey: 'paymentMethod', options: [{ value: 'all', label: 'Metode Bayar: Semua' }, { value: 'Tunai', label: 'Metode Bayar: Tunai' }, { value: 'Cek/Giro', label: 'Metode Bayar: Cek/Giro' }] },
            { id: 'bank', rowKey: 'bank', options: [{ value: 'all', label: 'Bank: Semua' }, { value: 'Bank BCA IDR Jakarta (069-773-3993)', label: 'Bank: Bank BCA IDR Jakarta (069-773-3993)' }] },
            { id: 'customer', rowKey: 'customer', options: [{ value: 'all', label: 'Terima dari: Semua' }, { value: 'Pelanggan Umum - Jakarta', label: 'Terima dari: Pelanggan Umum - Jakarta' }] },
        ],
        downloadItems: [{ id: 'download-excel', label: 'Unduh Excel' }, { id: 'download-pdf', label: 'Unduh PDF' }],
        printItems: [{ id: 'print-list', label: 'Cetak daftar penerimaan penjualan' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: salesReceiptSectionTabs,
    invoiceTable: {
        columns: salesReceiptInvoiceColumns,
        emptyLabel: 'Belum ada data',
    },
    draft: salesReceiptDraft,
    detailRecords: salesReceiptDetailRecords,
};

function mergeSalesReceiptConfig(baseConfig, pageConfig = {}) {
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
        invoiceTable: {
            ...baseConfig.invoiceTable,
            ...(pageConfig.invoiceTable ?? {}),
            columns: pageConfig.invoiceTable?.columns ?? baseConfig.invoiceTable.columns,
        },
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

export function buildSalesReceiptConfig(pageConfig = {}) {
    return mergeSalesReceiptConfig(defaultSalesReceiptConfig, pageConfig);
}

export function buildSalesReceiptRecord(row = {}) {
    const detailRecord = salesReceiptDetailRecords[row.id];

    if (detailRecord) {
        return {
            ...salesReceiptDraft,
            ...detailRecord,
        };
    }

    return {
        ...salesReceiptDraft,
        customer: row.customer ? [`[CJKT-0001] ${row.customer}`] : [],
        bankAccounts: row.bank ? [row.bank] : [],
        entryDate: row.date ?? salesReceiptDraft.entryDate,
        autoNumber: false,
        documentNumber: row.number ?? '',
        paymentAmount: row.paymentAmount ?? '0',
        paymentMethod: row.checkNumber ? 'Cek/Giro' : 'Tunai',
        checkNumber: row.checkNumber ?? '',
        checkDate: row.checkDate ?? '',
        notes: row.notes ?? '',
        dockActions: detailDockActions,
        amountButtons: ['refresh'],
    };
}
