import { cloneList, buildItemCountLabel } from '@/features/workspace/modules/shared/configCloneUtils';
import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const itemRequestSectionTabs = [
    { id: 'details', label: 'Rincian Barang', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
];

const itemRequestListColumns = [
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'requestType', label: 'Tipe Permintaan', widthClassName: 'w-[280px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[250px]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[220px]', align: 'left' },
    { id: 'estimatedTotal', label: 'Total Hrg Estimasi', widthClassName: 'w-[200px]', align: 'right' },
];

const itemRequestDetailColumns = [
    { id: 'spacer', label: '', kind: 'spacer', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[40%]', align: 'left' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[170px]', align: 'left' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[120px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[110px]', align: 'left' },
    { id: 'requestDate', label: 'Tgl Diminta', widthClassName: 'w-[150px]', align: 'left' },
];

const itemRequestCreateDockActions = [
    createSaveDockAction(),
    createDocumentDockAction(),
    createAttachmentDockAction({ itemId: 'upload', itemLabel: 'Tambah lampiran' }),
    createMoreDockAction({ itemId: 'duplicate', itemLabel: 'Duplikasi permintaan barang' }),
];

const itemRequestDetailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction(),
    createAttachmentDockAction(),
    createMoreDockAction(),
    createDeleteDockAction(),
];

const itemRequestTableRows = [
    {
        id: 'PR.2016.10.00003',
        number: 'PR.2016.10.00003',
        date: '10/10/2016',
        requestType: 'Beli Barang',
        notes: '',
        status: 'Menunggu diproses',
        estimatedTotal: '0',
        dateFilter: 'all',
        statusFilter: 'pending',
        printedFilter: 'all',
        typeFilter: 'purchase-request',
    },
    {
        id: 'PR.2016.10.00002',
        number: 'PR.2016.10.00002',
        date: '04/10/2016',
        requestType: 'Beli Barang',
        notes: '',
        status: 'Sebagian diproses',
        estimatedTotal: '0',
        dateFilter: 'all',
        statusFilter: 'partial',
        printedFilter: 'all',
        typeFilter: 'purchase-request',
    },
    {
        id: 'PR.2016.10.00001',
        number: 'PR.2016.10.00001',
        date: '03/10/2016',
        requestType: 'Beli Barang',
        notes: 'Stock tersisa sedikit',
        status: 'Selesai',
        estimatedTotal: '0',
        dateFilter: 'all',
        statusFilter: 'completed',
        printedFilter: 'all',
        typeFilter: 'purchase-request',
    },
];

const defaultItemRequestDraft = {
    requestDate: todayDisplayDate,
    requestType: 'Beli Barang',
    autoNumber: true,
    numberingType: 'Permintaan Pembelian',
    documentNumber: '',
    notes: '',
    closeRequest: false,
    branches: ['JAKARTA'],
    itemSearch: '',
    items: [],
    itemModal: {
        title: 'Rincian Barang',
        tabs: [
            { id: 'details', label: 'Rincian Barang' },
            { id: 'info', label: 'Info lainnya' },
        ],
        deleteLabel: 'Hapus',
        submitLabel: 'Lanjut',
    },
    dockActions: itemRequestCreateDockActions,
};

const defaultItemRequestConfig = {
    labels: {
        requestDate: 'Tanggal',
        requestType: 'Tipe Permintaan',
        documentNumber: 'Nomor #',
        notes: 'Keterangan',
        branch: 'Cabang',
        closeRequest: 'Tutup Permintaan',
    },
    requestTypeOptions: ['Beli Barang'],
    numberingOptions: ['Permintaan Pembelian'],
    takeButtonLabel: 'Ambil',
    table: {
        createLabel: 'Tambah Permintaan Barang',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari...',
        pageValue: '3',
        filters: [
            {
                id: 'date',
                label: 'Tanggal',
                value: 'all',
                options: [
                    { value: 'all', label: 'Semua' },
                    { value: '2016', label: '2016' },
                    { value: '2026', label: '2026' },
                ],
            },
            {
                id: 'status',
                label: 'Status',
                value: 'all',
                options: [
                    { value: 'all', label: 'Semua' },
                    { value: 'pending', label: 'Menunggu diproses' },
                    { value: 'partial', label: 'Sebagian diproses' },
                    { value: 'completed', label: 'Selesai' },
                ],
            },
            {
                id: 'printed',
                label: 'Sudah dicetak',
                value: 'all',
                options: [
                    { value: 'all', label: 'Semua' },
                    { value: 'printed', label: 'Sudah' },
                    { value: 'not-printed', label: 'Belum' },
                ],
            },
            {
                id: 'type',
                label: 'Tipe Permintaan',
                value: 'all',
                options: [
                    { value: 'all', label: 'Semua' },
                    { value: 'purchase-request', label: 'Beli Barang' },
                ],
            },
        ],
        columns: itemRequestListColumns,
        rows: itemRequestTableRows,
        downloadItems: [{ id: 'download-list', label: 'Unduh daftar permintaan barang' }],
        printItems: [{ id: 'print-list', label: 'Cetak daftar permintaan barang' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    sectionTabs: itemRequestSectionTabs,
    detailSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
    itemSectionTitle: 'Rincian Barang',
    itemTable: {
        columns: itemRequestDetailColumns,
        emptyLabel: 'Belum ada data',
        copyItems: [{ id: 'copy-lines', label: 'Salin rincian barang' }],
    },
    additionalInfoTitle: 'Info lainnya',
    draft: defaultItemRequestDraft,
    detailRecords: {
        'PR.2016.10.00003': {
            requestDate: '10/10/2016',
            requestType: 'Beli Barang',
            autoNumber: false,
            numberingType: 'Permintaan Pembelian',
            documentNumber: 'PR.2016.10.00003',
            notes: '',
            closeRequest: false,
            branches: ['SURABAYA'],
            items: [
                {
                    id: 'PR.2016.10.00003-item-1',
                    name: 'Anti Gores Iphone 5',
                    code: '9900012',
                    quantity: '100',
                    unit: 'PCS',
                    requestDate: '10/10/2016',
                    department: [],
                    notes: '',
                },
                {
                    id: 'PR.2016.10.00003-item-2',
                    name: 'Headset',
                    code: '9900001',
                    quantity: '50',
                    unit: 'PCS',
                    requestDate: '10/10/2016',
                    department: [],
                    notes: '',
                },
                {
                    id: 'PR.2016.10.00003-item-3',
                    name: 'Soft Case',
                    code: '9900003',
                    quantity: '50',
                    unit: 'PCS',
                    requestDate: '10/10/2016',
                    department: [],
                    notes: '',
                },
            ],
            dockActions: itemRequestDetailDockActions,
        },
    },
};

function cloneItems(items) {
    return (items ?? []).map((item) => ({
        ...item,
        unit: cloneList(item.unit ?? item.unitLabel ?? []),
        department: cloneList(item.department),
    }));
}

function buildRecord(record = {}, draft = defaultItemRequestDraft, fallbackRow = null) {
    const baseRecord = {
        ...draft,
        ...record,
    };
    const items = cloneItems(record.items ?? draft.items ?? []);

    return {
        ...baseRecord,
        requestDate: record.requestDate ?? fallbackRow?.date ?? draft.requestDate,
        requestType: record.requestType ?? fallbackRow?.requestType ?? draft.requestType,
        autoNumber: record.autoNumber ?? false,
        documentNumber: record.documentNumber ?? fallbackRow?.number ?? '',
        branches: cloneList(record.branches ?? draft.branches),
        itemSearch: record.itemSearch ?? draft.itemSearch ?? '',
        items,
        itemCountLabel: record.itemCountLabel ?? buildItemCountLabel(items),
        itemModal: {
            ...(draft.itemModal ?? {}),
            ...(record.itemModal ?? {}),
        },
        dockActions: record.dockActions ?? draft.dockActions,
    };
}

export function mergeItemRequestConfig(baseConfig, pageConfig = {}) {
    return {
        ...baseConfig,
        ...pageConfig,
        labels: {
            ...baseConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        table: {
            ...baseConfig.table,
            ...(pageConfig.table ?? {}),
            filters: pageConfig.table?.filters ?? baseConfig.table.filters,
            columns: pageConfig.table?.columns ?? baseConfig.table.columns,
            rows: pageConfig.table?.rows ?? baseConfig.table.rows,
            downloadItems: pageConfig.table?.downloadItems ?? baseConfig.table.downloadItems,
            printItems: pageConfig.table?.printItems ?? baseConfig.table.printItems,
            settingsItems: pageConfig.table?.settingsItems ?? baseConfig.table.settingsItems,
        },
        sectionTabs: pageConfig.sectionTabs ?? baseConfig.sectionTabs,
        itemTable: {
            ...baseConfig.itemTable,
            ...(pageConfig.itemTable ?? {}),
            columns: pageConfig.itemTable?.columns ?? baseConfig.itemTable.columns,
            copyItems: pageConfig.itemTable?.copyItems ?? baseConfig.itemTable.copyItems,
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

export function buildItemRequestConfig(pageConfig = {}) {
    return mergeItemRequestConfig(defaultItemRequestConfig, pageConfig);
}

export function buildItemRequestRecord(row = {}, config = defaultItemRequestConfig) {
    const detailRecord = config.detailRecords?.[row.id];

    if (detailRecord) {
        return buildRecord(detailRecord, config.draft, row);
    }

    return buildRecord(
        {
            autoNumber: false,
            dockActions: itemRequestDetailDockActions,
        },
        config.draft,
        row,
    );
}
