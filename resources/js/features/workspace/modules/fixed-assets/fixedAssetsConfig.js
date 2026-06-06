import { cloneList } from '@/features/workspace/modules/shared/configCloneUtils';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';

const todayDisplayDate = buildTodayDisplayDate();

const tableColumns = [
    { id: 'status', label: '#', widthClassName: 'w-[56px]', align: 'center', sortable: false },
    { id: 'number', label: 'Nomor #', widthClassName: 'w-[220px]', align: 'left' },
    { id: 'name', label: 'Nama Aset', widthClassName: 'w-[28%]', align: 'left' },
    { id: 'purchaseDate', label: 'Tanggal Beli', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[120px]', align: 'right' },
    { id: 'totalAsset', label: 'Total Aset', widthClassName: 'w-[190px]', align: 'right' },
];

const sectionTabs = [
    { id: 'general', label: 'Informasi umum', icon: 'document' },
    { id: 'additional-info', label: 'Info lainnya', icon: 'info' },
    { id: 'expense-account', label: 'Akun pengeluaran', icon: 'payment' },
    { id: 'asset-location', label: 'Lokasi aset', icon: 'location' },
];

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
];

const processItems = [
    { id: 'depreciation', label: 'Jalankan penyusutan' },
    { id: 'transfer', label: 'Pindah aset' },
];

const fixedAssetRows = [
    ['fixed-asset-0502009', '0502009', 'Komputer 09', '17/03/2016', '1', '7,350,000'],
    ['fixed-asset-0302004', '0302004', 'Mobil Xenia L 1291 ARI', '10/03/2016', '1', '220,000,000'],
    ['fixed-asset-0302003', '0302003', 'Mobil Spin L 4919 EKO', '10/03/2016', '1', '260,000,000'],
    ['fixed-asset-0301005', '0301005', 'Mobil Avanza Tipe G B 4720 FND', '08/03/2016', '1', '250,000,000'],
    ['fixed-asset-0502008', '0502008', 'Komputer 08', '05/02/2016', '1', '7,350,000'],
    ['fixed-asset-0502007', '0502007', 'Komputer 07', '05/02/2016', '1', '7,350,000'],
    ['fixed-asset-0301004', '0301004', 'Mobil Avanza Veloz B 1019 RNI', '04/02/2016', '1', '250,000,000'],
    ['fixed-asset-0301003', '0301003', 'Mobil HRV B 4383 JHN', '22/12/2015', '1', '250,000,000'],
    ['fixed-asset-0501039', '0501039', 'Komputer 06', '15/12/2015', '1', '7,350,000'],
    ['fixed-asset-0501038', '0501038', 'Komputer 05', '15/12/2015', '1', '7,350,000'],
    ['fixed-asset-0402005', '0402005', 'Motor Beat Pop L 1391 SBY', '01/12/2015', '1', '15,500,000'],
    ['fixed-asset-0401006', '0401006', 'Motor Vario Techno 125 B 1930 POP', '01/12/2015', '1', '18,500,000'],
    ['fixed-asset-0301002', '0301002', 'Mobil Pajero B 7192 VND', '26/11/2015', '1', '750,000,000'],
    ['fixed-asset-0501047', '0501047', 'TV 42 Inc', '11/11/2015', '1', '41,000,000'],
    ['fixed-asset-0501037', '0501037', 'Komputer 04', '10/11/2015', '1', '7,350,000'],
    ['fixed-asset-0501036', '0501036', 'Komputer 03', '10/11/2015', '1', '7,350,000'],
    ['fixed-asset-0501035', '0501035', 'Komputer 02', '10/11/2015', '1', '7,350,000'],
    ['fixed-asset-0302002', '0302002', 'Mobil HRV B 8492 ERC', '24/10/2015', '1', '300,000,000'],
    ['fixed-asset-0302001', '0302001', 'Mobil CRV L 3819 MMD', '21/09/2015', '1', '600,000,000'],
];

