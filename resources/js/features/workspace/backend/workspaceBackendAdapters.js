import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

function padNumber(value) {
    return String(value).padStart(2, '0');
}

export function normalizeDisplayDate(value) {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
        return normalizedValue;
    }

    const parts = normalizedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

    if (!parts) {
        const parsedDate = new Date(normalizedValue);

        if (Number.isNaN(parsedDate.getTime())) {
            return '';
        }

        return `${parsedDate.getFullYear()}-${padNumber(parsedDate.getMonth() + 1)}-${padNumber(parsedDate.getDate())}`;
    }

    const [, day, month, year] = parts;

    return `${year}-${padNumber(month)}-${padNumber(day)}`;
}

export function formatIsoDate(value) {
    const normalizedValue = normalizeDisplayDate(value);

    if (!normalizedValue) {
        return '';
    }

    const [year, month, day] = normalizedValue.split('-');

    return `${day}/${month}/${year}`;
}

export function formatDateTime(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatDateTimeVerbose(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(date);
}

function titleizeKey(value) {
    return String(value ?? '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildSelectOptions(values, allLabelPrefix, emptyLabel = null) {
    const options = [{ value: 'all', label: `${allLabelPrefix}: Semua` }];

    values.forEach(({ value, label }) => {
        if (!value) {
            return;
        }

        options.push({
            value,
            label: `${allLabelPrefix}: ${label}`,
        });
    });

    if (emptyLabel) {
        options.push({
            value: 'empty',
            label: `${allLabelPrefix}: ${emptyLabel}`,
        });
    }

    return options;
}

export const BACKEND_BANK_RESOURCES = {
    'bank-statement': 'bank-statements',
    'bank-history': 'bank-histories',
    'bank-reconciliation': 'bank-reconciliations',
};

export function buildBankFilters(values) {
    return {
        search: values.keyword?.trim() ?? '',
        start_date: normalizeDisplayDate(values.startDate),
        end_date: normalizeDisplayDate(values.endDate),
        per_page: 100,
    };
}

export function mapBankRows(pageId, records) {
    return records.map((record, index) => {
        if (pageId === 'bank-history') {
            return {
                id: record.id,
                date: record.date ?? '',
                sourceNumber: record.source_number ?? '',
                checkNumber: record.check_number ?? '',
                transactionType: record.transaction_type ?? '',
                description: record.description ?? '',
                mutation: record.mutation ?? '',
                type: record.type ?? '',
                balance: record.balance ?? '',
                index: record.index ?? index + 1,
            };
        }

        if (pageId === 'bank-reconciliation') {
            return {
                id: record.id,
                date: record.date ?? '',
                documentNumber: record.document_number ?? '',
                transactionType: record.transaction_type ?? '',
                description: record.description ?? '',
                debit: record.debit ?? '',
                credit: record.credit ?? '',
                status: record.status ?? '',
            };
        }

        return {
            id: record.id,
            date: record.date ?? '',
            description: record.description ?? '',
            mutation: record.mutation ?? '',
            type: record.type ?? '',
            balance: record.balance ?? '',
            index: index + 1,
        };
    });
}

export const BACKEND_INVENTORY_RESOURCES = {
    'item-location': 'item-locations',
    'minimum-stock': 'minimum-stocks',
};

export function buildInventoryFilters(pageId, values) {
    if (pageId === 'item-location') {
        return {
            search: values.itemSearch?.trim() ?? '',
            as_of_date: normalizeDisplayDate(values.asOfDate),
            per_page: 100,
        };
    }

    return {
        search: values.keyword?.trim() ?? '',
        as_of_date: normalizeDisplayDate(values.asOfDate),
        per_page: 100,
    };
}

export function mapInventoryRows(pageId, records) {
    if (pageId === 'item-location') {
        return records.map((record) => ({
            id: record.id,
            warehouse: record.warehouse ?? '',
            multiUnitQuantity: record.multi_unit_quantity ?? '',
            saleableStock: record.saleable_stock ?? '',
            address: record.address ?? '',
        }));
    }

    return records.map((record) => ({
        id: record.id,
        selected: false,
        supplier: record.supplier ?? '',
        itemName: record.item_name ?? '',
        itemCode: record.item_code ?? '',
        unit: record.unit ?? '',
        availableStock: record.available_stock ?? '',
        ordered: record.ordered ?? '',
        requested: record.requested ?? '',
        minimumLimit: record.minimum_limit ?? '',
    }));
}

function mapActivityActionLabel(action) {
    return {
        create: 'Buat',
        update: 'Ubah',
        delete: 'Hapus',
    }[action] ?? titleizeKey(action);
}

export function mapActivityLogRows(records) {
    return records.map((record) => {
        const transactionDate = normalizeDisplayDate(record.metadata?.transaction_date) || normalizeDisplayDate(record.occurred_at);

        return {
            id: record.id,
            dateValue: normalizeDisplayDate(record.occurred_at),
            transactionDateValue: transactionDate || 'empty',
            transactionDateLabel: formatIsoDate(transactionDate),
            referenceName: record.subject_label ?? record.document_number ?? '-',
            actionTypeValue: record.action ?? '',
            actionLabel: mapActivityActionLabel(record.action),
            transactionTypeValue: record.resource_key ?? '',
            transactionTypeLabel: record.resource_label ?? titleizeKey(record.permission_key ?? record.resource_key),
            loggedAt: formatDateTimeVerbose(record.occurred_at),
            userValue: String(record.actor_user_id ?? record.actor_email ?? ''),
            userName: record.actor_name ?? record.actor_user?.name ?? '-',
            email: record.actor_email ?? record.actor_user?.email ?? '-',
            ipAddress: record.ip_address ?? '-',
        };
    });
}

export function buildActivityLogFilters(rows) {
    const uniqueDateValues = [...new Set(rows.map((row) => row.dateValue).filter(Boolean))].map((value) => ({
        value,
        label: formatIsoDate(value),
    }));
    const uniqueTransactionDateValues = [...new Set(rows.map((row) => row.transactionDateValue).filter((value) => value && value !== 'empty'))].map((value) => ({
        value,
        label: formatIsoDate(value),
    }));
    const uniqueTransactionTypes = [...new Set(rows.map((row) => row.transactionTypeValue).filter(Boolean))].map((value) => ({
        value,
        label: rows.find((row) => row.transactionTypeValue === value)?.transactionTypeLabel ?? value,
    }));
    const uniqueUsers = [...new Set(rows.map((row) => row.userValue).filter(Boolean))].map((value) => ({
        value,
        label: rows.find((row) => row.userValue === value)?.userName ?? value,
    }));
    const uniqueActions = [...new Set(rows.map((row) => row.actionTypeValue).filter(Boolean))].map((value) => ({
        value,
        label: rows.find((row) => row.actionTypeValue === value)?.actionLabel ?? value,
    }));

    return [
        {
            id: 'date',
            rowKey: 'dateValue',
            options: buildSelectOptions(uniqueDateValues, 'Tanggal'),
        },
        {
            id: 'transactionDate',
            rowKey: 'transactionDateValue',
            options: buildSelectOptions(uniqueTransactionDateValues, 'Tgl Transaksi', '-'),
        },
        {
            id: 'transactionType',
            rowKey: 'transactionTypeValue',
            options: buildSelectOptions(uniqueTransactionTypes, 'Tipe Transaksi'),
        },
        {
            id: 'user',
            rowKey: 'userValue',
            options: buildSelectOptions(uniqueUsers, 'Pengguna'),
        },
        {
            id: 'actionType',
            rowKey: 'actionTypeValue',
            options: buildSelectOptions(uniqueActions, 'Tipe Tindakan'),
        },
    ];
}

export function mapJournalActivityRows(records) {
    return records.map((record) => ({
        id: record.id,
        date: formatIsoDate(record.occurred_at),
        number: record.document_number ?? `LOG-${record.id}`,
        transactionNumber: record.subject_label ?? record.description ?? '-',
        typeLabel: record.resource_label ?? titleizeKey(record.permission_key ?? record.resource_key),
        amount: record.metadata?.amount ?? '',
    }));
}

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

export function buildReportListConfig(records, fallbackConfig) {
    const activeRecords = records.filter((record) => record.is_active !== false);
    const categoryMap = new Map();
    const reports = activeRecords
        .slice()
        .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
        .map((record) => {
            const metadata = record.metadata ?? {};
            const categoryId = record.category_key ?? 'general';
            const categoryLabel = metadata.category_label ?? titleizeKey(categoryId);

            if (!categoryMap.has(categoryId)) {
                const fallbackCategory = (fallbackConfig.categories ?? []).find((c) => c.id === categoryId);
                categoryMap.set(categoryId, {
                    id: categoryId,
                    label: fallbackCategory?.label ?? categoryLabel,
                    icon: fallbackCategory?.icon ?? metadata.category_icon ?? record.icon ?? 'reports',
                });
            }

            return {
                id: record.report_key ?? String(record.id),
                categoryId,
                section: record.section_label ?? metadata.section_label ?? titleizeKey(record.section_key ?? 'Umum'),
                title: record.title ?? '',
                description: record.description ?? '',
                icon: record.icon ?? metadata.icon ?? 'reports',
            };
        });

    return {
        ...fallbackConfig,
        categories: categoryMap.size ? [...categoryMap.values()] : fallbackConfig.categories,
        reports,
    };
}

function emptyStringToNull(value) {
    const normalizedValue = String(value ?? '').trim();

    return normalizedValue === '' ? null : normalizedValue;
}

export const SIMPLE_MASTER_BACKEND_CONFIG = {
    'item-unit': {
        resource: 'units',
        labelField: 'name',
        toRow(record) {
            return {
                id: record.id,
                name: record.name ?? '',
                tabLabel: record.name ?? '',
                taxCode: record.tax_reference_code ?? '',
            };
        },
        toForm(record) {
            return {
                name: record.name ?? '',
                taxCode: record.tax_reference_code ?? '',
            };
        },
        toPayload(values) {
            return {
                name: values.name?.trim() ?? '',
                tax_reference_code: emptyStringToNull(values.taxCode),
                is_active: true,
            };
        },
    },
    'sales-category': {
        resource: 'sales-categories',
        labelField: 'name',
        toRow(record) {
            return {
                id: record.id,
                name: record.name ?? '',
                description: record.description ?? '',
                tabLabel: record.name ?? '',
            };
        },
        toForm(record) {
            return {
                name: record.name ?? '',
                description: record.description ?? '',
            };
        },
        toPayload(values) {
            return {
                name: values.name?.trim() ?? '',
                description: emptyStringToNull(values.description),
                is_active: true,
            };
        },
    },
    'customer-category': {
        resource: 'customer-categories',
        labelField: 'name',
        validate(values) {
            if (values.isSubCategory) {
                return 'Sub kategori pelanggan belum bisa disimpan karena parent kategori belum tersedia di form ini.';
            }

            return '';
        },
        toRow(record) {
            return {
                id: record.id,
                name: record.name ?? '',
                defaultLabel: record.is_default ? 'Ya' : 'Tidak',
                isDefault: Boolean(record.is_default),
                isSubCategory: Boolean(record.parent_id),
                tabLabel: record.name ?? '',
            };
        },
        toForm(record) {
            return {
                name: record.name ?? '',
                isDefault: Boolean(record.is_default),
                isSubCategory: Boolean(record.parent_id),
            };
        },
        toPayload(values) {
            return {
                name: values.name?.trim() ?? '',
                is_default: Boolean(values.isDefault),
                is_active: true,
            };
        },
    },
    'supplier-category': {
        resource: 'supplier-categories',
        labelField: 'name',
        validate(values) {
            if (values.isSubCategory) {
                return 'Sub kategori pemasok belum bisa disimpan karena parent kategori belum tersedia di form ini.';
            }

            return '';
        },
        toRow(record) {
            return {
                id: record.id,
                name: record.name ?? '',
                defaultLabel: record.is_default ? 'Ya' : 'Tidak',
                isDefault: Boolean(record.is_default),
                isSubCategory: Boolean(record.parent_id),
                tabLabel: record.name ?? '',
            };
        },
        toForm(record) {
            return {
                name: record.name ?? '',
                isDefault: Boolean(record.is_default),
                isSubCategory: Boolean(record.parent_id),
            };
        },
        toPayload(values) {
            return {
                name: values.name?.trim() ?? '',
                is_default: Boolean(values.isDefault),
                is_active: true,
            };
        },
    },
    'fob-master': {
        resource: 'fob-terms',
        labelField: 'name',
        toRow(record) {
            return {
                id: record.id,
                name: record.name ?? '',
                description: record.notes ?? '',
                tabLabel: record.name ?? '',
            };
        },
        toForm(record) {
            return {
                name: record.name ?? '',
                description: record.notes ?? '',
            };
        },
        toPayload(values) {
            return {
                name: values.name?.trim() ?? '',
                notes: emptyStringToNull(values.description),
                is_active: true,
            };
        },
    },
    'payment-terms': {
        resource: 'payment-terms',
        labelField: 'name',
        toRow(record) {
            return {
                id: record.id,
                name: record.name ?? '',
                dueDays: record.due_days ?? 0,
                dueDaysLabel: `${record.due_days ?? 0} Hari`,
                inactiveLabel: record.is_active ? 'Bisa Dipakai' : 'Non Aktif',
                inactiveValue: record.is_active ? 'active' : 'inactive',
                tabLabel: record.name ?? '',
            };
        },
        toForm(record) {
            return {
                name: record.name ?? '',
                dueDays: record.due_days ?? 0,
            };
        },
        toPayload(values) {
            return {
                name: values.name?.trim() ?? '',
                due_days: Number(values.dueDays ?? 0),
                is_active: true,
            };
        },
    },
    'asset-category': {
        resource: 'asset-categories',
        labelField: 'name',
        toRow(record) {
            return {
                id: record.id,
                name: record.name ?? '',
                code: record.code ?? '',
                depreciationMethod: record.depreciation_method ?? '',
                assetLifeMonths: record.asset_life_months ?? 0,
                tabLabel: record.name ?? '',
            };
        },
        toForm(record) {
            return {
                name: record.name ?? '',
                code: record.code ?? '',
                depreciationMethod: record.depreciation_method ?? '',
                assetLifeMonths: record.asset_life_months ?? 0,
            };
        },
        toPayload(values) {
            return {
                name: values.name?.trim() ?? '',
                code: values.code?.trim() ?? '',
                depreciation_method: values.depreciationMethod ?? 'Metode Garis Lurus',
                asset_life_months: Number(values.assetLifeMonths ?? 48),
                is_active: true,
            };
        },
    },
    'asset-tax-category': {
        resource: 'asset-tax-categories',
        labelField: 'name',
        toRow(record) {
            return {
                id: record.id,
                name: record.name ?? '',
                code: record.code ?? '',
                depreciationMethod: record.depreciation_method ?? '',
                assetLifeMonths: record.asset_life_months ?? 0,
                tabLabel: record.name ?? '',
            };
        },
        toForm(record) {
            return {
                name: record.name ?? '',
                code: record.code ?? '',
                depreciationMethod: record.depreciation_method ?? '',
                assetLifeMonths: record.asset_life_months ?? 0,
            };
        },
        toPayload(values) {
            return {
                name: values.name?.trim() ?? '',
                code: values.code?.trim() ?? '',
                depreciation_method: values.depreciationMethod ?? 'Metode Garis Lurus',
                asset_life_months: Number(values.assetLifeMonths ?? 48),
                is_active: true,
            };
        },
    },
};

export function mapUserRow(record) {
    const roles = (record.roles ?? [])
        .map((role) => role.name)
        .filter(Boolean)
        .join(', ');
    const accessGroups = (record.accessGroups ?? [])
        .map((group) => group.name)
        .filter(Boolean)
        .join(', ');

    return {
        id: record.id,
        name: record.name ?? '',
        phone: record.phone ?? '',
        email: record.email ?? '',
        twoFactor: Boolean(record.two_factor_enabled || record.twoFactor),
        accessType: accessGroups || roles || 'Tanpa Grup',
        isActive: record.is_active !== false,
        tabLabel: record.name ?? '',
        roleIds: (record.roles ?? []).map((role) => role.id),
        accessGroupIds: (record.accessGroups ?? []).map((group) => group.id),
        branchIds: (record.branches ?? []).map((branch) => branch.id),
    };
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
        paymentTermId: record.payment_term_id ?? record.payment_term?.id ?? null,
        branchIds: (record.branches ?? []).map((branch) => branch.id),
        billingAddress: record.billing_address ?? '',
        shippingAddress: record.shipping_address ?? '',
        taxNumber: record.tax_number ?? '',
        notes: record.notes ?? '',
        creditLimit: record.credit_limit ?? 0,
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
    };
}

export function mapWarehouseRow(record) {
    return {
        id: record.id,
        code: record.code ?? '',
        name: record.name ?? '',
        type: record.warehouse_type ?? 'Gudang Lokal',
        branchName: record.branch?.name ?? '-',
        isActive: record.is_active !== false,
        tabLabel: record.name ?? '',
        branchId: record.branch_id ?? record.branch?.id ?? null,
    };
}

export function mapApprovalRuleRow(record) {
    const approvers = (record.steps ?? [])
        .map((step) => step.approver_user?.name ?? step.approver_role?.name)
        .filter(Boolean)
        .join(', ');

    return {
        id: record.id,
        ruleName: record.rule_name ?? '',
        transactionType: record.transaction_type ?? '',
        transactionTypeLabel: record.transaction_type ?? '',
        valueLabel: record.threshold_amount ? `> ${record.threshold_amount.toLocaleString('id-ID')}` : '-',
        approvedBy: approvers || 'Tidak ada penyetuju',
        createdBy: 'Semua Pengguna',
        branchLabel: record.branch?.name ?? 'Semua Cabang',
        isActive: record.is_active !== false,
        tabLabel: record.rule_name ?? '',
        branchId: record.branch_id ?? record.branch?.id ?? null,
    };
}

export function toUserPayload(values) {
    return {
        name: values.name?.trim() ?? '',
        email: values.email?.trim() ?? '',
        phone: values.phone?.trim() ?? '',
        password: values.password || undefined,
        is_active: values.isActive !== false,
        access_group_ids: values.accessGroupIds ?? [],
    };
}

export function mapStockOpnameOrderRow(record) {
    return {
        id: String(record.id),
        date: formatIsoDate(record.document_date),
        number: record.document_number ?? '',
        warehouse: record.warehouse?.name ?? '-',
        responsible: record.responsible_user?.name ?? '-',
        status: record.status ?? 'Draft',
        notes: record.notes ?? '',
        dateFilter: normalizeDisplayDate(record.document_date),
        statusFilter: record.status ?? 'Draft',
        tabLabel: record.document_number ?? `Opname #${record.id}`,
    };
}

export function toPartnerPayload(values) {
    return {
        code: values.code?.trim() ?? '',
        name: values.name?.trim() ?? '',
        category_id: values.categoryId ?? null,
        currency_id: values.currencyId ?? null,
        payment_term_id: values.paymentTermId ?? null,
        business_phone: values.phone?.trim() ?? '',
        email: values.email?.trim() ?? '',
        website: values.website?.trim() ?? '',
        billing_address: values.billingAddress ?? '',
        shipping_address: values.shippingAddress ?? '',
        tax_number: values.taxNumber ?? '',
        notes: values.notes ?? '',
        credit_limit: values.creditLimit ?? 0,
        is_active: values.isActive !== false,
        branch_ids: values.branchIds ?? [],
    };
}

export function mapFixedAssetRows(records) {
    return records.map((record) => {
        return {
            id: String(record.id),
            number: record.code ?? '',
            name: record.name ?? '',
            purchaseDate: formatIsoDate(record.purchase_date),
            quantity: String(record.quantity ?? 1),
            totalAsset: record.acquisition_cost ? Number(record.acquisition_cost).toLocaleString('id-ID') : '0',
            categoryFilter: record.asset_category_id ? String(record.asset_category_id) : 'all',
        };
    });
}

export function buildFixedAssetsFilters(rows) {
    const uniqueCategories = [...new Set(rows.map((row) => row.categoryFilter).filter((val) => val && val !== 'all'))];
    return [
        {
            id: 'category',
            rowKey: 'categoryFilter',
            options: [
                { value: 'all', label: 'Kategori Aset: Semua' },
                ...uniqueCategories.map((catId) => ({
                    value: catId,
                    label: `Kategori Aset: ${catId}`
                }))
            ]
        }
    ];
}

export function toFixedAssetPayload(values) {
    return {
        asset_category_id: values.asset_category_id ?? null,
        asset_tax_category_id: values.asset_tax_category_id ?? null,
        branch_id: values.branch_id ?? null,
        department_id: values.department_id ?? null,
        asset_account_id: values.asset_account_id ?? null,
        accumulated_depreciation_account_id: values.accumulated_depreciation_account_id ?? null,
        depreciation_expense_account_id: values.depreciation_expense_account_id ?? null,
        code: values.code?.trim() ?? '',
        name: values.name?.trim() ?? '',
        purchase_date: normalizeDisplayDate(values.purchaseDate) || null,
        usage_date: normalizeDisplayDate(values.usageDate) || null,
        is_intangible: Boolean(values.intangibleAsset),
        depreciation_method: values.depreciationMethod ?? 'Metode Garis Lurus',
        quantity: Number(values.quantity ?? 1),
        asset_life_years: Number(values.assetLifeYears ?? 0),
        asset_life_months: Number(values.assetLifeMonths ?? 0),
        depreciation_ratio: Number(values.ratio ?? 0),
        residual_value: parseAmountInput(values.residualValue, { emptyValue: 0 }) ?? 0,
        acquisition_cost: parseAmountInput(values.totalAssetValue, { emptyValue: 0 }) ?? 0,
        book_value: parseAmountInput(values.bookValue, { emptyValue: 0 }) ?? 0,
        tax_enabled: Boolean(values.taxEnabled),
        notes: values.notes?.trim() ?? '',
        is_active: true,
    };
}
