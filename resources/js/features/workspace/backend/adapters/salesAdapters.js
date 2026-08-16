import { normalizeDisplayDate, formatIsoDate, formatDateTime, buildSelectOptions } from './dateHelpers';

export function mapSalesCheckinRows(records) {
    return records.map((record) => {
        const salesName = record.sales_user?.name ?? '-';

        return {
            id: record.id,
            dateLabel: formatDateTime(record.checked_in_at),
            number: record.checkin_number ?? '',
            customerName: record.customer?.name ?? '-',
            salesName,
            transactionName: record.transaction_name ?? '',
            dateFilter: normalizeDisplayDate(record.checked_in_at),
            salesFilter: salesName.toLowerCase().replace(/\s+/g, '-'),
        };
    });
}

export function buildSalesCheckinFilters(rows) {
    const dateOptions = [...new Set(rows.map((row) => row.dateFilter).filter(Boolean))].map((value) => ({
        value,
        label: formatIsoDate(value),
    }));
    const salesOptions = [...new Set(rows.map((row) => row.salesFilter).filter(Boolean))].map((value) => ({
        value,
        label: rows.find((row) => row.salesFilter === value)?.salesName ?? value,
    }));

    return [
        {
            id: 'date',
            rowKey: 'dateFilter',
            options: buildSelectOptions(dateOptions, 'Tanggal'),
        },
        {
            id: 'sales',
            rowKey: 'salesFilter',
            options: buildSelectOptions(salesOptions, 'Sales'),
        },
    ];
}

export function mapPartnerRow(record) {
    const extendedDetails = typeof record.extended_details === 'string'
        ? JSON.parse(record.extended_details)
        : (record.extended_details ?? {});

    const numericBalance = Number(record.balance ?? 0);
    const formattedBalance = numericBalance !== 0 ? numericBalance.toLocaleString('id-ID') : '0';

    return {
        id: record.id,
        code: record.code ?? '',
        name: record.name ?? '',
        balance: formattedBalance,
        balanceValue: numericBalance,
        categoryName: record.category?.name ?? 'Umum',
        phone: record.business_phone ?? record.mobile_phone ?? record.whatsapp_phone ?? '',
        businessPhone: record.business_phone ?? '',
        mobilePhone: record.mobile_phone ?? '',
        whatsapp: record.whatsapp_phone ?? '',
        email: record.email ?? '',
        fax: record.fax ?? '',
        website: record.website ?? '',
        isActive: record.is_active !== false,
        tabLabel: record.name ?? '',
        categoryId: record.category_id ?? record.category?.id ?? null,
        currencyId: record.currency_id ?? record.currency?.id ?? null,
        branchIds: Array.isArray(record.branches) ? record.branches.map(b => b.id) : [],
        billingAddress: record.billing_address ?? '',
        shippingAddress: record.shipping_address ?? '',
        taxNumber: record.tax_number ?? extendedDetails.taxNumber ?? '',
        notes: record.notes ?? extendedDetails.notes ?? '',
        creditLimit: record.credit_limit ?? 0,
        extendedDetails,

        // Tab detail fields from extendedDetails
        contacts: extendedDetails.contacts ?? [],
        bankAccounts: extendedDetails.bankAccounts ?? [],
        openingBalanceRows: extendedDetails.openingBalanceRows ?? [],
        serviceVendor: Boolean(extendedDetails.serviceVendor),
        supplierType: extendedDetails.supplierType ?? '- Pilih Tipe Pemasok -',
        defaultDiscountPercent: extendedDetails.defaultDiscountPercent ?? '',
        defaultDescription: extendedDetails.defaultDescription ?? '',
        payableAccount: extendedDetails.payableAccount ?? [],
        advanceAccount: extendedDetails.advanceAccount ?? [],
        taxIncluded: Boolean(extendedDetails.taxIncluded),
        taxIdType: extendedDetails.taxIdType ?? 'NIK',
        taxName: extendedDetails.taxName ?? '',
        taxTkuId: extendedDetails.taxTkuId ?? '',
        taxTransactionType: extendedDetails.taxTransactionType ?? 'Digunggung',
        taxSameAsBilling: extendedDetails.taxSameAsBilling !== false,
        taxStreet: extendedDetails.taxStreet ?? '',
        taxCity: extendedDetails.taxCity ?? '',
        taxPostalCode: extendedDetails.taxPostalCode ?? '',
        taxProvince: extendedDetails.taxProvince ?? '',
        taxCountryName: extendedDetails.taxCountryName ?? '',
        invoiceNumberOnBill: extendedDetails.invoiceNumberOnBill !== false,

        // Opsi kolom tambahan untuk Settings
        creditLimitText: record.credit_limit ? Number(record.credit_limit).toLocaleString('id-ID') : '0',
        isActiveText: record.is_active ? 'Tidak' : 'Ya',
    };
}

