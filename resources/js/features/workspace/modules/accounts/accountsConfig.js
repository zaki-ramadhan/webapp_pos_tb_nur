const accountTopActions = [
    {
        id: 'tips',
        label: 'Petunjuk',
        icon: 'idea',
        tone: 'warning',
    },
];

const accountTypeOptions = [
    'Kas & Bank',
    'Piutang',
    'Persediaan',
    'Aset Tetap',
    'Kewajiban',
    'Modal',
    'Pendapatan',
    'Beban',
];

const accountTableColumns = [
    { id: 'code', label: 'Kode Perkiraan', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'name', label: 'Nama', widthClassName: 'w-[58%]', align: 'left' },
    { id: 'type', label: 'Tipe Akun', widthClassName: 'w-[200px]', align: 'left' },
    { id: 'balance', label: 'Saldo', widthClassName: 'w-[180px]', align: 'right' },
];

const accountRows = [
    { id: '111.000-00', code: '111.000-00', name: 'Kas dan Setara Kas', type: 'Kas & Bank', balance: '28,086,825,446.8', level: 0 },
    { id: '111.100-00', code: '111.100-00', name: 'Kas dan Setara Kas Jakarta', type: 'Kas & Bank', balance: '16,185,188,363.7', level: 1, parentId: '111.000-00' },
    { id: '111.101-00', code: '111.101-00', name: 'Kas Jakarta', type: 'Kas & Bank', balance: '178,860,364', level: 2, parentId: '111.100-00' },
    { id: '111.101-01', code: '111.101-01', name: 'Kas Kecil Kantor Jakarta', type: 'Kas & Bank', balance: '4,202,000', level: 3, parentId: '111.101-00' },
    { id: '111.101-02', code: '111.101-02', name: 'Kas Besar Kantor Jakarta', type: 'Kas & Bank', balance: '174,658,364', level: 3, parentId: '111.101-00' },
    { id: '111.102-00', code: '111.102-00', name: 'Bank Jakarta', type: 'Kas & Bank', balance: '16,006,327,999.7', level: 2, parentId: '111.100-00' },
    { id: '111.102-01', code: '111.102-01', name: 'Bank BCA IDR Jakarta (069-773-3993)', type: 'Kas & Bank', balance: '14,260,127,477', level: 3, parentId: '111.102-00' },
    { id: '111.102-02', code: '111.102-02', name: 'Bank BCA USD Jakarta (273-846-4723)', type: 'Kas & Bank', balance: '902,226,600', level: 3, parentId: '111.102-00' },
    { id: '111.102-03', code: '111.102-03', name: 'Bank BCA SGD Jakarta (157-375-3993)', type: 'Kas & Bank', balance: '656,672,014.7', level: 3, parentId: '111.102-00' },
    { id: '111.102-04', code: '111.102-04', name: 'Bank Mandiri IDR Jakarta (142-205-9324)', type: 'Kas & Bank', balance: '187,301,908', level: 3, parentId: '111.102-00' },
    { id: '111.200-00', code: '111.200-00', name: 'Kas dan Setara Kas Surabaya', type: 'Kas & Bank', balance: '11,901,637,083.1', level: 1, parentId: '111.000-00' },
    { id: '111.201-00', code: '111.201-00', name: 'Kas Surabaya', type: 'Kas & Bank', balance: '28,061,128', level: 2, parentId: '111.200-00' },
    { id: '111.201-01', code: '111.201-01', name: 'Kas Kecil Kantor Surabaya', type: 'Kas & Bank', balance: '23,935,000', level: 3, parentId: '111.201-00' },
    { id: '111.201-02', code: '111.201-02', name: 'Kas Besar Kantor Surabaya', type: 'Kas & Bank', balance: '4,126,128', level: 3, parentId: '111.201-00' },
    { id: '111.202-00', code: '111.202-00', name: 'Bank Surabaya', type: 'Kas & Bank', balance: '11,873,575,955.1', level: 2, parentId: '111.200-00' },
    { id: '111.202-01', code: '111.202-01', name: 'Bank BCA IDR Surabaya (388-308-3993)', type: 'Kas & Bank', balance: '11,542,950,800', level: 3, parentId: '111.202-00' },
    { id: '111.202-02', code: '111.202-02', name: 'Bank BCA USD Surabaya (247-878-6241)', type: 'Kas & Bank', balance: '233,544,600', level: 3, parentId: '111.202-00' },
    { id: '111.202-03', code: '111.202-03', name: 'Bank BCA SGD Surabaya (102-263-7587)', type: 'Kas & Bank', balance: '104,091,617.1', level: 3, parentId: '111.202-00' },
    { id: '111.202-04', code: '111.202-04', name: 'Bank Mandiri IDR Surabaya (276-129-4178)', type: 'Kas & Bank', balance: '(7,011,062)', level: 3, parentId: '111.202-00', negative: true },
];

const accountCreateValues = {
    type: 'Kas & Bank',
    isSubAccount: false,
    code: '',
    name: '',
    currency: ['Indonesian Rupiah'],
    branch: ['JAKARTA'],
    openingBalanceValue: '',
    openingBalanceDate: '30/09/2016',
    notes: '',
    allUsers: true,
};

const accountDetailRecords = {
    '111.000-00': {
        type: 'Kas & Bank',
        isSubAccount: false,
        code: '111.000-00',
        name: 'Kas dan Setara Kas',
        currencyLabel: 'Indonesian Rupiah',
        balanceLabel: 'Rp 28,086,825,446.8',
        notes: '',
        cashBankReference: 'Kas dan Setara Kas',
        allUsers: true,
        childAccounts: accountRows
            .filter((row) => row.id !== '111.000-00')
            .map((row) => ({
                id: row.id,
                code: row.code,
                name: row.name,
                level: row.level,
            })),
    },
};

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
                    { value: 'Kas & Bank', label: 'Tipe Akun: Kas & Bank' },
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
