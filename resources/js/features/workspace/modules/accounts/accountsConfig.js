const accountTopActions = [
    {
        id: 'tips',
        label: 'Petunjuk',
        icon: 'idea',
        tone: 'warning',
    },
];

const accountTypeOptions = [
    'Kas dan Bank',
    'Piutang Usaha',
    'Persediaan',
    'Aset Lancar Lainnya',
    'Aset Tetap',
    'Akumulasi Penyusutan',
    'Aset Lainnya',
    'Utang Usaha',
    'Liabilitas Jangka Pendek',
    'Liabilitas Jangka Panjang',
    'Modal',
    'Pendapatan',
    'Beban Pokok Penjualan',
    'Beban',
    'Beban Lainnya',
    'Pendapatan Lainnya',
];

const accountTableColumns = [
    { id: 'code', label: 'Kode Perkiraan', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'name', label: 'Nama', widthClassName: 'w-[58%]', align: 'left' },
    { id: 'type', label: 'Tipe Akun', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'balance', label: 'Saldo', widthClassName: 'w-[180px]', align: 'right' },
];

const accountRows = [];

const accountCreateValues = {
    type: 'Kas dan Bank',
    isSubAccount: false,
    code: '',
    name: '',
    currencyId: 1,
    currency: ['Rupiah'],
    branchIds: [1],
    branch: ['JAKARTA'],
    openingBalanceValue: '',
    openingBalanceDate: '30/09/2016',
    notes: '',
    allUsers: true,
};

const accountDetailRecords = {};

export const defaultAccountsConfig = {
    topActions: accountTopActions,
    createTabs: [
        { id: 'general', label: 'Informasi Umum' },
        { id: 'opening-balance', label: 'Saldo' },
        { id: 'others', label: 'Lain-lain' },
    ],
    detailTabs: [
        { id: 'general', label: 'Informasi Umum' },
        { id: 'others', label: 'Lain-lain' },
        { id: 'children', label: 'Akun Anak' },
    ],
    table: {
        createLabel: 'Tambah Akun Perkiraan',
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari...',
        pageValue: '315',
        columns: accountTableColumns,
        rows: accountRows,
        filters: [
            { id: 'inactive', rowKey: 'inactiveValue', options: [{ value: 'all', label: 'Non Aktif: Semua' }] },
            {
                id: 'type',
                rowKey: 'type',
                options: [
                    { value: 'all', label: 'Tipe Akun: Semua' },
                    { value: 'Kas dan Bank', label: 'Tipe Akun: Kas dan Bank' },
                ],
            },
        ],
        toolbarActions: [
            { id: 'download', label: 'Unduh', icon: 'download' },
            { id: 'open', label: 'Buka', icon: 'external-link' },
            { id: 'print', label: 'Cetak', icon: 'print' },
            { id: 'settings', label: 'Pengaturan tabel', icon: 'settings' },
        ],
    },
    typeOptions: accountTypeOptions,
    labels: {
        type: 'Tipe Akun',
        isSubAccount: 'Sub Akun',
        code: 'Kode Perkiraan',
        name: 'Nama',
        currency: 'Mata Uang',
        balance: 'Saldo',
        branch: 'Cabang',
        openingBalanceValue: 'Nilai',
        openingBalanceDate: 'per Tgl',
        notes: 'Catatan',
        allUsers: 'Semua Pengguna',
        cashBankReference: 'No. Bukti Kas/Bank',
    },
    placeholders: {
        currency: 'Cari/Pilih...',
        branch: 'Cari/Pilih...',
    },
    helperText: {
        nameExample: 'Contoh: BCA a/c XXX-XXX, dll',
    },
    headingLabels: {
        openingBalance: 'Saldo Awal',
        userAccess: 'Akses Pengguna',
    },
    dock: {
        createActions: [{ id: 'save', label: 'Simpan', tone: 'muted', icon: 'save' }],
        detailActions: [
            { id: 'save', label: 'Simpan', tone: 'muted', icon: 'save' },
            { id: 'delete', label: 'Hapus', tone: 'danger', icon: 'trash' },
        ],
    },
    createValues: accountCreateValues,
    detailRecords: accountDetailRecords,
};

function mergeAccountsConfig(baseConfig, pageConfig = {}) {
    return {
        ...baseConfig,
        ...pageConfig,
        topActions: pageConfig.topActions ?? baseConfig.topActions,
        createTabs: pageConfig.createTabs ?? baseConfig.createTabs,
        detailTabs: pageConfig.detailTabs ?? baseConfig.detailTabs,
        table: {
            ...baseConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns ?? baseConfig.table.columns,
            rows: pageConfig.table?.rows ?? baseConfig.table.rows,
            filters: pageConfig.table?.filters ?? baseConfig.table.filters,
            toolbarActions: pageConfig.table?.toolbarActions ?? baseConfig.table.toolbarActions,
        },
        labels: {
            ...baseConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        placeholders: {
            ...baseConfig.placeholders,
            ...(pageConfig.placeholders ?? {}),
        },
        helperText: {
            ...baseConfig.helperText,
            ...(pageConfig.helperText ?? {}),
        },
        headingLabels: {
            ...baseConfig.headingLabels,
            ...(pageConfig.headingLabels ?? {}),
        },
        dock: {
            ...baseConfig.dock,
            ...(pageConfig.dock ?? {}),
            createActions: pageConfig.dock?.createActions ?? baseConfig.dock.createActions,
            detailActions: pageConfig.dock?.detailActions ?? baseConfig.dock.detailActions,
        },
        createValues: {
            ...baseConfig.createValues,
            ...(pageConfig.createValues ?? {}),
        },
        detailRecords: {
            ...baseConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
    };
}

export function buildAccountsConfig(pageConfig = {}) {
    return mergeAccountsConfig(defaultAccountsConfig, pageConfig);
}

function collectDescendantAccounts(rows, parentId) {
    const directChildren = rows.filter((row) => row.parentId === parentId);

    return directChildren.flatMap((child) => [
        {
            id: child.id,
            code: child.code,
            name: child.name,
            level: child.level,
        },
        ...collectDescendantAccounts(rows, child.id),
    ]);
}

export function buildAccountDetailRecord(recordId, config) {
    const detailRecord = config.detailRecords?.[recordId] ?? defaultAccountsConfig.detailRecords[recordId];
    const baseRow = config.table.rows.find((row) => row.id === recordId);

    if (!detailRecord) {
        return {
            ...config.createValues,
            type: baseRow?.type ?? config.createValues.type,
            code: baseRow?.code ?? recordId ?? '',
            name: baseRow?.name ?? '',
            currencyLabel: 'Indonesian Rupiah',
            balanceLabel: baseRow?.balance ? `Rp ${baseRow.balance}` : '',
            cashBankReference: baseRow?.name ?? '',
            childAccounts: baseRow ? collectDescendantAccounts(config.table.rows, baseRow.id) : [],
        };
    }

    return {
        ...config.createValues,
        ...detailRecord,
        type: detailRecord.type ?? baseRow?.type ?? config.createValues.type,
        code: detailRecord.code ?? baseRow?.code ?? '',
        name: detailRecord.name ?? baseRow?.name ?? '',
        balanceLabel: detailRecord.balanceLabel ?? (baseRow?.balance ? `Rp ${baseRow.balance}` : ''),
        cashBankReference: detailRecord.cashBankReference ?? baseRow?.name ?? '',
        childAccounts: [...(detailRecord.childAccounts ?? [])],
    };
}
