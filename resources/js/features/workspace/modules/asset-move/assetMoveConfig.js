import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const sectionTabs = [
    { id: 'details', label: 'Detail Aset', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
];

const itemTableColumns = [
    { id: 'code', label: 'Kode Aset', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'description', label: 'Deskripsi Aset', widthClassName: 'w-[62%]', align: 'left' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[130px]', align: 'right' },
];

const createDockActions = [
    {
        id: 'save',
        label: 'Simpan',
        icon: 'save',
        tone: 'primary',
        items: [{ id: 'save-close', label: 'Simpan dan tutup' }],
    },
    {
        id: 'document',
        label: 'Dokumen',
        icon: 'document',
        tone: 'secondary',
        items: [{ id: 'open-related', label: 'Buka dokumen terkait' }],
    },
    {
        id: 'attachment',
        label: 'Lampiran',
        icon: 'paperclip',
        tone: 'secondary',
        items: [{ id: 'manage-attachment', label: 'Kelola lampiran' }],
    },
];

const detailDockActions = [
    { id: 'save', label: 'Simpan', icon: 'save', tone: 'muted' },
    {
        id: 'document',
        label: 'Dokumen',
        icon: 'document',
        tone: 'secondary',
        items: [{ id: 'open-related', label: 'Buka dokumen terkait' }],
    },
    {
        id: 'attachment',
        label: 'Lampiran',
        icon: 'paperclip',
        tone: 'secondary',
        items: [{ id: 'manage-attachment', label: 'Kelola lampiran' }],
    },
    {
        id: 'more',
        label: 'Lainnya',
        icon: 'kebab',
        tone: 'success',
        items: [{ id: 'audit-log', label: 'Lihat riwayat aktivitas' }],
    },
    { id: 'delete', label: 'Hapus', icon: 'trash', tone: 'danger' },
];

const tableRows = [];

const draftRecord = {
    autoNumber: true,
    numberingType: 'Pindah Aset',
    number: '',
    date: todayDisplayDate,
    sourceAddress: [],
    destinationAddress: [],
    itemSearch: '',
    notes: '',
    sourceAddressDetail: '',
    destinationAddressDetail: '',
    items: [],
    dockActions: createDockActions,
    itemModal: {
        title: 'Detail Aset',
        tabs: [
            { id: 'details', label: 'Detail Aset' },
            { id: 'notes', label: 'Keterangan' },
        ],
        deleteLabel: 'Hapus',
        submitLabel: 'Lanjut',
    },
};

const detailRecords = {};

const defaultConfig = {
    labels: {
        date: 'Tanggal',
        sourceAddress: 'Alamat Asal',
        destinationAddress: 'Alamat Tujuan',
        number: 'No. Pemindahan #',
        notes: 'Keterangan',
        assetDetails: 'Detail Aset',
    },
    numberingOptions: ['Pindah Aset'],
    sectionTabs,
    table: {
        createLabel: 'Tambah Pindah Aset',
        refreshLabel: 'Muat ulang',
        settingsLabel: 'Pengaturan tabel',
        searchPlaceholder: 'Cari...',
        searchWidthClassName: 'sm:w-[340px]',
        pageValue: '1',
        tableClassName: 'min-w-[1120px]',
        searchKeys: ['number', 'date', 'notes', 'sourceAddressName', 'destinationAddressName'],
        filters: [
            {
                id: 'date',
                rowKey: 'dateFilter',
                options: [{ value: 'all', label: 'Tanggal: Semua' }],
            },
            {
                id: 'source',
                rowKey: 'sourceFilter',
                options: [{ value: 'all', label: 'Alamat Asal: Semua' }],
            },
            {
                id: 'destination',
                rowKey: 'destinationFilter',
                options: [{ value: 'all', label: 'Alamat Tujuan: Semua' }],
            },
        ],
        columns: [
            { id: 'number', label: 'Nomor #', widthClassName: 'w-[220px]', align: 'left' },
            { id: 'date', label: 'Tanggal', widthClassName: 'w-[130px]', align: 'left' },
            { id: 'notes', label: 'Keterangan', widthClassName: 'w-[46%]', align: 'left' },
            { id: 'sourceAddressName', label: 'Alamat Asal', widthClassName: 'w-[180px]', align: 'left' },
            { id: 'destinationAddressName', label: 'Alamat Tujuan', widthClassName: 'w-[180px]', align: 'left' },
        ],
        rows: tableRows,
        emptyLabel: 'Belum ada data',
    },
    itemTable: {
        columns: itemTableColumns,
        emptyLabel: 'Belum ada data',
    },
    detailSearchPlaceholder: 'Cari/Pilih...',
    additionalInfoTitle: 'Info lainnya',
    draft: draftRecord,
    detailRecords,
};

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneItems(items = []) {
    return items.map((item) => ({ ...item }));
}

function buildItemCountLabel(items = []) {
    if (!items.length) {
        return 'Detail Aset';
    }

    return `${items.length} Aset`;
}

export function buildAssetMoveConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        numberingOptions: pageConfig.numberingOptions?.length ? pageConfig.numberingOptions : defaultConfig.numberingOptions,
        sectionTabs: pageConfig.sectionTabs?.length ? pageConfig.sectionTabs : defaultConfig.sectionTabs,
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
            columns: pageConfig.itemTable?.columns?.length ? pageConfig.itemTable.columns : defaultConfig.itemTable.columns,
        },
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

export function buildAssetMoveRecord(row = {}, config = defaultConfig) {
    const detailRecord = config.detailRecords?.[row.id];
    const source = detailRecord
        ? {
              ...config.draft,
              ...detailRecord,
          }
        : {
              ...config.draft,
              autoNumber: false,
              number: row.number ?? '',
              numberingType: row.number ?? config.draft.numberingType,
              date: row.date ?? config.draft.date,
              sourceAddress: row.sourceAddressName ? [row.sourceAddressName] : config.draft.sourceAddress,
              destinationAddress: row.destinationAddressName ? [row.destinationAddressName] : config.draft.destinationAddress,
              notes: row.notes ?? config.draft.notes,
              dockActions: detailDockActions,
          };

    const items = cloneItems(source.items ?? []);

    return {
        ...source,
        sourceAddress: cloneList(source.sourceAddress),
        destinationAddress: cloneList(source.destinationAddress),
        items,
        itemCountLabel: source.itemCountLabel ?? buildItemCountLabel(items),
        dockActions: source.dockActions?.length ? source.dockActions : detailDockActions,
        itemModal: {
            ...config.draft.itemModal,
            ...(source.itemModal ?? {}),
        },
    };
}
