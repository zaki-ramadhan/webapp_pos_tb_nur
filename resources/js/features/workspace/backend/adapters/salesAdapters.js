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
        email: record.email ?? '',
        website: record.website ?? '',
        isActive: record.is_active !== false,
        tabLabel: record.name ?? '',
        categoryId: record.category_id ?? record.category?.id ?? null,
        currencyId: record.currency_id ?? record.currency?.id ?? null,
        paymentTermId: null,
        branchIds: [],
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
        payment_term_id: null,
        business_phone: values.phone?.trim() ?? '',
        email: values.email?.trim() ?? '',
        website: values.website?.trim() ?? '',
        billing_address: values.billingAddress ?? '',
        shipping_address: values.shippingAddress ?? '',
        tax_number: values.taxNumber ?? '',
        notes: values.notes ?? '',
        credit_limit: values.creditLimit ?? 0,
        is_active: values.isActive !== false,
        branch_ids: [],
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
    };
}
