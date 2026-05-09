import {
    createAttachmentDockAction,
    createDeleteDockAction,
    createDocumentDockAction,
    createMoreDockAction,
    createSaveDockAction,
} from '@/features/workspace/modules/shared/workspaceDockActions';

const tableColumns = [
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'startDate', label: 'Tanggal Mulai', widthClassName: 'w-[140px]', align: 'left' },
    { id: 'warehouse', label: 'Gudang', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'status', label: 'Status', widthClassName: 'w-[140px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[42%]', align: 'left' },
    { id: 'responsiblePerson', label: 'Penanggung Jawab', widthClassName: 'w-[200px]', align: 'left' },
];

const resultColumns = [
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[52%]', align: 'left' },
    { id: 'code', label: 'Kode Barang', widthClassName: 'w-[180px]', align: 'left' },
    { id: 'systemQuantity', label: 'Kuantitas (Sistem)', widthClassName: 'w-[150px]', align: 'right' },
    { id: 'countedQuantity', label: 'Kuantitas (Hitung)', widthClassName: 'w-[150px]', align: 'right' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[110px]', align: 'left' },
];

const createSectionTabs = [{ id: 'info', label: 'Perintah Stok Opname', icon: 'info' }];

const detailSectionTabs = [
    { id: 'info', label: 'Perintah Stok Opname', icon: 'info' },
    { id: 'results', label: 'Hasil Hitung Stok Opname', icon: 'document' },
    { id: 'process', label: 'Informasi Proses', icon: 'payment' },
];

const createDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction({ label: 'Dokumen', itemId: 'linked-document', itemLabel: 'Buka dokumen terkait' }),
    createAttachmentDockAction(),
];

const detailDockActions = [
    createSaveDockAction({ tone: 'muted', items: [] }),
    createDocumentDockAction({ label: 'Dokumen', itemId: 'linked-document', itemLabel: 'Buka dokumen terkait' }),
    createAttachmentDockAction(),
    createMoreDockAction({ itemId: 'audit-log', itemLabel: 'Lihat riwayat aktivitas' }),
    createDeleteDockAction(),
];

const draftRecord = {
    autoNumber: true,
    numberingType: 'Perintah Stok Opname',
    date: '29/04/2026',
    number: '',
    status: '',
    branches: ['JAKARTA'],
    department: [],
    startDate: '29/04/2026',
    responsiblePerson: '',
    workers: [],
    notes: '',
    warehouse: [],
    category: [],
    supplier: [],
    brand: [],
    resultSearch: '',
    resultFilter: 'all',
    resultItems: [],
    resultCountLabel: 'Hasil Hitung Stok Opname',
    processSummaryRows: [],
    processHistoryRows: [],
    itemModal: {
        title: 'Rincian Barang',
        submitLabel: 'Lanjut',
    },
    dockActions: createDockActions,
};

const tableRows = [
    {
        id: 'opo-00001',
        date: '17/12/2016',
        number: 'OPO.00001',
        startDate: '11/12/2016',
        warehouse: 'GD. JAKARTA',
        status: 'Selesai',
        notes: 'Harap lakukan stock opname guna mengetahui barang yang sesungguhnya di gudang',
        responsiblePerson: 'Fandy',
        dateFilter: 'all',
        statusFilter: 'done',
    },
];

const detailRecords = {
    'opo-00001': {
        autoNumber: false,
        number: 'OPO.00001',
        date: '17/12/2016',
        status: 'Selesai',
        branches: ['JAKARTA'],
        department: [],
        startDate: '11/12/2016',
        responsiblePerson: 'Fandy',
        workers: ['Vando Rufi Sundawan'],
        notes: 'Harap lakukan stock opname guna mengetahui barang yang sesungguhnya di gudang',
        warehouse: ['GD. JAKARTA'],
        category: [],
        supplier: [],
        brand: [],
        resultSearch: '',
        resultFilter: 'all',
        resultItems: [
            {
                id: 'opo-item-1',
                code: '9900001',
                name: 'Headset',
                systemQuantity: '0',
                countedQuantity: '12',
                unit: 'PCS',
            },
            {
                id: 'opo-item-2',
                code: '9900002',
                name: 'Hard Case',
                systemQuantity: '0',
                countedQuantity: '3',
                unit: 'PCS',
            },
        ],
        resultCountLabel: 'Hasil Hitung Stok Opname ( 2 Barang )',
        processSummaryRows: [
            { id: 'adjustment-number', label: 'Nomor Penyesuaian', value: 'IA.2016.12.00002', tone: 'link' },
            { id: 'adjustment-date', label: 'Tanggal Penyesuaian', value: '18/12/2016' },
            { id: 'planned-items', label: 'Jumlah Barang (Rencana Stok Opname)', value: '2' },
            { id: 'counted-items', label: 'Jumlah Barang (Hasil Stok Opname)', value: '2' },
            { id: 'adjusted-items', label: 'Jumlah Barang (Penyesuaian Stok)', value: '2' },
        ],
        processHistoryRows: [
            {
                id: 'opr-00001',
                number: 'OPR.00001',
                date: '14/12/2016',
                itemCount: '2 Barang',
                worker: 'Vando Rufi Sundawan',
            },
        ],
        dockActions: detailDockActions,
    },
};

