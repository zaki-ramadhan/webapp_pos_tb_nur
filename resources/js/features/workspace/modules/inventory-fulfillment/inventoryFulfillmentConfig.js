import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const sharedSecondaryDockActions = [
    createDocumentDockAction(),
    createAttachmentDockAction(),
    createMoreDockAction(),
];

const workCompletionSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
];

const workCompletionTableColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[210px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[130px]', align: 'left' },
    { id: 'jobOrderNumber', label: 'Pekerjaan Pesanan', widthClassName: 'w-[180px]', align: 'left' },
    { id: 'completionType', label: 'Tipe Penyelesaian', widthClassName: 'w-[170px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[48%]', align: 'left' },
];

const workCompletionItemColumns = [
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[34%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[160px]', align: 'left' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[140px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'portion', label: 'Porsi [%]', widthClassName: 'w-[140px]', align: 'right' },
    { id: 'costAllocation', label: 'Alokasi Biaya', widthClassName: 'w-[240px]', align: 'right' },
];

const workCompletionTableRows = [
    {
        id: 'RO.2017.02.00001',
        number: 'RO.2017.02.00001',
        date: '15/01/2017',
        jobOrderNumber: 'JC.2017.01.00001',
        completionType: 'Barang',
        notes: '',
    },
    {
        id: 'RO.2016.12.00002',
        number: 'RO.2016.12.00002',
        date: '07/12/2016',
        jobOrderNumber: 'JC.2016.12.00001',
        completionType: 'Barang',
        notes: '',
    },
];

const workCompletionDraft = {
    entryDate: todayDisplayDate,
    jobOrderNumber: '',
    completionType: 'Barang',
    autoNumber: true,
    numberingType: 'Penyelesaian Pesanan',
    documentNumber: '',
    itemSearch: '',
    itemCountLabel: 'Rincian Barang',
    items: [],
    branches: [],
    notes: '',
    dockActions: [
        createSaveDockAction(),
        ...sharedSecondaryDockActions,
    ],
};

const workCompletionDetailRecords = {
    'RO.2017.02.00001': {
        entryDate: '15/01/2017',
        jobOrderNumber: 'JC.2017.01.00001',
        completionType: 'Barang',
        autoNumber: false,
        numberingType: 'Penyelesaian Pesanan',
        documentNumber: 'RO.2017.02.00001',
        itemSearch: '',
        itemCountLabel: '1 Barang (98)',
        items: [
            {
                id: 'RO.2017.02.00001-item-1',
                name: 'Iphone 5 64 GB + Antigores',
                code: '5164003A',
                quantity: '98',
                unit: 'PCS',
                portion: '100',
                costAllocation: '942,126,946.306888',
            },
        ],
        branches: ['JAKARTA'],
    __branchId: 1,
        notes: '',
        dockActions: [
            createSaveDockAction({ tone: 'muted', items: [] }),
            ...sharedSecondaryDockActions,
            createDeleteDockAction(),
        ],
    },
};

const defaultWorkCompletionConfig = {
    topActions: [
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
    ],
    labels: {
        entryDate: 'Tanggal',
        jobOrderNumber: 'No Pekerjaan #',
        completionType: 'Tipe Penyelesaian',
        documentNumber: 'Nomor #',
        branch: 'Cabang',
        notes: 'Keterangan',
    },
    numberingOptions: ['Penyelesaian Pesanan'],
    completionTypeOptions: ['Barang'],
    jobOrderPlaceholder: 'Cari/Pilih...',
    takeButtonLabel: 'Ambil',
    table: {
        createLabel: 'Tambah Penyelesaian Pesanan',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        pageValue: '2',
        columns: workCompletionTableColumns,
        rows: workCompletionTableRows,
        filters: [
            {
                id: 'date',
                rowKey: 'date',
                options: [
                    { value: 'all', label: 'Tanggal: Semua' },
                    { value: '15/01/2017', label: 'Tanggal: 15/01/2017' },
                ],
            },
            {
                id: 'completionType',
                rowKey: 'completionType',
                options: [
                    { value: 'all', label: 'Tipe Penyelesaian: Semua' },
                    { value: 'Barang', label: 'Tipe Penyelesaian: Barang' },
                ],
            },
        ],
        downloadItems: [{ id: 'download', label: 'Unduh data' }],
        printItems: [{ id: 'print', label: 'Cetak daftar' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: workCompletionSectionTabs,
    itemSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
    itemSectionTitle: 'Rincian Barang',
    itemTable: {
        columns: workCompletionItemColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[1080px]',
    },
    additionalInfoTitle: 'Info lainnya',
    draft: workCompletionDraft,
    detailRecords: workCompletionDetailRecords,
};

const defaultOrderFulfillmentConfig = {
    branchOptions: ['[Semua Cabang]'],
    warehouseOptions: ['[Semua Gudang]'],
    actionButtonLabel: 'Perlu Pesan',
    helpButtonLabel: 'Petunjuk',
    table: {
        columns: [
            { id: 'customer', label: 'Pelanggan', widthClassName: 'w-[29%]', align: 'center' },
            { id: 'orderNumber', label: 'No Pesanan #', widthClassName: 'w-[17%]', align: 'center' },
            { id: 'date', label: 'Tanggal', widthClassName: 'w-[12%]', align: 'center' },
            { id: 'shippingDate', label: 'Tgl Pengiriman', widthClassName: 'w-[13%]', align: 'center' },
            { id: 'shipped', label: 'Terkirim', widthClassName: 'w-[14%]', align: 'center' },
            { id: 'deliverable', label: 'Dapat Dikirim', widthClassName: 'w-[15%]', align: 'center' },
        ],
        rows: [],
        emptyLabel: 'Belum ada data',
        tableClassName: 'min-w-[1200px]',
    },
};

export function buildWorkCompletionConfig(pageConfig = {}) {
    return {
        ...defaultWorkCompletionConfig,
        ...pageConfig,
        topActions: pageConfig.topActions ?? defaultWorkCompletionConfig.topActions,
        labels: {
            ...defaultWorkCompletionConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        table: {
            ...defaultWorkCompletionConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns ?? defaultWorkCompletionConfig.table.columns,
            rows: pageConfig.table?.rows ?? defaultWorkCompletionConfig.table.rows,
            filters: pageConfig.table?.filters ?? defaultWorkCompletionConfig.table.filters,
            downloadItems: pageConfig.table?.downloadItems ?? defaultWorkCompletionConfig.table.downloadItems,
            printItems: pageConfig.table?.printItems ?? defaultWorkCompletionConfig.table.printItems,
            settingsItems: pageConfig.table?.settingsItems ?? defaultWorkCompletionConfig.table.settingsItems,
        },
        sectionTabs: pageConfig.sectionTabs ?? defaultWorkCompletionConfig.sectionTabs,
        itemTable: {
            ...defaultWorkCompletionConfig.itemTable,
            ...(pageConfig.itemTable ?? {}),
            columns: pageConfig.itemTable?.columns ?? defaultWorkCompletionConfig.itemTable.columns,
        },
        draft: {
            ...defaultWorkCompletionConfig.draft,
            ...(pageConfig.draft ?? {}),
        },
        detailRecords: {
            ...defaultWorkCompletionConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildWorkCompletionRecord(row = {}, config = defaultWorkCompletionConfig) {
    const detailRecord = config.detailRecords?.[row.id];

    if (detailRecord) {
        return {
            ...config.draft,
            ...detailRecord,
        };
    }

    return {
        ...config.draft,
        entryDate: row.date ?? config.draft.entryDate,
        jobOrderNumber: row.jobOrderNumber ?? '',
        completionType: row.completionType ?? config.draft.completionType,
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? config.draft.numberingType,
        documentNumber: row.number ?? '',
        itemCountLabel: config.itemSectionTitle,
        branches: [],
        notes: row.notes ?? '',
        dockActions: [
            { id: 'save', label: 'Simpan', icon: 'save', tone: 'muted' },
            ...sharedSecondaryDockActions,
            { id: 'delete', label: 'Hapus', icon: 'trash', tone: 'danger' },
        ],
    };
}

export function buildOrderFulfillmentConfig(pageConfig = {}) {
    return {
        ...defaultOrderFulfillmentConfig,
        ...pageConfig,
        table: {
            ...defaultOrderFulfillmentConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns ?? defaultOrderFulfillmentConfig.table.columns,
            rows: pageConfig.table?.rows ?? defaultOrderFulfillmentConfig.table.rows,
        },
    };
}
