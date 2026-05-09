const sectionTabs = [
    { id: 'general', label: 'Informasi umum', icon: 'document' },
    { id: 'expense', label: 'Pengeluaran', icon: 'payment' },
    { id: 'additional-info', label: 'Info Lainnya', icon: 'info' },
];

const tableColumns = [
    { id: 'rowSpacer', label: '', widthClassName: 'w-[44px]', align: 'center' },
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[190px]', align: 'left' },
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[130px]', align: 'left' },
    { id: 'notes', label: 'Keterangan', widthClassName: 'w-[44%]', align: 'left' },
    { id: 'assetName', label: 'Aset Tetap', widthClassName: 'w-[30%]', align: 'center' },
];

const expenseColumns = [
    { id: 'spacer', label: '', widthClassName: 'w-[38px]', align: 'center' },
    { id: 'code', label: 'Kode #', widthClassName: 'w-[180px]', align: 'center' },
    { id: 'description', label: 'Deskripsi', widthClassName: 'w-[56%]', align: 'center' },
    { id: 'amount', label: 'Jumlah', widthClassName: 'w-[180px]', align: 'center' },
];

const createDockActions = [
    { id: 'save', label: 'Simpan', icon: 'save', tone: 'muted' },
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
        id: 'attachment',
        label: 'Lampiran',
        icon: 'paperclip',
        tone: 'secondary',
        items: [{ id: 'manage-attachment', label: 'Kelola lampiran' }],
    },
];

const draftRecord = {
    changeType: 'Data',
    asset: [],
    lastDepreciation: '30/04/2026',
    autoNumber: true,
    numberingType: 'Perubahan Aset Tetap',
    documentNumber: '',
    transactionDate: '30/04/2026',
    bookValue: '0',
    depreciationMethod: 'Tidak Terdepresiasi',
    residualValue: '0',
    changeNotes: '',
    expenseSearch: '',
    expenseRows: [],
    intangibleAsset: false,
    branch: [],
    department: [],
    assetAccount: [],
    taxEnabled: false,
    dockActions: createDockActions,
};

const defaultConfig = {
    labels: {
        changeType: 'Jenis Perubahan',
        asset: 'Aset',
        lastDepreciation: 'Penyusutan Terakhir',
        number: 'Nomor #',
        date: 'Tanggal',
        bookValue: 'Nilai Sisa Buku',
        depreciationMethod: 'Metode Penyusutan',
        residualValue: 'Nilai Sisa',
        changeNotes: 'Keterangan Perubahan',
        expenseTitle: 'Pengeluaran',
        intangibleAsset: 'Aset Tidak Berwujud',
        branch: 'Cabang',
        department: 'Departemen',
        assetAccount: 'Akun Aset',
        tax: 'Pajak',
    },
    changeTypeOptions: ['Data'],
    numberingOptions: ['Perubahan Aset Tetap'],
    depreciationMethodOptions: ['Tidak Terdepresiasi'],
    assetPlaceholder: 'Cari/Pilih...',
    assetSearchLabel: 'Cari aset tetap',
    expenseSearchPlaceholder: 'Cari/Pilih Akun Perkiraan...',
    branchPlaceholder: 'Cari/Pilih...',
    branchSearchLabel: 'Cari cabang',
    departmentPlaceholder: 'Cari/Pilih...',
    departmentSearchLabel: 'Cari departemen',
    assetAccountPlaceholder: 'Cari/Pilih Akun Perkiraan...',
    assetAccountSearchLabel: 'Cari akun aset',
    sectionTabs,
    expenseTable: {
        columns: expenseColumns,
        emptyLabel: 'Belum ada data',
        minWidthClassName: 'min-w-[920px]',
    },
    table: {
        createLabel: 'Tambah Perubahan Aset Tetap',
        refreshLabel: 'Muat ulang',
        settingsLabel: 'Pengaturan tabel',
        searchPlaceholder: 'Cari...',
        searchWidthClassName: 'sm:w-[340px]',
        pageValue: '0',
        tableClassName: 'min-w-[1220px]',
        searchKeys: ['number', 'date', 'notes', 'assetName'],
        filters: [
            {
                id: 'date',
                rowKey: 'dateFilter',
                options: [{ value: 'all', label: 'Tanggal: Semua' }],
            },
        ],
        columns: tableColumns,
        rows: [],
        emptyLabel: 'Belum ada data',
    },
    draft: draftRecord,
    detailRecords: {},
};

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneRows(rows = []) {
    return rows.map((row) => ({ ...row }));
}

export function buildAssetChangeConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        changeTypeOptions: pageConfig.changeTypeOptions?.length
            ? pageConfig.changeTypeOptions
            : defaultConfig.changeTypeOptions,
        numberingOptions: pageConfig.numberingOptions?.length
            ? pageConfig.numberingOptions
            : defaultConfig.numberingOptions,
        depreciationMethodOptions: pageConfig.depreciationMethodOptions?.length
            ? pageConfig.depreciationMethodOptions
            : defaultConfig.depreciationMethodOptions,
        sectionTabs: pageConfig.sectionTabs?.length ? pageConfig.sectionTabs : defaultConfig.sectionTabs,
        expenseTable: {
            ...defaultConfig.expenseTable,
            ...(pageConfig.expenseTable ?? {}),
            columns: pageConfig.expenseTable?.columns?.length
                ? pageConfig.expenseTable.columns
                : defaultConfig.expenseTable.columns,
        },
        table: {
            ...defaultConfig.table,
            ...(pageConfig.table ?? {}),
            filters: pageConfig.table?.filters?.length ? pageConfig.table.filters : defaultConfig.table.filters,
            columns: pageConfig.table?.columns?.length ? pageConfig.table.columns : defaultConfig.table.columns,
            rows: Array.isArray(pageConfig.table?.rows) ? pageConfig.table.rows : defaultConfig.table.rows,
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

export function buildAssetChangeRecord(row = {}, config = defaultConfig) {
    const detailRecord = config.detailRecords?.[row.id];
    const source = detailRecord
        ? {
              ...config.draft,
              ...detailRecord,
          }
        : {
              ...config.draft,
              autoNumber: false,
              documentNumber: row.number ?? config.draft.documentNumber,
              transactionDate: row.date ?? config.draft.transactionDate,
              changeNotes: row.notes ?? config.draft.changeNotes,
              asset: row.assetName ? [row.assetName] : config.draft.asset,
              dockActions: detailDockActions,
          };

    return {
        ...source,
        asset: cloneList(source.asset),
        branch: cloneList(source.branch),
        department: cloneList(source.department),
        assetAccount: cloneList(source.assetAccount),
        expenseRows: cloneRows(source.expenseRows),
        dockActions: row.id ? detailDockActions : createDockActions,
    };
}
