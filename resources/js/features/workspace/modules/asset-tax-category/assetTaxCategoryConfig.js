function normalizeYears(value) {
    const years = Number.parseFloat(String(value ?? '').replace(',', '.'));

    return Number.isFinite(years) && years > 0 ? years : 0;
}

function formatRateValue(value) {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

export function calculateAssetTaxCategoryRate(method, yearsValue) {
    const years = normalizeYears(yearsValue);

    if (!years || method === 'Tidak Terdepresiasi') {
        return '0';
    }

    if (method === 'Metode Saldo Menurun') {
        return formatRateValue(200 / years);
    }

    return formatRateValue(100 / years);
}

const draftRecord = {
    name: '',
    depreciationMethod: 'Metode Garis Lurus',
    estimatedLifeYears: '',
};

const detailRecords = {
    'asset-tax-category-bangunan-permanen': {
        name: 'Bangunan Permanen',
        depreciationMethod: 'Metode Garis Lurus',
        estimatedLifeYears: '20',
    },
    'asset-tax-category-bangunan-semi-permanen': {
        name: 'Bangunan Semi Permanen',
        depreciationMethod: 'Metode Garis Lurus',
        estimatedLifeYears: '10',
    },
    'asset-tax-category-gol1-gl': {
        name: 'Gol 1 [Garis Lurus]',
        depreciationMethod: 'Metode Garis Lurus',
        estimatedLifeYears: '4',
    },
    'asset-tax-category-gol1-sm': {
        name: 'Gol 1 [Saldo Menurun]',
        depreciationMethod: 'Metode Saldo Menurun',
        estimatedLifeYears: '4',
    },
    'asset-tax-category-gol2-gl': {
        name: 'Gol 2 [Garis Lurus]',
        depreciationMethod: 'Metode Garis Lurus',
        estimatedLifeYears: '8',
    },
    'asset-tax-category-gol2-sm': {
        name: 'Gol 2 [Saldo Menurun]',
        depreciationMethod: 'Metode Saldo Menurun',
        estimatedLifeYears: '8',
    },
    'asset-tax-category-gol3-gl': {
        name: 'Gol 3 [Garis Lurus]',
        depreciationMethod: 'Metode Garis Lurus',
        estimatedLifeYears: '16',
    },
    'asset-tax-category-gol3-sm': {
        name: 'Gol 3 [Saldo Menurun]',
        depreciationMethod: 'Metode Saldo Menurun',
        estimatedLifeYears: '16',
    },
    'asset-tax-category-gol4-gl': {
        name: 'Gol 4 [Garis Lurus]',
        depreciationMethod: 'Metode Garis Lurus',
        estimatedLifeYears: '20',
    },
    'asset-tax-category-gol4-sm': {
        name: 'Gol 4 [Saldo Menurun]',
        depreciationMethod: 'Metode Saldo Menurun',
        estimatedLifeYears: '20',
    },
    'asset-tax-category-intangible-1-gl': {
        name: 'Tidak Berwujud 1 [Garis Lurus]',
        depreciationMethod: 'Metode Garis Lurus',
        estimatedLifeYears: '4',
    },
    'asset-tax-category-intangible-1-sm': {
        name: 'Tidak Berwujud 1 [Saldo Menurun]',
        depreciationMethod: 'Metode Saldo Menurun',
        estimatedLifeYears: '4',
    },
    'asset-tax-category-intangible-2-gl': {
        name: 'Tidak Berwujud 2 [Garis Lurus]',
        depreciationMethod: 'Metode Garis Lurus',
        estimatedLifeYears: '8',
    },
    'asset-tax-category-intangible-2-sm': {
        name: 'Tidak Berwujud 2 [Saldo Menurun]',
        depreciationMethod: 'Metode Saldo Menurun',
        estimatedLifeYears: '8',
    },
    'asset-tax-category-intangible-3-gl': {
        name: 'Tidak Berwujud 3 [Garis Lurus]',
        depreciationMethod: 'Metode Garis Lurus',
        estimatedLifeYears: '16',
    },
    'asset-tax-category-intangible-3-sm': {
        name: 'Tidak Berwujud 3 [Saldo Menurun]',
        depreciationMethod: 'Metode Saldo Menurun',
        estimatedLifeYears: '16',
    },
    'asset-tax-category-intangible-4-gl': {
        name: 'Tidak Berwujud 4 [Garis Lurus]',
        depreciationMethod: 'Metode Garis Lurus',
        estimatedLifeYears: '20',
    },
    'asset-tax-category-intangible-4-sm': {
        name: 'Tidak Berwujud 4 [Saldo Menurun]',
        depreciationMethod: 'Metode Saldo Menurun',
        estimatedLifeYears: '20',
    },
    'asset-tax-category-no-depreciation': {
        name: 'Tidak Disusutkan',
        depreciationMethod: 'Tidak Terdepresiasi',
        estimatedLifeYears: '0',
    },
};

const tableRows = Object.entries(detailRecords).map(([id, record]) => ({
    id,
    name: record.name,
    estimatedLifeYears: record.estimatedLifeYears,
    depreciationMethod: record.depreciationMethod,
    depreciationRate: calculateAssetTaxCategoryRate(record.depreciationMethod, record.estimatedLifeYears),
    methodFilter: record.depreciationMethod,
}));

const defaultConfig = {
    sectionLabel: 'Informasi umum',
    labels: {
        name: 'Nama',
        depreciationMethod: 'Metode Penyusutan',
        estimatedLife: 'Perkiraan Umur',
        depreciationRate: 'Tarif Penyusutan',
        yearsSuffix: 'Tahun',
        percentSuffix: '%',
    },
    depreciationMethodOptions: [
        'Metode Garis Lurus',
        'Metode Saldo Menurun',
        'Tidak Terdepresiasi',
    ],
    table: {
        createLabel: 'Tambah Kategori Aset Tetap Pajak',
        refreshLabel: 'Muat ulang',
        settingsLabel: 'Pengaturan tabel',
        searchPlaceholder: 'Cari...',
        searchWidthClassName: 'sm:w-[340px]',
        pageValue: '19',
        tableClassName: 'min-w-[1120px]',
        searchKeys: ['name', 'estimatedLifeYears', 'depreciationMethod', 'depreciationRate'],
        filters: [
            {
                id: 'method',
                rowKey: 'methodFilter',
                options: [{ value: 'all', label: 'Metode Penyusutan: Semua' }],
            },
        ],
        columns: [
            { id: 'depreciationRate', label: 'Tarif Penyusutan (%)', widthClassName: 'w-[180px]', align: 'right' },
            { id: 'name', label: 'Nama', widthClassName: 'w-[30%]', align: 'left' },
            { id: 'estimatedLifeYears', label: 'Perkiraan Umur (tahun)', widthClassName: 'w-[210px]', align: 'right' },
            { id: 'depreciationMethod', label: 'Metode Penyusutan', widthClassName: 'w-[38%]', align: 'left' },
        ],
        rows: tableRows,
        emptyLabel: 'Belum ada data',
    },
    draft: draftRecord,
    detailRecords,
    createDockActions: [
        {
            id: 'save',
            label: 'Simpan',
            tone: 'muted',
            icon: 'save',
        },
    ],
    detailDockActions: [
        {
            id: 'save',
            label: 'Simpan',
            tone: 'muted',
            icon: 'save',
        },
        {
            id: 'delete',
            label: 'Hapus',
            tone: 'danger',
            icon: 'trash',
        },
    ],
};

export function buildAssetTaxCategoryConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        labels: {
            ...defaultConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
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
        draft: {
            ...defaultConfig.draft,
            ...(pageConfig.draft ?? {}),
        },
        detailRecords: {
            ...defaultConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
        createDockActions: pageConfig.createDockActions?.length
            ? pageConfig.createDockActions
            : defaultConfig.createDockActions,
        detailDockActions: pageConfig.detailDockActions?.length
            ? pageConfig.detailDockActions
            : defaultConfig.detailDockActions,
    };
}
