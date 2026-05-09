export const HELP_TOP_ACTIONS = [
    {
        id: 'tips',
        label: 'Petunjuk',
        icon: 'idea',
        tone: 'warning',
    },
];

export const CONTACTS_TABLE = {
    title: 'Kontak',
    columns: [
        { id: 'fullName', label: 'Nama Lengkap' },
        { id: 'title', label: 'Posisi Jabatan' },
        { id: 'email', label: 'Email' },
        { id: 'mobilePhone', label: 'Handphone' },
    ],
    emptyLabel: 'Belum ada data',
};

export const SHIPPING_TABLE = {
    title: 'Alamat lainnya',
    columns: [{ id: 'address', label: 'Alamat' }],
    emptyLabel: 'Belum ada data',
};

export const CUSTOMER_BALANCE_TABLE = {
    title: 'Piutang Awal',
    columns: [
        { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]' },
        { id: 'amount', label: 'Jumlah', widthClassName: 'w-[150px]' },
        { id: 'currency', label: 'Mata Uang', widthClassName: 'w-[180px]' },
        { id: 'paymentTerms', label: 'Syarat Pembayaran', widthClassName: 'w-[170px]' },
        { id: 'number', label: 'Nomor #', widthClassName: 'w-[180px]' },
        { id: 'notes', label: 'Keterangan' },
    ],
    emptyLabel: 'Belum ada data',
};

export const SUPPLIER_BALANCE_TABLE = {
    title: 'Utang Awal',
    columns: [
        { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]' },
        { id: 'amount', label: 'Jumlah', widthClassName: 'w-[150px]' },
        { id: 'currency', label: 'Mata Uang', widthClassName: 'w-[180px]' },
        { id: 'paymentTerms', label: 'Syarat Pembayaran', widthClassName: 'w-[190px]' },
        { id: 'number', label: 'Nomor #', widthClassName: 'w-[180px]' },
        { id: 'notes', label: 'Keterangan' },
    ],
    emptyLabel: 'Belum ada data',
};

export const SUPPLIER_BANK_TABLE = {
    title: 'Rekening Bank',
    columns: [
        { id: 'bankNumber', label: 'No Rekening', widthClassName: 'w-[22%]' },
        { id: 'accountName', label: 'Atas Nama', widthClassName: 'w-[24%]' },
        { id: 'bankName', label: 'Nama Bank' },
    ],
    emptyLabel: 'Belum ada data',
};

export const LOOKUP_PLACEHOLDERS = {
    category: 'Cari/Pilih...',
    default: 'Cari/Pilih...',
};

export const SHARED_LABELS = {
    name: 'Nama',
    category: 'Kategori',
    businessPhone: 'No. Telp. Bisnis',
    mobilePhone: 'Handphone',
    whatsapp: 'No. WhatsApp',
    email: 'Email',
    fax: 'Faximili',
    website: 'Website',
    branchUsage: 'Dipakai di Cabang',
    currency: 'Mata Uang Utama',
    taxCheckbox: 'Pajak',
    taxIdType: 'Tipe ID Pajak',
    taxNumber: 'Nomor Wajib Pajak',
    taxName: 'Nama Wajib Pajak',
    taxTkuId: 'ID TKU',
    taxTransactionType: 'Tipe Transaksi',
    notes: 'Catatan',
};

export function cloneArray(values = []) {
    return Array.isArray(values) ? [...values] : [];
}

export function cloneFormValues(source = {}) {
    return Object.fromEntries(
        Object.entries(source).map(([key, value]) => [key, Array.isArray(value) ? cloneArray(value) : value]),
    );
}

export function createTableConfig({ createLabel, rows, filters, pageValue, columns }) {
    return {
        createLabel,
        refreshLabel: 'Muat ulang',
        searchPlaceholder: 'Cari...',
        settingsLabel: 'Pengaturan tabel',
        pageValue,
        tableClassName: 'min-w-[1320px]',
        searchKeys: ['name', 'primaryContact', 'code', 'balance'],
        columns,
        rows,
        filters,
    };
}

