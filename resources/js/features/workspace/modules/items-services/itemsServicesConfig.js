import {
    isWorkspaceControlInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';


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
    { id: 'image', label: 'Foto', widthClassName: 'w-[70px]', align: 'center', type: 'image' },
    { id: 'name', label: 'Nama Barang', widthClassName: 'w-[20%]', align: 'left', truncate: true },
    { id: 'code', label: 'Kode Barang', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'kind', label: 'Jenis Barang', widthClassName: 'w-[120px]', align: 'left' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[90px]', align: 'left', noWrap: true },
    { id: 'salePrice', label: 'Def. Hrg. Jual Satuan', widthClassName: 'w-[160px]', align: 'right', noWrap: true },
    { id: 'stockAtWarehouse', label: 'Kts (Gdng Peng...)', widthClassName: 'w-[150px]', align: 'right', noWrap: true },
    { id: 'saleableStock', label: 'Stok dapat dijual', widthClassName: 'w-[150px]', align: 'right', noWrap: true },
    
    // Kolom-kolom baru (default disembunyikan di Settings menu)
    { id: 'purchasePrice', label: 'Harga Beli', widthClassName: 'w-[150px]', align: 'right', defaultHidden: true, noWrap: true },
    { id: 'purchaseUnit', label: 'Satuan Beli', widthClassName: 'w-[110px]', align: 'left', defaultHidden: true, noWrap: true },
    { id: 'barcode', label: 'Barcode', widthClassName: 'w-[140px]', align: 'left', defaultHidden: true },
    { id: 'category', label: 'Kategori Barang', widthClassName: 'w-[150px]', align: 'left', defaultHidden: true },
    { id: 'isActiveText', label: 'Non Aktif', widthClassName: 'w-[110px]', align: 'center', defaultHidden: true },
    { id: 'brand', label: 'Merek Dagang', widthClassName: 'w-[130px]', align: 'left', defaultHidden: true },
    { id: 'notes', label: 'Catatan', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true, truncate: true },
    { id: 'bulkPricingEnabledText', label: 'Barang Grosir', widthClassName: 'w-[120px]', align: 'center', defaultHidden: true },
    { id: 'substituteProduct', label: 'Barang Substitusi', widthClassName: 'w-[180px]', align: 'left', defaultHidden: true },
];

const stockOpeningColumns = [
    { id: 'date', label: 'Tanggal', widthClassName: 'w-[20%]', align: 'center' },
    { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[20%]', align: 'center' },
    { id: 'unit', label: 'Satuan', widthClassName: 'w-[20%]', align: 'center' },
    { id: 'unitCost', label: 'Biaya Satuan', widthClassName: 'w-[20%]', align: 'center' },
    { id: 'warehouse', label: 'Gudang', widthClassName: 'w-[20%]', align: 'center' },
];

const itemsTableRows = [];

const createDefaults = {
    name: '',
    category: ['Umum'],
    kind: 'Persediaan',
    codeAuto: true,
    code: '',
    barcode: '',
    primaryUnit: ['PCS'],
    unitConversions: [],
    brand: [],
    serialEnabled: false,
    serialType: 'unique',
    useExpiryDate: false,
    defaultDiscount: '',
    sellPriceLevel1: '',
    minimumSell: '',
    bulkPricingEnabled: false,
    substituteEnabled: false,
    substituteProduct: [],
    mainSupplier: [],
    purchaseUnit: [],
    purchasePrice: '',
    minimumStock: '',
    openingStockRows: [],
    stockWarehouseLabel: 'Stok (Semua Gudang)',
    stockQuantity: '0',
    stockUnitValue: '0',
    stockCostOfGoods: '0',
    accounts: defaultAccountValues,
    images: [],
    attachments: [],
    branchesUsage: '[Semua Cabang]',
    notes: '',
    length: '',
    width: '',
    height: '',
    weight: '',
};

const detailRecords = {};

const defaultConfig = {
    topActions: [
        {
            id: 'tips',
            label: 'Petunjuk',
            icon: 'idea',
            tone: 'warning',
        },
    ],
    tabs: itemTabs,
    categoryOptions: ['Umum', 'Accessories', 'Handphone', 'Jasa'],
    kindOptions: ['Persediaan', 'Non Persediaan', 'Jasa', 'Grup'],
    branchOptions: ['[Semua Cabang]', 'JAKARTA', 'SURABAYA'],
    labels: {
        generalInfo: 'Informasi Barang & Jasa',
        moreInfo: 'Informasi Lainnya',
        salesInfo: 'Informasi Penjualan',
        purchaseInfo: 'Informasi Pembelian',
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
        purchasePrice: row.purchasePrice ?? '0',
        sellPriceLevel1: row.salePrice ?? '0',
        notes: row.notes ?? '',
        stockQuantity: row.stockAtWarehouse ?? '0',
        stockUnitValue: '0',
        stockCostOfGoods: '0',
        minimumStock: row.saleableStock ?? '0',
        accounts: row.accounts ? cloneAccounts(row.accounts) : cloneAccounts(config.createDefaults.accounts),
        inventoryAccountId: row.inventoryAccountId ?? null,
        salesAccountId: row.salesAccountId ?? null,
        salesReturnAccountId: row.salesReturnAccountId ?? null,
        salesDiscountAccountId: row.salesDiscountAccountId ?? null,
        deliveredGoodsAccountId: row.deliveredGoodsAccountId ?? null,
        cogsAccountId: row.cogsAccountId ?? null,
        purchaseReturnAccountId: row.purchaseReturnAccountId ?? null,
        uninvoicedPurchaseAccountId: row.uninvoicedPurchaseAccountId ?? null,
        attachments: row.attachments ?? [],
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
