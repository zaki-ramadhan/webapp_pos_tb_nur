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
    return records.map((record) => ({
        id: record.id,
        dateValue: normalizeDisplayDate(record.occurred_at),
        transactionDateValue: normalizeDisplayDate(record.metadata?.transaction_date) || 'empty',
        transactionDateLabel: formatIsoDate(record.metadata?.transaction_date),
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
    }));
}

export function buildActivityLogFilters(rows) {
    const uniqueDateValues = [...new Set(rows.map((row) => row.dateValue).filter(Boolean))].map((value) => ({
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
            options: buildSelectOptions([], 'Tgl Transaksi', '-'),
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
                categoryMap.set(categoryId, {
                    id: categoryId,
                    label: categoryLabel,
                    icon: metadata.category_icon ?? record.icon ?? 'reports',
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
};
