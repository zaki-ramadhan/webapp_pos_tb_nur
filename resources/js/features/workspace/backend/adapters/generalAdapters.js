import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import {
    normalizeDisplayDate,
    formatIsoDate,
    formatDateTime,
    formatDateTimeVerbose,
    titleizeKey,
    buildSelectOptions,
} from './dateHelpers';

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

    const fallbackOrder = (fallbackConfig.categories ?? []).map((c) => c.id);
    const sortedCategories = [...categoryMap.values()].sort((a, b) => {
        const indexA = fallbackOrder.indexOf(a.id);
        const indexB = fallbackOrder.indexOf(b.id);
        const rankA = indexA === -1 ? fallbackOrder.length : indexA;
        const rankB = indexB === -1 ? fallbackOrder.length : indexB;
        return rankA - rankB;
    });

    return {
        ...fallbackConfig,
        categories: categoryMap.size ? sortedCategories : fallbackConfig.categories,
        reports,
    };
}

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
