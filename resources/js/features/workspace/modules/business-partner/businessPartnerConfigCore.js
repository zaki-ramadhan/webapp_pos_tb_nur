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
    emptyLabel: 'Tidak ada data',
};

export const SHIPPING_TABLE = {
    title: 'Alamat lainnya',
    columns: [{ id: 'address', label: 'Alamat' }],
    emptyLabel: 'Tidak ada data',
};

export const CUSTOMER_BALANCE_TABLE = {
    title: 'Piutang Awal',
    columns: [
        { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]' },
        { id: 'amount', label: 'Jumlah', widthClassName: 'w-[150px]' },
        { id: 'currency', label: 'Mata Uang', widthClassName: 'w-[180px]' },
        { id: 'number', label: 'Nomor', widthClassName: 'w-[180px]' },
        { id: 'notes', label: 'Keterangan' },
    ],
    emptyLabel: 'Tidak ada data',
};

export const SUPPLIER_BALANCE_TABLE = {
    title: 'Utang Awal',
    columns: [
        { id: 'date', label: 'Tanggal', widthClassName: 'w-[120px]' },
        { id: 'amount', label: 'Jumlah', widthClassName: 'w-[150px]' },
        { id: 'currency', label: 'Mata Uang', widthClassName: 'w-[180px]' },
        { id: 'number', label: 'Nomor', widthClassName: 'w-[180px]' },
        { id: 'notes', label: 'Keterangan' },
    ],
    emptyLabel: 'Tidak ada data',
};

export const SUPPLIER_BANK_TABLE = {
    title: 'Rekening Bank',
    columns: [
        { id: 'bankNumber', label: 'No Rekening', widthClassName: 'w-[22%]' },
        { id: 'accountName', label: 'Atas Nama', widthClassName: 'w-[24%]' },
        { id: 'bankName', label: 'Nama Bank' },
    ],
    emptyLabel: 'Tidak ada data',
};

export const LOOKUP_PLACEHOLDERS = {
    category: 'Cari/Pilih...',
    default: 'Cari/Pilih...',
};

