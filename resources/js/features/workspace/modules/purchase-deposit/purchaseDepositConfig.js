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
    { id: 'number', label: 'Nomor', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'supplierShort', label: 'Pemasok', widthClassName: 'w-[220px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[45%]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'total', label: 'Total', widthClassName: 'w-[160px]', align: 'right' },
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
    currency: '',
    depositAmount: '0',
    purchaseInvoiceNumber: '',
    taxEnabled: false,
    taxIncluded: true,
    address: '',
    notes: '',
    paidFromAccount: [],
    dockActions: draftDockActions,
};

const defaultPurchaseDepositConfig = {
    topActions: purchaseDepositTopActions,
    labels: {
        supplier: 'Pemasok',
        entryDate: 'Tanggal',
        documentNumber: 'Nomor #',
        currency: 'Mata Uang',
        depositAmount: 'Uang Muka',
        taxIncluded: 'Termasuk Pajak',
        tax: 'PPN',
        taxInvoiceNumber: 'Nomor Faktur Pajak',
        taxInvoiceDate: 'Tanggal Faktur Pajak',
        taxTransactionType: 'Jenis Transaksi',
        address: 'Alamat',
        notes: 'Keterangan',
        paidFromAccount: 'Akun Kas / Bank',
    },
    sectionTabs: purchaseDepositSectionTabs,
    table: {
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
