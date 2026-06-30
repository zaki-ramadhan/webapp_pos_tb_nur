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
    return {
        id: record.id,
        code: record.code ?? '',
        barcode: record.barcode ?? '',
        name: record.name ?? '',
        type: record.product_type ?? 'Persediaan',
        category: record.category?.name ?? 'Umum',
        unit: record.base_unit?.name ?? record.base_unit?.code ?? 'Pcs',
        purchasePrice: record.default_purchase_price ?? 0,
        salePrice: record.default_sale_price ?? 0,
        availableStock: record.stock_available ?? 0,
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
        brand: record.brand?.name ?? '',
        categoryFilter: record.category?.name ?? 'Umum',
        kind: record.product_type ?? 'Persediaan',
    };
}