export const SHARED_LABELS = {
    name: 'Nama',
    category: 'Kategori',
    businessPhone: 'No. Telp. Bisnis',
    mobilePhone: 'No. Handphone / WhatsApp',
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
        searchPlaceholder: 'Cari data...',
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
    rightTabs = [],
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
        type,
        partnerType: type,
        topActions: HELP_TOP_ACTIONS,
        tabs,
        rightTabs,
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
        rightTabs: pageConfig.rightTabs ?? baseConfig.rightTabs,
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

function parseAddressObj(addr) {
    if (!addr) return {};
    if (typeof addr === 'object') return addr;
    try {
        return JSON.parse(addr);
    } catch {
        return { street: String(addr) };
    }
}

export function resolveBusinessPartnerRecord(kind, row = {}, config, templates) {
    const template = templates[kind];
    const explicitDetail = config.detailRecords?.[row.id] ?? template.detailRecords[row.id];
    const baseRecord = explicitDetail ?? {};

    const rawBilling = row.billingAddress ?? row.billing_address;
    const parsedBilling = parseAddressObj(rawBilling);
    const billingStreet = baseRecord.billingStreet ?? parsedBilling.street ?? parsedBilling.address ?? (typeof rawBilling === 'string' && !rawBilling.startsWith('{') ? rawBilling : '');
    const billingCity = baseRecord.billingCity ?? parsedBilling.city ?? '';
    const billingPostalCode = baseRecord.billingPostalCode ?? parsedBilling.postalCode ?? parsedBilling.postal_code ?? '';
    const billingProvince = baseRecord.billingProvince ?? parsedBilling.province ?? '';
    const billingCountry = baseRecord.billingCountry ?? parsedBilling.country ?? '';

    const rawShipping = row.shippingAddress ?? row.shipping_address;
    const parsedShipping = parseAddressObj(rawShipping);
    const shippingStreet = baseRecord.shippingStreet ?? parsedShipping.street ?? parsedShipping.address ?? (typeof rawShipping === 'string' && !rawShipping.startsWith('{') ? rawShipping : '');
    const shippingCity = baseRecord.shippingCity ?? parsedShipping.city ?? '';
    const shippingPostalCode = baseRecord.shippingPostalCode ?? parsedShipping.postalCode ?? parsedShipping.postal_code ?? '';
    const shippingProvince = baseRecord.shippingProvince ?? parsedShipping.province ?? '';
    const shippingCountry = baseRecord.shippingCountry ?? parsedShipping.country ?? '';

    const rawTax = row.taxAddress ?? row.tax_address;
    const parsedTax = parseAddressObj(rawTax);
    const taxStreet = baseRecord.taxStreet ?? parsedTax.street ?? parsedTax.address ?? (typeof rawTax === 'string' && !rawTax.startsWith('{') ? rawTax : '');
    const taxCity = baseRecord.taxCity ?? parsedTax.city ?? '';
    const taxPostalCode = baseRecord.taxPostalCode ?? parsedTax.postalCode ?? parsedTax.postal_code ?? '';
    const taxProvince = baseRecord.taxProvince ?? parsedTax.province ?? '';
    const taxCountryName = baseRecord.taxCountryName ?? parsedTax.country ?? '';

    return cloneFormValues({
        ...config.formDefaults,
        ...baseRecord,
        name: baseRecord.name ?? row.name ?? config.formDefaults.name,
        code: baseRecord.code ?? row.code ?? config.formDefaults.code,
        category: baseRecord.category ?? (row.category ? (Array.isArray(row.category) ? row.category : [row.category]) : config.formDefaults.category),
        detailActionLabel: baseRecord.detailActionLabel ?? '',
        businessPhone: baseRecord.businessPhone ?? row.businessPhone ?? row.business_phone ?? row.phone ?? config.formDefaults.businessPhone,
        mobilePhone: baseRecord.mobilePhone ?? row.mobilePhone ?? row.mobile_phone ?? config.formDefaults.mobilePhone,
        whatsapp: baseRecord.whatsapp ?? row.whatsapp ?? config.formDefaults.whatsapp,
        email: baseRecord.email ?? row.email ?? config.formDefaults.email,
        fax: baseRecord.fax ?? row.fax ?? config.formDefaults.fax,
        website: baseRecord.website ?? row.website ?? config.formDefaults.website,
        notes: baseRecord.notes ?? row.notes ?? config.formDefaults.notes,
        taxNumber: baseRecord.taxNumber ?? row.taxNumber ?? row.tax_number ?? config.formDefaults.taxNumber,
        billingStreet,
        billingCity,
        billingPostalCode,
        billingProvince,
        billingCountry,
        shippingStreet,
        shippingCity,
        shippingPostalCode,
        shippingProvince,
        shippingCountry,
        shippingSameAsBilling: baseRecord.shippingSameAsBilling ?? row.shippingSameAsBilling ?? row.shipping_same_as_billing ?? (row.id ? (row.billingAddress === row.shippingAddress || row.billing_address === row.shipping_address) : config.formDefaults.shippingSameAsBilling),
        paymentTermId: baseRecord.paymentTermId ?? row.paymentTermId ?? row.payment_term_id ?? config.formDefaults.paymentTermId,
        branchIds: baseRecord.branchIds ?? row.branchIds ?? row.branch_ids ?? config.formDefaults.branchIds,
        categoryId: baseRecord.categoryId ?? row.categoryId ?? row.category_id ?? config.formDefaults.categoryId,
        currencyId: baseRecord.currencyId ?? row.currencyId ?? row.currency_id ?? config.formDefaults.currencyId,
        creditLimit: baseRecord.creditLimit ?? row.creditLimit ?? row.credit_limit ?? config.formDefaults.creditLimit,
        isActive: baseRecord.isActive ?? row.isActive ?? row.is_active ?? config.formDefaults.isActive,
        contacts: baseRecord.contacts ?? row.contacts ?? config.formDefaults.contacts,
        bankAccounts: baseRecord.bankAccounts ?? row.bankAccounts ?? config.formDefaults.bankAccounts,
        openingBalanceRows: baseRecord.openingBalanceRows ?? row.openingBalanceRows ?? config.formDefaults.openingBalanceRows,
        serviceVendor: baseRecord.serviceVendor ?? row.serviceVendor ?? row.service_vendor ?? config.formDefaults.serviceVendor,
        supplierType: baseRecord.supplierType ?? row.supplierType ?? row.supplier_type ?? config.formDefaults.supplierType,
        defaultDiscountPercent: baseRecord.defaultDiscountPercent ?? row.defaultDiscountPercent ?? row.default_discount_percent ?? config.formDefaults.defaultDiscountPercent,
        defaultDescription: baseRecord.defaultDescription ?? row.defaultDescription ?? row.default_description ?? config.formDefaults.defaultDescription,
        payableAccount: baseRecord.payableAccount ?? row.payableAccount ?? row.payable_account ?? config.formDefaults.payableAccount,
        advanceAccount: baseRecord.advanceAccount ?? row.advanceAccount ?? row.advance_account ?? config.formDefaults.advanceAccount,
        taxIncluded: baseRecord.taxIncluded ?? row.taxIncluded ?? row.tax_included ?? config.formDefaults.taxIncluded,
        taxIdType: baseRecord.taxIdType ?? row.taxIdType ?? row.tax_id_type ?? config.formDefaults.taxIdType,
        taxName: baseRecord.taxName ?? row.taxName ?? row.tax_name ?? config.formDefaults.taxName,
        taxTkuId: baseRecord.taxTkuId ?? row.taxTkuId ?? row.tax_tku_id ?? config.formDefaults.taxTkuId,
        taxTransactionType: baseRecord.taxTransactionType ?? row.taxTransactionType ?? row.tax_transaction_type ?? config.formDefaults.taxTransactionType,
        taxSameAsBilling: baseRecord.taxSameAsBilling ?? row.taxSameAsBilling ?? row.tax_same_as_billing ?? config.formDefaults.taxSameAsBilling,
        taxStreet,
        taxCity,
        taxPostalCode,
        taxProvince,
        taxCountryName,
        invoiceNumberOnBill: baseRecord.invoiceNumberOnBill ?? row.invoiceNumberOnBill ?? row.invoice_number_on_bill ?? config.formDefaults.invoiceNumberOnBill,
    });
}