const tableRows = fixedAssetRows.map(([id, number, name, purchaseDate, quantity, totalAsset]) => ({
    id,
    status: 'checked',
    number,
    name,
    purchaseDate,
    quantity,
    totalAsset,
    categoryFilter: 'all',
}));

const draftRecord = {
    autoCode: true,
    codeType: 'Aset Tetap',
    code: '',
    name: '',
    purchaseDate: todayDisplayDate,
    usageDate: todayDisplayDate,
    intangibleAsset: false,
    depreciationMethod: 'Metode Garis Lurus',
    assetAccount: [],
    accumulatedDepreciationAccount: [],
    depreciationExpenseAccount: [],
    quantity: '1',
    assetLifeYears: '',
    assetLifeMonths: '',
    ratio: '0',
    residualValue: '0',
    category: [],
    branch: ['JAKARTA'],
    department: [],
    initialLocation: [],
    notes: '',
    taxEnabled: false,
    lastDepreciation: '',
    taxCategory: [],
    expenseSearch: '',
    expenseRows: [],
    locationRows: [],
    totalAssetValue: 'Rp 0',
    bookValue: 'Rp 0',
    processItems,
    dockActions: createDockActions,
    expenseModal: {
        title: 'Pengeluaran',
        deleteLabel: 'Hapus',
        submitLabel: 'Lanjut',
        tabs: [
            { id: 'expense', label: 'Pengeluaran' },
            { id: 'notes', label: 'Catatan' },
        ],
    },
};

const detailRecords = {
    'fixed-asset-0502009': {
        autoCode: false,
        codeType: 'Aset Tetap',
        code: '0502009',
        name: 'Komputer 09',
        purchaseDate: '17/03/2016',
        usageDate: '17/03/2016',
        intangibleAsset: false,
        depreciationMethod: 'Metode Garis Lurus',
        assetAccount: ['[121.200-04] Peralatan & Perlengkapan Kantor Surabaya'],
        accumulatedDepreciationAccount: ['[122.200-03] Akm. Peny. Peralatan & Perlengkapan Surabaya'],
        depreciationExpenseAccount: ['[612.001-03] Beban Penyusutan Peralatan & Perlengkapan Kantor'],
        quantity: '1',
        assetLifeYears: '4',
        assetLifeMonths: '0',
        ratio: '25',
        residualValue: '0',
        category: ['Peralatan Kantor'],
        branch: ['JAKARTA'],
        department: ['Accounting'],
        initialLocation: ['SURABAYA'],
        notes: '',
        taxEnabled: true,
        lastDepreciation: '31/01/2017',
        taxCategory: ['Gol 1 [Garis Lurus]'],
        expenseSearch: '',
        expenseRows: [
            {
                id: 'expense-row-1',
                code: '300001',
                description: 'Equitas Saldo Awal',
                date: '17/03/2016',
                amount: '7,350,000',
                notes: '',
            },
        ],
        locationRows: [
            {
                id: 'location-row-1',
                symbol: '≡',
                name: 'SURABAYA',
                address: 'Gedung Pawitra Lt 2 NO. 203 Jl. Kalijudan No. 98A Surabaya Jawa Timur 60114 Indonesia',
                quantity: '1',
            },
        ],
        totalAssetValue: 'Rp 7,350,000',
        bookValue: 'Rp 5,818,750',
        dockActions: detailDockActions,
    },
};