const defaultConfig = {
    labels: {
        date: 'Tanggal SPK',
        number: 'No. SPK',
        status: 'Status',
        branch: 'Cabang',
        department: 'Departemen',
        startDate: 'Tanggal Mulai',
        responsiblePerson: 'Penanggung Jawab',
        workers: 'Dikerjakan oleh',
        notes: 'Keterangan',
        warehouse: 'Gudang',
        category: 'Kategori Barang',
        supplier: 'Pemasok Barang',
        brand: 'Merek Barang',
    },
    numberingOptions: ['Perintah Stok Opname'],
    infoSectionTitle: 'Perintah Stok Opname',
    resultFilterOptions: [{ value: 'all', label: 'Semua Barang' }],
    searchPlaceholder: 'Cari...',
    resultSearchPlaceholder: 'Pencarian Barang ...',
    table: {
        createLabel: 'Tambah Perintah Stok Opname',
        refreshLabel: 'Muat ulang',
        pageValue: '1',
        searchPlaceholder: 'Cari...',
        filters: [
            {
                id: 'date',
                label: 'Tanggal',
                value: 'all',
                options: [{ value: 'all', label: 'Semua' }],
            },
            {
                id: 'status',
                label: 'Status',
                value: 'all',
                options: [
                    { value: 'all', label: 'Semua' },
                    { value: 'done', label: 'Selesai' },
                ],
            },
        ],
        columns: tableColumns,
        rows: tableRows,
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    resultTable: {
        columns: resultColumns,
        emptyLabel: 'Belum ada data',
    },
    createSectionTabs,
    detailSectionTabs,
    draft: draftRecord,
    detailRecords,
};

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneResultItems(items = []) {
    return items.map((item) => ({ ...item }));
}

function cloneProcessRows(rows = []) {
    return rows.map((row) => ({ ...row }));
}

export function buildStockOpnameOrderConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        numberingOptions: pageConfig.numberingOptions?.length ? pageConfig.numberingOptions : defaultConfig.numberingOptions,
        resultFilterOptions: pageConfig.resultFilterOptions?.length
            ? pageConfig.resultFilterOptions
            : defaultConfig.resultFilterOptions,
        table: {
            ...defaultConfig.table,
            ...(pageConfig.table ?? {}),
            filters: pageConfig.table?.filters?.length ? pageConfig.table.filters : defaultConfig.table.filters,
            columns: pageConfig.table?.columns?.length ? pageConfig.table.columns : defaultConfig.table.columns,
            rows: pageConfig.table?.rows?.length ? pageConfig.table.rows : defaultConfig.table.rows,
            settingsItems: pageConfig.table?.settingsItems?.length
                ? pageConfig.table.settingsItems
                : defaultConfig.table.settingsItems,
        },
        resultTable: {
            ...defaultConfig.resultTable,
            ...(pageConfig.resultTable ?? {}),
            columns: pageConfig.resultTable?.columns?.length
                ? pageConfig.resultTable.columns
                : defaultConfig.resultTable.columns,
        },
        createSectionTabs: pageConfig.createSectionTabs?.length
            ? pageConfig.createSectionTabs
            : defaultConfig.createSectionTabs,
        detailSectionTabs: pageConfig.detailSectionTabs?.length
            ? pageConfig.detailSectionTabs
            : defaultConfig.detailSectionTabs,
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

export function buildStockOpnameOrderRecord(row = {}, config = defaultConfig) {
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
              status: row.status ?? config.draft.status,
              startDate: row.startDate ?? config.draft.startDate,
              notes: row.notes ?? config.draft.notes,
              responsiblePerson: row.responsiblePerson ?? config.draft.responsiblePerson,
              warehouse: row.warehouse ? [row.warehouse] : cloneList(config.draft.warehouse),
              dockActions: detailDockActions,
          };

    return {
        ...source,
        branches: cloneList(source.branches),
        department: cloneList(source.department),
        workers: cloneList(source.workers),
        warehouse: cloneList(source.warehouse),
        category: cloneList(source.category),
        supplier: cloneList(source.supplier),
        brand: cloneList(source.brand),
        resultItems: cloneResultItems(source.resultItems),
        processSummaryRows: cloneProcessRows(source.processSummaryRows),
        processHistoryRows: cloneProcessRows(source.processHistoryRows),
        dockActions: source.dockActions ?? detailDockActions,
    };
}
