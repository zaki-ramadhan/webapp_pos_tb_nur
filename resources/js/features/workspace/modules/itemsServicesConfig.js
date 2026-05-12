import {
    isWorkspaceControlInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';

const detailQuickActions = ['Harga Jual', 'Mutasi', 'Gudang'];

const itemTabs = [
    { id: 'general', label: 'Umum' },
    { id: 'sales-purchase', label: 'Penjualan / Pembelian' },
    { id: 'stock', label: 'Stok' },
    { id: 'accounts', label: 'Akun' },
    { id: 'images', label: 'Gambar' },
    { id: 'other', label: 'Lain-lain' },
];

const defaultAccountValues = {
    inventory: ['[115.000-01] Persediaan Handphone'],
    sales: ['[411.000-01] Penjualan Handphone'],
    salesReturn: ['[431.000-01] Retur Penjualan Handphone'],
    salesDiscount: ['[421.000-01] Potongan Penjualan Handphone'],
    deliveredGoods: ['[115.000-99] Barang Terkirim'],
    costOfGoodsSold: ['[511.000-01] Beban Pokok Penjualan Handphone'],
    purchaseReturn: ['[115.000-01] Persediaan Handphone'],
    uninvoicedPurchase: ['[213.000-99] Penerimaan Belum Tertagih'],
};

const listColumns = [
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[44%]', align: 'left', truncate: true },
    { id: 'code', label: 'Kode Barang', widthClassName: 'w-[160px]', align: 'left' },
    { id: 'kind', label: 'Jenis Barang', widthClassName: 'w-[150px]', align: 'left' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[100px]', align: 'left', noWrap: true },
    { id: 'stockAtWarehouse', label: 'Kts (Gdng Peng...)', widthClassName: 'w-[170px]', align: 'right', noWrap: true },
    { id: 'saleableStock', label: 'Stok dapat dijual', widthClassName: 'w-[190px]', align: 'right', noWrap: true },
];

const stockOpeningColumns = [
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[20%]', align: 'center' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[20%]', align: 'center' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[20%]', align: 'center' },
    { id: 'unitCost', label: 'Biaya Satuan', widthClassName: 'w-[20%]', align: 'center' },
    { id: 'warehouse', label: 'Gudang', widthClassName: 'w-[20%]', align: 'center' },
];

const itemsTableRows = [
    { id: 'item-anti-gores-iphone-5', tabLabel: 'Anti Gores Iphon...', name: 'Anti Gores Iphone 5', code: '9900012', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '141', saleableStock: '141', activeStatus: 'active', brand: 'Apple' },
    { id: 'item-anti-gores-iphone-5s', tabLabel: 'Anti Gores Iphon...', name: 'Anti Gores Iphone 5S', code: '9900013', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '97', saleableStock: '97', activeStatus: 'active', brand: 'Apple' },
    { id: 'item-anti-gores-iphone-6', tabLabel: 'Anti Gores Iphon...', name: 'Anti Gores Iphone 6', code: '9900014', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '331', saleableStock: '331', activeStatus: 'active', brand: 'Apple' },
    { id: 'item-anti-gores-iphone-6s', tabLabel: 'Anti Gores Iphon...', name: 'Anti Gores Iphone 6S', code: '9900015', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '290', saleableStock: '290', activeStatus: 'active', brand: 'Apple' },
    { id: 'item-anti-gores-iphone-6s-plus', tabLabel: 'Anti Gores Iphon...', name: 'Anti Gores Iphone 6S Plus', code: '9900016', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '111', saleableStock: '106', activeStatus: 'active', brand: 'Apple' },
    { id: 'item-charger-iphone-55s', tabLabel: 'Charger Iphone...', name: 'Charger Iphone 5/5S', code: '9900006', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '239', saleableStock: '239', activeStatus: 'active', brand: 'Apple' },
    { id: 'item-charger-iphone-6s', tabLabel: 'Charger Iphone...', name: 'Charger Iphone 6 S', code: '9900007', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '159', saleableStock: '144', activeStatus: 'active', brand: 'Apple' },
    { id: 'item-charger-iphone-6s-plus', tabLabel: 'Charger Iphone...', name: 'Charger Iphone 6S Plus', code: '9900008', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '130', saleableStock: '130', activeStatus: 'active', brand: 'Apple' },
    { id: 'item-charger-samsung-note5', tabLabel: 'Charger Samsun...', name: 'Charger Samsung Note 5', code: '9900004', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '274', saleableStock: '274', activeStatus: 'active', brand: 'Samsung' },
    { id: 'item-charger-samsung-s6-edge', tabLabel: 'Charger Samsun...', name: 'Charger Samsung S6 Edge', code: '9900005', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '247', saleableStock: '247', activeStatus: 'active', brand: 'Samsung' },
    { id: 'item-connector', tabLabel: 'Connector', name: 'Connector', code: '8800002', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '610', saleableStock: '570', activeStatus: 'active', brand: '' },
    { id: 'item-custom-clearance', tabLabel: 'Custom Clearanc...', name: 'Custom Clearance', code: '100003', kind: 'Jasa', unit: '', stockAtWarehouse: '0', saleableStock: '0', activeStatus: 'active', brand: '' },
    { id: 'item-data-cable', tabLabel: 'Data Cable', name: 'Data Cable', code: '9900009', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '214', saleableStock: '214', activeStatus: 'active', brand: '' },
    { id: 'item-flexcable', tabLabel: 'Flexcable', name: 'Flexcable', code: '8800003', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '268', saleableStock: '233', activeStatus: 'active', brand: '' },
    { id: 'item-hard-case', tabLabel: 'Hard Case', name: 'Hard Case', code: '9900002', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '107', saleableStock: '79', activeStatus: 'active', brand: '' },
    { id: 'item-headset', tabLabel: 'Headset', name: 'Headset', code: '9900001', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '317', saleableStock: '317', activeStatus: 'active', brand: '' },
    { id: 'item-iphone-5-16gb', tabLabel: 'Iphone 5 16 GB', name: 'Iphone 5 16 GB', code: '5116001', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '100', saleableStock: '100', activeStatus: 'active', brand: 'Apple' },
    { id: 'item-iphone-5-32gb', tabLabel: 'Iphone 5 32 GB', name: 'Iphone 5 32 GB', code: '5132002', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '132', saleableStock: '132', activeStatus: 'active', brand: 'Apple' },
    { id: 'item-iphone-5-64gb', tabLabel: 'Iphone 5 64 GB', name: 'Iphone 5 64 GB', code: '5164003', kind: 'Persediaan', unit: 'PCS', stockAtWarehouse: '159', saleableStock: '159', activeStatus: 'active', brand: 'Apple' },
];

const createDefaults = {
    name: '',
    category: ['Umum'],
    kind: 'Persediaan',
    codeAuto: true,
    code: '',
    barcode: '',
    primaryUnit: [],
    unitConversions: [],
    brand: [],
    serialEnabled: false,
    defaultDiscount: '',
    sellPriceLevel1: '',
    minimumSell: '',
    bulkPricingEnabled: false,
    substituteEnabled: false,
    mainSupplier: [],
    purchaseUnit: [],
    purchasePrice: '',
    minimumBuy: '',
    minimumStock: '',
    taxReference: [],
    ppn: [],
    pph: [],
    openingStockRows: [],
    stockWarehouseLabel: 'Stok (Semua Gudang)',
    stockQuantity: '0',
    stockUnitValue: '0',
    stockCostOfGoods: '0',
    accounts: defaultAccountValues,
    images: [],
    branchesUsage: '[Semua Cabang]',
    notes: '',
    length: '',
    width: '',
    height: '',
    weight: '',
};

const detailRecords = {
    'item-anti-gores-iphone-5': {
        name: 'Anti Gores Iphone 5',
        category: ['Accessories'],
        kind: 'Persediaan',
        codeAuto: false,
        code: '9900012',
        barcode: '9191010112',
        primaryUnit: ['PCS'],
        unitConversions: [
            { id: 'conv-1', unit: ['Box'], quantity: '15', baseUnit: 'PCS' },
            { id: 'conv-2', unit: [], quantity: '', baseUnit: 'PCS' },
        ],
        brand: [],
        serialEnabled: false,
        stockQuantity: '141',
        stockUnitValue: '0',
        stockCostOfGoods: '0',
    },
};

const defaultConfig = {
    topActions: [
        {
            id: 'tips',
            label: 'Petunjuk',
            icon: 'idea',
            tone: 'warning',
        },
    ],
    detailQuickActions,
    tabs: itemTabs,
    categoryOptions: ['Umum', 'Accessories', 'Handphone', 'Jasa'],
    kindOptions: ['Persediaan', 'Jasa'],
    branchOptions: ['[Semua Cabang]', 'JAKARTA', 'SURABAYA'],
    labels: {
        generalInfo: 'Informasi Barang & Jasa',
        moreInfo: 'Informasi Lainnya',
        salesInfo: 'Informasi Penjualan',
        purchaseInfo: 'Informasi Pembelian',
        taxInfo: 'Pajak Penjualan dan Pembelian',
        openingStock: 'Stok Awal',
        stockSection: 'Stok (Semua Gudang)',
        accounts: 'Akun Perkiraan',
        otherInfo: 'Info Lainnya',
        dimensionInfo: 'Dimensi & Berat',
    },
    table: {
        createLabel: 'Tambah Barang & Jasa',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari...',
        searchWidthClassName: 'sm:w-[342px]',
        tableClassName: 'min-w-[1540px]',
        pageValue: '64',
        filterButtonLabel: 'Filter lanjutan',
        columns: listColumns,
        rows: itemsTableRows,
        filters: [
            {
                id: 'inactive',
                rowKey: 'activeStatus',
                options: [
                    { value: 'all', label: 'Non Aktif: Semua' },
                    { value: 'active', label: 'Non Aktif: Tidak' },
                    { value: 'inactive', label: 'Non Aktif: Ya' },
                ],
            },
            {
                id: 'brand',
                rowKey: 'brand',
                disabled: isWorkspaceControlInactive('item-brand-filter'),
                badgeLabel: WORKSPACE_INACTIVE_BADGE_LABEL,
                hint: WORKSPACE_INACTIVE_HINT,
                options: [
                    { value: 'all', label: 'Merek Barang: Semua' },
                    { value: 'Apple', label: 'Merek Barang: Apple' },
                    { value: 'Samsung', label: 'Merek Barang: Samsung' },
                ],
            },
            {
                id: 'category',
                rowKey: 'categoryFilter',
                options: [
                    { value: 'all', label: 'Kategori Barang: Semua' },
                    { value: 'Accessories', label: 'Kategori Barang: Accessories' },
                    { value: 'Handphone', label: 'Kategori Barang: Handphone' },
                    { value: 'Jasa', label: 'Kategori Barang: Jasa' },
                ],
            },
            {
                id: 'kind',
                rowKey: 'kind',
                options: [
                    { value: 'all', label: 'Jenis Barang: Semua' },
                    { value: 'Persediaan', label: 'Jenis Barang: Persediaan' },
                    { value: 'Jasa', label: 'Jenis Barang: Jasa' },
                ],
            },
        ],
        downloadItems: [{ id: 'download-excel', label: 'Unduh Excel' }],
        shareItems: [{ id: 'share-export', label: 'Ekspor data' }],
        printItems: [{ id: 'print-list', label: 'Cetak daftar barang' }],
        settingsItems: [{ id: 'arrange-columns', label: 'Atur kolom' }],
    },
    openingStockTable: {
        columns: stockOpeningColumns,
        emptyLabel: 'Belum ada data',
    },
    accountNote:
        'Akun-akun yang dapat dipilih sesuai dengan akun-akun yang dimasukkan pada formulir Preferensi bagian akun default barang',
    createDockActions: [
        { id: 'save', label: 'Simpan', icon: 'save', tone: 'muted' },
    ],
    detailDockActions: [
        { id: 'save', label: 'Simpan', icon: 'save', tone: 'muted' },
        { id: 'delete', label: 'Hapus', icon: 'trash', tone: 'danger' },
    ],
    createDefaults,
    detailRecords,
};

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneAccounts(accounts = {}) {
    return Object.fromEntries(
        Object.entries(accounts).map(([key, values]) => [key, cloneList(values)]),
    );
}

function inferCategory(row) {
    if (row.kind === 'Jasa') {
        return 'Jasa';
    }

    const name = String(row.name ?? '').toLowerCase();

    if (name.includes('iphone 5 16 gb') || name.includes('iphone 5 32 gb') || name.includes('iphone 5 64 gb')) {
        return 'Handphone';
    }

    if (
        name.includes('anti gores') ||
        name.includes('charger') ||
        name.includes('connector') ||
        name.includes('cable') ||
        name.includes('headset') ||
        name.includes('hard case') ||
        name.includes('flex')
    ) {
        return 'Accessories';
    }

    return 'Umum';
}

function buildBarcode(code) {
    if (!code) {
        return '';
    }

    return `91${String(code).padStart(8, '0')}`;
}

function buildFallbackDetailRecord(row, config) {
    const category = inferCategory(row);
    const isService = row.kind === 'Jasa';

    return {
        ...config.createDefaults,
        name: row.name ?? '',
        category: [category],
        kind: row.kind ?? config.createDefaults.kind,
        codeAuto: false,
        code: row.code ?? '',
        barcode: buildBarcode(row.code),
        primaryUnit: row.unit ? [row.unit] : [],
        unitConversions: isService
            ? []
            : [{ id: `${row.id}-conv-1`, unit: ['Box'], quantity: '10', baseUnit: row.unit || 'PCS' }],
        brand: row.brand ? [row.brand] : [],
        stockQuantity: row.stockAtWarehouse ?? '0',
        stockUnitValue: '0',
        stockCostOfGoods: '0',
        minimumStock: row.saleableStock ?? '0',
        accounts: cloneAccounts(config.createDefaults.accounts),
    };
}

export function buildItemsServicesConfig(pageConfig = {}) {
    const resolvedRows = (pageConfig.table?.rows ?? defaultConfig.table.rows).map((row) => ({
        ...row,
        categoryFilter: row.categoryFilter ?? inferCategory(row),
    }));

    return {
        ...defaultConfig,
        ...pageConfig,
        topActions: pageConfig.topActions ?? defaultConfig.topActions,
        detailQuickActions: pageConfig.detailQuickActions ?? defaultConfig.detailQuickActions,
        tabs: pageConfig.tabs ?? defaultConfig.tabs,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        table: {
            ...defaultConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns ?? defaultConfig.table.columns,
            rows: resolvedRows,
            filters: pageConfig.table?.filters ?? defaultConfig.table.filters,
            downloadItems: pageConfig.table?.downloadItems ?? defaultConfig.table.downloadItems,
            shareItems: pageConfig.table?.shareItems ?? defaultConfig.table.shareItems,
            printItems: pageConfig.table?.printItems ?? defaultConfig.table.printItems,
            settingsItems: pageConfig.table?.settingsItems ?? defaultConfig.table.settingsItems,
        },
        openingStockTable: {
            ...defaultConfig.openingStockTable,
            ...(pageConfig.openingStockTable ?? {}),
            columns: pageConfig.openingStockTable?.columns ?? defaultConfig.openingStockTable.columns,
        },
        createDockActions: pageConfig.createDockActions ?? defaultConfig.createDockActions,
        detailDockActions: pageConfig.detailDockActions ?? defaultConfig.detailDockActions,
        createDefaults: {
            ...defaultConfig.createDefaults,
            ...(pageConfig.createDefaults ?? {}),
            accounts: cloneAccounts(pageConfig.createDefaults?.accounts ?? defaultConfig.createDefaults.accounts),
        },
        detailRecords: {
            ...defaultConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildItemsServicesRecord(row = {}, config = defaultConfig) {
    const explicitRecord = config.detailRecords?.[row.id];

    if (explicitRecord) {
        return {
            ...config.createDefaults,
            ...explicitRecord,
            accounts: cloneAccounts(explicitRecord.accounts ?? config.createDefaults.accounts),
        };
    }

    return buildFallbackDetailRecord(row, config);
}
