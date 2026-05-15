const tableRows = [
    { id: 'asset-category-gedung', name: 'Gedung' },
    { id: 'asset-category-kendaraan-1', name: 'Kendaraan 1' },
    { id: 'asset-category-kendaraan-2', name: 'Kendaraan 2' },
    { id: 'asset-category-peralatan-kantor', name: 'Peralatan Kantor' },
    { id: 'asset-category-tanah', name: 'Tanah' },
];

const detailRecords = {
    'asset-category-gedung': { name: 'Gedung' },
    'asset-category-kendaraan-1': { name: 'Kendaraan 1' },
    'asset-category-kendaraan-2': { name: 'Kendaraan 2' },
    'asset-category-peralatan-kantor': { name: 'Peralatan Kantor' },
    'asset-category-tanah': { name: 'Tanah' },
};

const defaultConfig = {
    table: {
        createLabel: 'Tambah Kategori Aset',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari...',
        searchWidthClassName: 'sm:w-[340px]',
        pageValue: '5',
        tableClassName: 'min-w-[760px]',
        searchKeys: ['name'],
        columns: [
            { id: 'name', label: 'Nama', widthClassName: 'w-full', align: 'left' },
        ],
        rows: tableRows,
        emptyLabel: 'Belum ada data',
    },
    form: {
        sectionLabel: 'Informasi Umum',
        saveLabel: 'Simpan',
        deleteLabel: 'Hapus',
        saveToneCreate: 'muted',
        saveToneDetail: 'muted',
        fields: [
            {
                id: 'name',
                label: 'Nama',
                required: true,
                clearable: true,
                className: 'max-w-[570px]',
            },
        ],
        dockActionsCreate: [
            {
                id: 'save',
                label: 'Simpan',
                tone: 'muted',
                icon: 'save',
            },
        ],
        dockActionsDetail: [
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
    },
    detailRecords,
};

export function buildAssetCategoryConfig(pageConfig = {}) {
    return {
        ...defaultConfig,
        ...pageConfig,
        table: {
            ...defaultConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns?.length ? pageConfig.table.columns : defaultConfig.table.columns,
            rows: pageConfig.table?.rows?.length ? pageConfig.table.rows : defaultConfig.table.rows,
        },
        form: {
            ...defaultConfig.form,
            ...(pageConfig.form ?? {}),
            fields: pageConfig.form?.fields?.length ? pageConfig.form.fields : defaultConfig.form.fields,
            dockActionsCreate: pageConfig.form?.dockActionsCreate?.length
                ? pageConfig.form.dockActionsCreate
                : defaultConfig.form.dockActionsCreate,
            dockActionsDetail: pageConfig.form?.dockActionsDetail?.length
                ? pageConfig.form.dockActionsDetail
                : defaultConfig.form.dockActionsDetail,
        },
        detailRecords: {
            ...defaultConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}