export function toPartnerPayload(values) {
    return {
        code: values.code?.trim() ?? '',
        name: values.name?.trim() ?? '',
        category_id: values.categoryId ?? values.category?.[0]?.id ?? null,
        currency_id: values.currencyId ?? values.defaultCurrency?.[0]?.id ?? values.currency?.[0]?.id ?? null,
        business_phone: values.businessPhone?.trim() ?? values.phone?.trim() ?? '',
        mobile_phone: values.mobilePhone?.trim() ?? '',
        whatsapp_phone: values.whatsapp?.trim() ?? '',
        email: values.email?.trim() ?? '',
        fax: values.fax?.trim() ?? '',
        website: values.website?.trim() ?? '',
        billing_address: JSON.stringify({
            street: values.billingStreet ?? '',
            city: values.billingCity ?? '',
            postalCode: values.billingPostalCode ?? '',
            province: values.billingProvince ?? '',
            country: values.billingCountry ?? '',
        }),
        shipping_address: JSON.stringify({
            street: values.shippingSameAsBilling ? (values.billingStreet ?? '') : (values.shippingStreet ?? ''),
            city: values.shippingSameAsBilling ? (values.billingCity ?? '') : (values.shippingCity ?? ''),
            postalCode: values.shippingSameAsBilling ? (values.billingPostalCode ?? '') : (values.shippingPostalCode ?? ''),
            province: values.shippingSameAsBilling ? (values.billingProvince ?? '') : (values.shippingProvince ?? ''),
            country: values.shippingSameAsBilling ? (values.billingCountry ?? '') : (values.shippingCountry ?? ''),
        }),
        tax_number: values.taxNumber ?? '',
        notes: values.notes ?? '',
        credit_limit: values.creditLimit ? (parseFloat(String(values.creditLimit).replace(/[^0-9.]/g, '')) || 0) : 0,
        is_active: values.isActive !== false,
        branch_ids: values.branchIds ?? [],
        extended_details: {
            contacts: values.contacts ?? [],
            bankAccounts: values.bankAccounts ?? [],
            openingBalanceRows: values.openingBalanceRows ?? [],
            serviceVendor: Boolean(values.serviceVendor),
            supplierType: values.supplierType ?? '',
            defaultDiscountPercent: values.defaultDiscountPercent ?? '',
            defaultDescription: values.defaultDescription ?? '',
            payableAccount: values.payableAccount ?? [],
            advanceAccount: values.advanceAccount ?? [],
            taxIncluded: Boolean(values.taxIncluded),
            taxIdType: values.taxIdType ?? 'NIK',
            taxNumber: values.taxNumber ?? '',
            taxName: values.taxName ?? '',
            taxTkuId: values.taxTkuId ?? '',
            taxTransactionType: values.taxTransactionType ?? 'Digunggung',
            taxSameAsBilling: Boolean(values.taxSameAsBilling),
            taxStreet: values.taxStreet ?? '',
            taxCity: values.taxCity ?? '',
            taxPostalCode: values.taxPostalCode ?? '',
            taxProvince: values.taxProvince ?? '',
            taxCountryName: values.taxCountryName ?? '',
            invoiceNumberOnBill: Boolean(values.invoiceNumberOnBill),
            notes: values.notes ?? '',
        },
    };
}

