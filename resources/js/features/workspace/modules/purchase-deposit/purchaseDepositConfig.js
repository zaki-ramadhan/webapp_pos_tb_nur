import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import {
    createAttachmentDockAction,
    createDocumentDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';

const todayDisplayDate = buildTodayDisplayDate();

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
];

const purchaseDepositListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[160px]', align: 'left' },
    { id: 'invoiceNumber', label: 'No Faktur #', widthClassName: 'w-[160px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'supplier', label: 'Pemasok', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[30%]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'age', label: 'Umur (hr)', widthClassName: 'w-[100px]', align: 'right' },
    { id: 'total', label: 'Total', widthClassName: 'w-[150px]', align: 'right' },
];

const draftDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
];

const purchaseDepositDraft = {
    supplier: [],
    entryDate: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Uang Muka Pembelian',
    documentNumber: '',
    depositAmount: '0',
    taxEnabled: false,
    taxIncluded: true,
    taxInvoiceDate: todayDisplayDate,
    taxTransactionType: 'Faktur Pajak',
    taxInvoiceNumber: '',
    taxRate: 0,
    bankAccounts: [],
    address: '',
    notes: '',
    summary: [],
    approvalStamp: '',
    statusStamp: '',
    statusTone: 'gray',
    processButtonLabel: 'Proses',
    dockActions: draftDockActions,
    subtotal: '0',
    taxTotalFormatted: 'Rp 0',
    total: '0',
};

const defaultPurchaseDepositConfig = {
    topActions: purchaseDepositTopActions,
    labels: {
        supplier: 'Pemasok',
        entryDate: 'Tanggal',
        documentNumber: 'No Form #',
        depositAmount: 'Uang Muka',
        tax: 'Pajak',
        taxIncluded: 'Total termasuk Pajak',
        taxName: 'PPN',
        taxInvoiceNumber: 'No. Faktur Pajak',
        taxInvoiceDate: 'Tgl Faktur Pajak',
        taxTransactionType: 'Tipe Transaksi',
        address: 'Alamat',
        notes: 'Keterangan',
        bankAccount: 'Rekening Bank',
    },
    numberingOptions: ['Uang Muka Pembelian'],
    sectionTabs: purchaseDepositSectionTabs,
    table: {
        createLabel: 'Tambah Uang Muka Pembelian',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari data...',
        pageValue: '1',
        columns: purchaseDepositListColumns,
        rows: [],
        filters: [
            {
                id: 'date',
                rowKey: 'dateFilter',
                options: [{ value: 'all', label: 'Tanggal: Semua' }],
            },
            {
                id: 'supplier',
                rowKey: 'supplierFilter',
                options: [{ value: 'all', label: 'Pemasok: Semua' }],
            },
            {
                id: 'status',
                rowKey: 'statusFilter',
                options: [{ value: 'all', label: 'Status: Semua' }],
            },
        ],
    },
    draft: purchaseDepositDraft,
    infoTitle: 'Info lainnya',
    depositTitle: 'Uang Muka',
    summaryTitle: 'Informasi Faktur',
};

export function buildPurchaseDepositConfig(customConfig = {}) {
    return {
        ...defaultPurchaseDepositConfig,
        ...customConfig,
        labels: {
            ...defaultPurchaseDepositConfig.labels,
            ...(customConfig.labels || {}),
        },
        draft: {
            ...defaultPurchaseDepositConfig.draft,
            ...(customConfig.draft || {}),
        },
        table: {
            ...defaultPurchaseDepositConfig.table,
            ...(customConfig.table || {}),
            columns: customConfig.table?.columns || defaultPurchaseDepositConfig.table.columns,
            filters: customConfig.table?.filters || defaultPurchaseDepositConfig.table.filters,
        },
    };
}
