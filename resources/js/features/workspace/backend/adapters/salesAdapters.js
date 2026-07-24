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
    return {
        id: record.id,
        code: record.code ?? '',
        name: record.name ?? '',
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
        paymentTermId: record.payment_term_id ?? record.payment_term?.id ?? null,
        paymentTerms: record.payment_term?.name ? [record.payment_term.name] : [],
        branchIds: Array.isArray(record.branches) ? record.branches.map(b => b.id) : [],
        billingAddress: record.billing_address ?? '',
        shippingAddress: record.shipping_address ?? '',
        taxNumber: record.tax_number ?? '',
        notes: record.notes ?? '',
        creditLimit: record.credit_limit ?? 0,

      // Opsi kolom tambahan untuk Settings

        paymentTermsText: record.payment_term?.name ?? 'C.O.D',
        creditLimitText: record.credit_limit ? Number(record.credit_limit).toLocaleString('id-ID') : '0',
        isActiveText: record.is_active ? 'Tidak' : 'Ya',
    };
}

export function toPartnerPayload(values) {
    return {
        code: values.code?.trim() ?? '',
        name: values.name?.trim() ?? '',
        category_id: values.categoryId ?? null,
        currency_id: values.currencyId ?? null,
        payment_term_id: values.paymentTermId ?? null,
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
        credit_limit: values.creditLimit ? (parseFloat(String(values.creditLimit).replace(/[^0-9]/g, '')) || 0) : 0,
        is_active: values.isActive !== false,
        branch_ids: values.branchIds ?? [],
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

    return {
        id: record.id,
        image: imageUrl,
        code: record.code ?? '',
        barcode: record.barcode ?? '',
        name: record.name ?? '',
        type: String(record.product_type ?? '').trim().toLowerCase() === 'service' ? 'Jasa' : 'Persediaan',
        category: record.category?.name ?? 'Umum',
        unit: record.base_unit?.name ?? record.base_unit?.code ?? 'Pcs',
        purchasePrice: formatPrice(record.default_purchase_price),
        salePrice: formatPrice(record.default_sale_price),
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
        brand: record.brand?.name ?? '-',
        categoryFilter: record.category?.name ?? 'Umum',
        kind: String(record.product_type ?? '').trim().toLowerCase() === 'service' ? 'Jasa' : 'Persediaan',
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
        substituteProduct: record.substitute_product?.name ?? '-',

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
