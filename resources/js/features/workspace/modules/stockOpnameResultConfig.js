import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const tableColumns = [
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[210px]', align: 'left' },
    { id: 'opnameOrderNumber', label: 'Perintah Opname', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[46%]', align: 'left', truncate: true },
];

const itemTableColumns = [
    { id: 'code', label: 'Kode #', widthClassName: 'w-[160px]', align: 'left' },
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[56%]', align: 'left' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[130px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[120px]', align: 'left' },
];

const sectionTabs = [
    { id: 'items', label: 'Rincian Barang', icon: 'document' },
    { id: 'info', label: 'Info lainnya', icon: 'info' },
];

const createDockActions = [
    createSaveDockAction({ items: [{ id: 'save-close', label: 'Simpan dan tutup' }] }),
    createAttachmentDockAction(),
];

const detailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createAttachmentDockAction(),
    createMoreDockAction({ itemId: 'audit-log', itemLabel: 'Lihat riwayat aktivitas' }),
    createDeleteDockAction(),
];

const draftRecord = {
    autoNumber: true,
    numberingType: 'Hasil Stok Opname',
    date: todayDisplayDate,
    number: '',
    opnameOrder: '',
    notes: '',
    itemSearch: '',
    takeAction: 'Ambil',
    takeOptions: ['Ambil'],
    resultCountLabel: 'Rincian Barang',
    resultItems: [],
    dockActions: createDockActions,
    itemModal: {
        title: 'Rincian Barang',
        deleteLabel: 'Hapus',
        submitLabel: 'Lanjut',
    },
};

const tableRows = [
    {
        id: 'opr-00001',
        date: '14/12/2016',
        number: 'OPR.00001',
        opnameOrderNumber: 'OPO.00001',
        notes: 'Sudah di lakukan penyesuaian barang, dan terdapat selisih karena Barang Hilang',
        dateFilter: 'all',
    },
];

const detailRecords = {
    'opr-00001': {
        autoNumber: false,
        date: '14/12/2016',
        number: 'OPR.00001',
        opnameOrder: 'OPO.00001',
        notes: 'Sudah di lakukan penyesuaian barang, dan terdapat selisih karena Barang Hilang',
        itemSearch: '',
        takeAction: 'Ambil',
        takeOptions: ['Ambil'],
        resultCountLabel: '2 Barang',
        resultItems: [
            {
                id: 'opr-item-1',
                code: '9900001',
                name: 'Headset',
                quantity: '12',
                unit: 'PCS',
            },
            {
                id: 'opr-item-2',
                code: '9900002',
                name: 'Hard Case',
                quantity: '3',
                unit: 'PCS',
            },
        ],
        dockActions: detailDockActions,
    },
};

const defaultConfig = {
    labels: {
        date: 'Tanggal Opname',
        number: 'No. Opname',
        opnameOrder: 'Perintah Opname',
        notes: 'Keterangan',
        itemDetails: 'Rincian Barang',
    },
    numberingOptions: ['Hasil Stok Opname'],
    takeOptions: ['Ambil'],
    orderPlaceholder: 'Cari/Pilih...',
    itemSearchPlaceholder: 'Cari/Pilih Barang & Jasa...',
    infoSectionTitle: 'Info lainnya',
    table: {
        createLabel: 'Tambah Hasil Stok Opname',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        settingsLabel: 'Pengaturan tabel',
        searchPlaceholder: 'Cari...',
        searchWidthClassName: 'sm:w-[340px]',
        pageValue: '1',
        tableClassName: 'min-w-[1080px]',
        columns: tableColumns,
        filters: [
            {
                id: 'date',
                rowKey: 'dateFilter',
                options: [{ value: 'all', label: 'Tanggal: Semua' }],
            },
        ],
        rows: tableRows,
        emptyLabel: 'Belum ada data',
    },
    itemTable: {
        columns: itemTableColumns,
        emptyLabel: 'Belum ada data',
    },
    sectionTabs,
    draft: draftRecord,
    detailRecords,
};

function cloneItems(items = []) {
    return items.map((item) => ({ ...item }));
}

export function buildStockOpnameResultConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        numberingOptions: pageConfig.numberingOptions?.length ? pageConfig.numberingOptions : defaultConfig.numberingOptions,
        takeOptions: pageConfig.takeOptions?.length ? pageConfig.takeOptions : defaultConfig.takeOptions,
        table: {
            ...defaultConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns?.length ? pageConfig.table.columns : defaultConfig.table.columns,
            filters: pageConfig.table?.filters?.length ? pageConfig.table.filters : defaultConfig.table.filters,
            rows: pageConfig.table?.rows?.length ? pageConfig.table.rows : defaultConfig.table.rows,
        },
        itemTable: {
            ...defaultConfig.itemTable,
            ...(pageConfig.itemTable ?? {}),
            columns: pageConfig.itemTable?.columns?.length
                ? pageConfig.itemTable.columns
                : defaultConfig.itemTable.columns,
        },
        sectionTabs: pageConfig.sectionTabs?.length ? pageConfig.sectionTabs : defaultConfig.sectionTabs,
        draft: {
            ...defaultConfig.draft,
            ...(pageConfig.draft ?? {}),
        },
        detailRecords: {
            ...defaultConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildStockOpnameResultRecord(row = {}, config = defaultConfig) {
    const detailRecord = config.detailRecords?.[row.id];
    const source = detailRecord
        ? {
              ...config.draft,
              ...detailRecord,
          }
        : {
              ...config.draft,
              autoNumber: false,
              date: row.date ?? config.draft.date,
              number: row.number ?? config.draft.number,
              opnameOrder: row.opnameOrderNumber ?? config.draft.opnameOrder,
              notes: row.notes ?? config.draft.notes,
              dockActions: detailDockActions,
          };

    return {
        ...source,
        takeOptions: source.takeOptions?.length ? [...source.takeOptions] : [...config.takeOptions],
        resultItems: cloneItems(source.resultItems),
        dockActions: source.dockActions ?? detailDockActions,
        itemModal: {
            ...(config.draft.itemModal ?? {}),
            ...(source.itemModal ?? {}),
        },
    };
}
