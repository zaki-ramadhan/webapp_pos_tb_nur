import { sharedDetailDockActions } from '@/features/workspace/modules/sales-document/salesDocumentConfigCore';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import {
    createAttachmentDockAction,
    createDocumentDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';

const todayDisplayDate = buildTodayDisplayDate();

const salesDepositTopActions = [
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

const salesDepositSectionTabs = [
    { id: 'deposit', label: 'Uang Muka', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
];

const salesDepositListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'customerShort', label: 'Pelanggan', widthClassName: 'w-[190px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[45%]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'requiredIdType', label: 'Tipe ID Wajib Pajak', widthClassName: 'w-[140px]', align: 'left' },
    { id: 'age', label: 'Umur (hr)', widthClassName: 'w-[100px]', align: 'right' },
    { id: 'total', label: 'Total', widthClassName: 'w-[150px]', align: 'right' },
];

const salesDepositTableRows = [];

const draftDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
];

const salesDepositDraft = {
    customer: [],
    entryDate: todayDisplayDate,
    autoNumber: true,
    numberingType: 'Faktur Penjualan',
    documentNumber: '',
    currency: '',
    depositAmount: '0',
    purchaseOrderNumber: '',
    taxEnabled: false,
    taxIncluded: true,
    address: '',
    notes: '',
    summary: [],
    usedDepositRows: [],
    approvalStamp: '',
    statusStamp: '',
    statusTone: 'gray',
    processButtonLabel: '',
    dockActions: draftDockActions,
    subtotal: '0',
    total: '0',
};

const salesDepositDetailRecords = {};

export const defaultSalesDepositConfig = {
    topActions: salesDepositTopActions,
    labels: {
        customer: 'Pelanggan',
        entryDate: 'Tanggal',
        documentNumber: 'No Faktur #',
        depositAmount: 'Uang Muka',
        purchaseOrderNumber: 'No. PO',
        tax: 'Pajak',
        paymentTerms: 'Syarat Pembayaran',
        address: 'Alamat',
        branch: 'Cabang',
        notes: 'Keterangan',
    },
    numberingOptions: ['Faktur Penjualan', 'Uang Muka Penjualan'],
    table: {
        createLabel: 'Tambah Uang Muka Penjualan',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari...',
        pageValue: '2',
        columns: salesDepositListColumns,
        rows: salesDepositTableRows,
        filters: [
            { id: 'date', rowKey: 'date', options: [{ value: 'all', label: 'Tanggal: Semua' }] },
            { id: 'customer', rowKey: 'customer', options: [{ value: 'all', label: 'Pelanggan: Semua' }] },
            { id: 'status', rowKey: 'status', options: [{ value: 'all', label: 'Status: Semua' }] },
        ],
    },
    sectionTabs: salesDepositSectionTabs,
    draft: salesDepositDraft,
    detailRecords: salesDepositDetailRecords,
    infoTitle: 'Info lainnya',
    depositTitle: 'Uang Muka',
    smartlinkTitle: 'Pembayaran melalui SmartLink e-Payment',
    summaryTitle: 'Informasi Faktur',
    usedDepositTitle: 'Uang Muka Terpakai/Retur',
};

function mergeSalesDepositConfig(baseConfig, pageConfig = {}) {
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

export function buildSalesDepositConfig(pageConfig = {}) {
    return mergeSalesDepositConfig(defaultSalesDepositConfig, pageConfig);
}

export function buildSalesDepositRecord(row = {}) {
    const detailRecord = salesDepositDetailRecords[row.id];

    if (detailRecord) {
        return {
            ...salesDepositDraft,
            ...detailRecord,
        };
    }

    return {
        ...salesDepositDraft,
        customer: row.customer ? [`[CSBY-0005] ${row.customer}`] : [],
        entryDate: row.date ?? salesDepositDraft.entryDate,
        autoNumber: false,
        documentNumber: row.number ?? '',
        currency: 'IDR',
        summary: [
            ['Total', `Rp ${row.total ?? '0'}`],
            ['Uang Muka Terpakai/Retur', 'Rp 0'],
            ['Sisa Uang Muka', `Rp ${row.total ?? '0'}`],
            ['Pembayaran', 'Rp 0'],
            ['Retur', 'Rp 0'],
            ['Piutang', `Rp ${row.total ?? '0'}`],
            ['Status', row.status ?? '-'],
            ['Dicetak/email', 'Belum cetak/email'],
        ],
        approvalStamp: 'DISETUJUI',
        statusStamp: (row.status ?? '').toUpperCase(),
        statusTone: row.status === 'Lunas' ? 'green' : 'gray',
        processButtonLabel: 'Proses',
        dockActions: sharedDetailDockActions,
        subtotal: `Rp ${row.total ?? '0'}`,
        total: `Rp ${row.total ?? '0'}`,
    };
}
