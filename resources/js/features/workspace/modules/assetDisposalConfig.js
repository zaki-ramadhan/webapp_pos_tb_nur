const sectionTabs = [{ id: 'general', label: 'Informasi umum', icon: 'document' }];

const createDockActions = [
    {
        id: 'save',
        label: 'Simpan',
        icon: 'save',
        tone: 'muted',
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
    {
        id: 'save',
        label: 'Simpan',
        icon: 'save',
        tone: 'muted',
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
    {
        id: 'delete',
        label: 'Hapus',
        icon: 'trash',
        tone: 'danger',
    },
];

const draftRecord = {
    asset: [],
    lastDepreciation: '29/04/2026',
    bookValue: '0',
    autoNumber: true,
    numberingType: 'Disposisi Aset Tetap',
    transactionDate: '29/04/2026',
    quantity: '',
    profitLossAccount: [],
    assetLocation: [],
    notes: '',
    soldAsset: false,
    dockActions: createDockActions,
};

const defaultConfig = {
    labels: {
        asset: 'Aset',
        lastDepreciation: 'Penyusutan Terakhir',
        bookValue: 'Nilai Sisa Buku',
        number: 'Nomor #',
        date: 'Tanggal',
        quantity: 'Kuantitas',
        profitLossAccount: 'Akun Laba Rugi',
        assetLocation: 'Lokasi Aset',
        notes: 'Catatan',
        soldAsset: 'Aset Dijual',
    },
    numberingOptions: ['Disposisi Aset Tetap'],
    sectionTabs,
    table: {
        createLabel: 'Tambah Disposisi Aset Tetap',
        refreshLabel: 'Muat ulang',
        settingsLabel: 'Pengaturan tabel',
        filterButtonLabel: 'Filter lanjutan',
        searchPlaceholder: 'Cari...',
        searchWidthClassName: 'sm:w-[340px]',
        pageValue: '0',
        tableClassName: 'min-w-[1080px]',
        searchKeys: ['number', 'date', 'notes', 'assetName'],
        filters: [
            {
                id: 'date',
                rowKey: 'dateFilter',
                options: [{ value: 'all', label: 'Tanggal: Semua' }],
            },
        ],
        columns: [
            { id: 'number', label: 'Nomor #', widthClassName: 'w-[220px]', align: 'left' },
            { id: 'date', label: 'Tanggal', widthClassName: 'w-[130px]', align: 'left' },
            { id: 'notes', label: 'Keterangan', widthClassName: 'w-[42%]', align: 'left' },
            { id: 'assetName', label: 'Aset Tetap', widthClassName: 'w-[28%]', align: 'left' },
        ],
        rows: [],
        emptyLabel: 'Belum ada data',
    },
    draft: draftRecord,
    detailRecords: {},
};

export function buildAssetDisposalConfig(pageConfig = {}) {
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

export function buildAssetDisposalRecord(row = {}, config = defaultConfig) {
    const detailRecord = config.detailRecords?.[row.id];
    const source = detailRecord
        ? {
              ...config.draft,
              ...detailRecord,
          }
        : {
              ...config.draft,
              autoNumber: false,
              transactionDate: row.date ?? config.draft.transactionDate,
              notes: row.notes ?? config.draft.notes,
              asset: row.assetName ? [row.assetName] : config.draft.asset,
              dockActions: detailDockActions,
          };

    return {
        ...source,
        asset: Array.isArray(source.asset) ? [...source.asset] : source.asset ? [source.asset] : [],
        profitLossAccount: Array.isArray(source.profitLossAccount)
            ? [...source.profitLossAccount]
            : source.profitLossAccount
              ? [source.profitLossAccount]
              : [],
        assetLocation: Array.isArray(source.assetLocation)
            ? [...source.assetLocation]
            : source.assetLocation
              ? [source.assetLocation]
              : [],
        dockActions: source.dockActions ?? detailDockActions,
    };
}