const defaultConfig = {
    labels: {
        name: 'Nama',
        code: 'Kode Aset',
        purchaseDate: 'Tanggal Beli',
        usageDate: 'Tanggal Pakai',
        intangibleAsset: 'Aset Tidak Berwujud',
        depreciationMethod: 'Metode Penyusutan',
        assetAccount: 'Akun Aset',
        accumulatedDepreciationAccount: 'Akun Akumulasi Penyusutan',
        depreciationExpenseAccount: 'Akun Beban Penyusutan',
        quantity: 'Kuantitas',
        assetLife: 'Umur Aset',
        ratio: 'Rasio',
        residualValue: 'Nilai Sisa',
        category: 'Kategori Aset',
        branch: 'Cabang',
        department: 'Departemen',
        initialLocation: 'Lokasi Awal Aset',
        notes: 'Catatan',
        tax: 'Pajak',
        lastDepreciation: 'Penyusutan Terakhir',
        taxCategory: 'Kategori Pajak',
        expenseAccount: 'Akun Pengeluaran',
        assetLocation: 'Lokasi Aset',
    },
    codeTypeOptions: ['Aset Tetap'],
    depreciationMethodOptions: ['Metode Garis Lurus'],
    table: {
        createLabel: 'Tambah Aset Tetap',
        refreshLabel: 'Muat ulang',
        filterButtonLabel: 'Filter lanjutan',
        settingsLabel: 'Pengaturan tabel',
        searchPlaceholder: 'Cari...',
        searchWidthClassName: 'sm:w-[340px]',
        pageValue: '74',
        tableClassName: 'min-w-[1300px]',
        searchKeys: ['number', 'name', 'purchaseDate', 'quantity', 'totalAsset'],
        columns: tableColumns,
        filters: [
            {
                id: 'category',
                rowKey: 'categoryFilter',
                options: [{ value: 'all', label: 'Kategori Aset: Semua' }],
            },
        ],
        rows: tableRows,
        emptyLabel: 'Belum ada data',
    },
    sectionTabs,
    draft: draftRecord,
    detailRecords,
};

function cloneRows(rows = []) {
    return rows.map((row) => ({ ...row }));
}

export function buildFixedAssetsConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        codeTypeOptions: pageConfig.codeTypeOptions?.length ? pageConfig.codeTypeOptions : defaultConfig.codeTypeOptions,
        depreciationMethodOptions: pageConfig.depreciationMethodOptions?.length
            ? pageConfig.depreciationMethodOptions
            : defaultConfig.depreciationMethodOptions,
        table: {
            ...defaultConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns?.length ? pageConfig.table.columns : defaultConfig.table.columns,
            filters: pageConfig.table?.filters?.length ? pageConfig.table.filters : defaultConfig.table.filters,
            rows: pageConfig.table?.rows?.length ? pageConfig.table.rows : defaultConfig.table.rows,
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

export function buildFixedAssetsRecord(row = {}, config = defaultConfig) {
    const detailRecord = config.detailRecords?.[row.id];
    const source = detailRecord
        ? {
              ...config.draft,
              ...detailRecord,
          }
        : {
              ...config.draft,
              autoCode: false,
              code: row.number ?? config.draft.code,
              name: row.name ?? config.draft.name,
              purchaseDate: row.purchaseDate ?? config.draft.purchaseDate,
              usageDate: row.purchaseDate ?? config.draft.usageDate,
              quantity: row.quantity ?? config.draft.quantity,
              totalAssetValue: row.totalAsset ? `Rp ${row.totalAsset}` : config.draft.totalAssetValue,
              bookValue: row.totalAsset ? `Rp ${row.totalAsset}` : config.draft.bookValue,
              dockActions: detailDockActions,
          };

    return {
        ...source,
        assetAccount: cloneList(source.assetAccount),
        accumulatedDepreciationAccount: cloneList(source.accumulatedDepreciationAccount),
        depreciationExpenseAccount: cloneList(source.depreciationExpenseAccount),
        category: cloneList(source.category),
        branch: cloneList(source.branch),
        department: cloneList(source.department),
        initialLocation: cloneList(source.initialLocation),
        taxCategory: cloneList(source.taxCategory),
        expenseRows: cloneRows(source.expenseRows),
        locationRows: cloneRows(source.locationRows),
        processItems: source.processItems?.length ? [...source.processItems] : [...processItems],
        dockActions: source.dockActions ?? detailDockActions,
        expenseModal: {
            ...(config.draft.expenseModal ?? {}),
            ...(source.expenseModal ?? {}),
            tabs: (source.expenseModal?.tabs ?? config.draft.expenseModal?.tabs ?? []).map((tab) => ({ ...tab })),
        },
    };
}