export function createTemplate({
    type,
    tabs,
    table,
    labels,
    lookupPlaceholders = {},
    helperText = {},
    contactsTable = {},
    shippingTable = {},
    balanceTable = {},
    bankTable = {},
    headingLabels,
    formDefaults,
    detailRecords = {},
    taxOptions = {},
    generalRightFields = [],
    purchaseConfig = null,
    othersConfig = null,
}) {
    return {
        partnerType: type,
        topActions: HELP_TOP_ACTIONS,
        tabs,
        table,
        labels,
        lookupPlaceholders: {
            ...LOOKUP_PLACEHOLDERS,
            ...lookupPlaceholders,
        },
        helperText,
        contactsTable: {
            ...CONTACTS_TABLE,
            ...contactsTable,
            columns: contactsTable.columns ?? CONTACTS_TABLE.columns,
        },
        shippingTable: {
            ...SHIPPING_TABLE,
            ...shippingTable,
            columns: shippingTable.columns ?? SHIPPING_TABLE.columns,
        },
        balanceTable: {
            ...(type === 'supplier' ? SUPPLIER_BALANCE_TABLE : CUSTOMER_BALANCE_TABLE),
            ...balanceTable,
            columns:
                balanceTable.columns ??
                (type === 'supplier' ? SUPPLIER_BALANCE_TABLE.columns : CUSTOMER_BALANCE_TABLE.columns),
        },
        bankTable: {
            ...SUPPLIER_BANK_TABLE,
            ...bankTable,
            columns: bankTable.columns ?? SUPPLIER_BANK_TABLE.columns,
        },
        headingLabels,
        formDefaults,
        detailRecords,
        taxOptions: {
            showCountryLookup: type !== 'supplier',
            addressSameLabel: type === 'supplier' ? 'Alamat pajak sama dengan alamat pembayaran' : 'Sama dengan alamat penagihan',
            includedLabel: type === 'supplier' ? 'Default Faktur sudah termasuk Pajak' : 'Default Total Faktur sudah termasuk Pajak',
            ...taxOptions,
        },
        generalRightFields,
        purchaseConfig,
        othersConfig,
    };
}

export function mergeBusinessPartnerConfig(baseConfig, pageConfig = {}) {
    return {
        ...baseConfig,
        ...pageConfig,
        topActions: pageConfig.topActions ?? baseConfig.topActions,
        tabs: pageConfig.tabs ?? baseConfig.tabs,
        table: {
            ...baseConfig.table,
            ...(pageConfig.table ?? {}),
            columns: pageConfig.table?.columns ?? baseConfig.table.columns,
            rows: pageConfig.table?.rows ?? baseConfig.table.rows,
            filters: pageConfig.table?.filters ?? baseConfig.table.filters,
        },
        labels: {
            ...baseConfig.labels,
            ...(pageConfig.labels ?? {}),
        },
        lookupPlaceholders: {
            ...baseConfig.lookupPlaceholders,
            ...(pageConfig.lookupPlaceholders ?? {}),
        },
        helperText: {
            ...baseConfig.helperText,
            ...(pageConfig.helperText ?? {}),
        },
        contactsTable: {
            ...baseConfig.contactsTable,
            ...(pageConfig.contactsTable ?? {}),
            columns: pageConfig.contactsTable?.columns ?? baseConfig.contactsTable.columns,
        },
        shippingTable: {
            ...baseConfig.shippingTable,
            ...(pageConfig.shippingTable ?? {}),
            columns: pageConfig.shippingTable?.columns ?? baseConfig.shippingTable.columns,
        },
        balanceTable: {
            ...baseConfig.balanceTable,
            ...(pageConfig.balanceTable ?? {}),
            columns: pageConfig.balanceTable?.columns ?? baseConfig.balanceTable.columns,
        },
        bankTable: {
            ...baseConfig.bankTable,
            ...(pageConfig.bankTable ?? {}),
            columns: pageConfig.bankTable?.columns ?? baseConfig.bankTable.columns,
        },
        headingLabels: {
            ...baseConfig.headingLabels,
            ...(pageConfig.headingLabels ?? {}),
        },
        formDefaults: {
            ...baseConfig.formDefaults,
            ...(pageConfig.formDefaults ?? {}),
        },
        detailRecords: {
            ...baseConfig.detailRecords,
            ...(pageConfig.detailRecords ?? {}),
        },
        taxOptions: {
            ...baseConfig.taxOptions,
            ...(pageConfig.taxOptions ?? {}),
        },
        generalRightFields: pageConfig.generalRightFields ?? baseConfig.generalRightFields,
        purchaseConfig: {
            ...(baseConfig.purchaseConfig ?? {}),
            ...(pageConfig.purchaseConfig ?? {}),
        },
        othersConfig: {
            ...(baseConfig.othersConfig ?? {}),
            ...(pageConfig.othersConfig ?? {}),
        },
    };
}

export function resolveBusinessPartnerConfig(kind, pageConfig = {}, templates) {
    const template = templates[kind];

    if (!template) {
        throw new Error(`Unsupported business partner kind: ${kind}`);
    }

    const config = mergeBusinessPartnerConfig(template, pageConfig);

    return {
        ...config,
        formDefaults: cloneFormValues(config.formDefaults),
    };
}

export function resolveBusinessPartnerRecord(kind, row = {}, config, templates) {
    const template = templates[kind];
    const explicitDetail = config.detailRecords?.[row.id] ?? template.detailRecords[row.id];
    const baseRecord = explicitDetail ?? {};

    return cloneFormValues({
        ...config.formDefaults,
        ...baseRecord,
        name: baseRecord.name ?? row.name ?? config.formDefaults.name,
        code: baseRecord.code ?? row.code ?? config.formDefaults.code,
        category: baseRecord.category ?? (row.category ? [row.category] : config.formDefaults.category),
        detailActionLabel: baseRecord.detailActionLabel ?? '',
    });
}