export function mapProductRow(record) {
    const buildAccountVal = (acc) => acc ? [`[${acc.code}] ${acc.name}`] : [];
    const attachments = record.attachments ?? [];
    const imageAttachment = attachments.find(att => att.file_type?.startsWith('image/')) ?? attachments[0];
    const imageUrl = imageAttachment ? imageAttachment.url : '';

    const formatPrice = (p) => {
        const val = p !== null && p !== undefined && p !== '' ? Number(p) : 0;
        return val.toLocaleString('id-ID');
    };

    const conversions = record.unit_conversions ?? [];
    const unit2 = conversions[0]?.unit?.name ?? conversions[0]?.unit?.code ?? '-';
    const unit3 = conversions[1]?.unit?.name ?? conversions[1]?.unit?.code ?? '-';
    const unit4 = conversions[2]?.unit?.name ?? conversions[2]?.unit?.code ?? '-';
    const unit5 = conversions[3]?.unit?.name ?? conversions[3]?.unit?.code ?? '-';

    const prices = record.prices ?? [];
    const salePrice2 = formatPrice(prices[0]?.price);
    const salePrice3 = formatPrice(prices[1]?.price);
    const salePrice4 = formatPrice(prices[2]?.price);
    const salePrice5 = formatPrice(prices[3]?.price);

    const rawFlags = typeof record.flags === 'string' ? JSON.parse(record.flags) : (record.flags ?? {});
    const rawKind = String(record.product_type ?? record.kind ?? '').trim().toLowerCase();
    const normalizedKind = (rawKind === 'group' || rawKind === 'grup')
        ? 'Grup'
        : (rawKind === 'non_stock' || rawKind === 'non_persediaan' || rawKind === 'non persediaan')
            ? 'Non Persediaan'
            : 'Persediaan';

    return {
        id: record.id,
        image: imageUrl,
        code: record.code ?? '',
        barcode: record.barcode ?? '',
        name: record.name ?? '',
        type: normalizedKind,
        category: record.category ?? record.category?.name ?? 'Umum',
        categoryName: record.category?.name ?? 'Umum',
        unit: record.base_unit?.name ?? record.base_unit?.code ?? 'Pcs',
        unitName: record.base_unit?.name ?? record.base_unit?.code ?? 'Pcs',
        base_unit: record.base_unit ?? null,
        baseUnit: record.base_unit ?? null,
        purchase_unit: record.purchase_unit ?? null,
        purchasePrice: formatPrice(record.default_purchase_price ?? record.purchase_price ?? record.purchasePrice ?? 0),
        salePrice: formatPrice(record.default_sale_price ?? record.selling_price ?? record.sale_price ?? record.salePrice ?? 0),
        availableStock: record.stock_available ?? 0,
        stockAtWarehouse: record.stock_on_hand ?? record.stock_available ?? 0,
        saleableStock: record.stock_available ?? 0,
        notes: record.notes ?? '',
        isActive: record.is_active !== false,
        tabLabel: record.name ?? '',
        categoryId: record.category_id ?? record.category?.id ?? null,
        brandId: record.brand_id ?? record.brand?.id ?? null,
        baseUnitId: record.base_unit_id ?? record.base_unit?.id ?? null,
        purchaseUnitId: record.purchase_unit_id ?? record.purchase_unit?.id ?? null,
        salesUnitId: record.sales_unit_id ?? record.sales_unit?.id ?? null,
        attachments: record.attachments ?? [],
        activeStatus: record.is_active !== false ? 'active' : 'inactive',
        mainSupplier: record.main_supplier ?? record.mainSupplier ?? record.supplier_prices?.[0]?.supplier ?? record.supplierPrices?.[0]?.supplier ?? null,
        mainSupplierId: record.main_supplier_id ?? record.mainSupplierId ?? record.supplier_prices?.[0]?.supplier_id ?? record.supplierPrices?.[0]?.supplier_id ?? null,
        main_supplier: record.main_supplier ?? record.mainSupplier ?? record.supplier_prices?.[0]?.supplier ?? record.supplierPrices?.[0]?.supplier ?? null,
        main_supplier_id: record.main_supplier_id ?? record.mainSupplierId ?? record.supplier_prices?.[0]?.supplier_id ?? record.supplierPrices?.[0]?.supplier_id ?? null,
        supplier_prices: record.supplier_prices ?? record.supplierPrices ?? [],
        supplierPrices: record.supplier_prices ?? record.supplierPrices ?? [],
        brand: record.brand ?? record.brand?.name ?? null,
        brandName: record.brand?.name ?? null,
        categoryFilter: record.category?.name ?? 'Umum',
        kind: normalizedKind,
        inventoryAccountId: record.inventory_account_id ?? null,
        salesAccountId: record.sales_account_id ?? null,
        salesReturnAccountId: record.sales_return_account_id ?? null,
        salesDiscountAccountId: record.sales_discount_account_id ?? null,
        deliveredGoodsAccountId: record.delivered_goods_account_id ?? null,
        cogsAccountId: record.cogs_account_id ?? null,
        purchaseReturnAccountId: record.purchase_return_account_id ?? null,
        uninvoicedPurchaseAccountId: record.uninvoiced_purchase_account_id ?? null,
        
      // Pemetaan kolom baru untuk Settings Table

        purchaseUnit: record.purchase_unit?.name ?? record.purchase_unit?.code ?? '-',
        barcode: record.barcode ?? '-',
        isActiveText: record.is_active ? 'Tidak' : 'Ya',
        bulkPricingEnabledText: rawFlags?.bulk_pricing_enabled ? 'Ya' : 'Tidak',
        substituteProduct: record.substitute_product?.name ?? null,

        accounts: {
            inventory: buildAccountVal(record.inventory_account),
            sales: buildAccountVal(record.sales_account),
            salesReturn: buildAccountVal(record.sales_return_account),
            salesDiscount: buildAccountVal(record.sales_discount_account),
            deliveredGoods: buildAccountVal(record.delivered_goods_account),
            costOfGoodsSold: buildAccountVal(record.cogs_account),
            purchaseReturn: buildAccountVal(record.purchase_return_account),
            uninvoicedPurchase: buildAccountVal(record.uninvoiced_purchase_account),
        },
    };
}
