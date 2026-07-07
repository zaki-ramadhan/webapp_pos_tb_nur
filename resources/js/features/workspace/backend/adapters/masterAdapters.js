import { emptyStringToNull } from './dateHelpers';

export const SIMPLE_MASTER_BACKEND_CONFIG = {
    'item-brand': {
        resource: 'brands',
        labelField: 'name',
        toRow(record) {
            return {
                id: record.id,
                name: record.name ?? '',
                tabLabel: record.name ?? '',
                isActiveText: record.is_active !== false ? 'Tidak' : 'Ya',
            };
        },
        toForm(record) {
            return {
                name: record.name ?? '',
            };
        },
        toPayload(values) {
            return {
                name: values.name?.trim() ?? '',
                is_active: true,
            };
        },
    },
    'item-unit': {
        resource: 'units',
        labelField: 'name',
        toRow(record) {
            return {
                id: record.id,
                name: record.name ?? '',
                tabLabel: record.name ?? '',
                taxCode: record.tax_reference_code ?? '-',
                precision: record.precision ?? 0,
                isActiveText: record.is_active !== false ? 'Tidak' : 'Ya',
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
                description: record.description ?? '-',
                tabLabel: record.name ?? '',
                isActiveText: record.is_active !== false ? 'Tidak' : 'Ya',
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
                isSubCategoryText: record.parent_id ? 'Ya' : 'Tidak',
                tabLabel: record.name ?? '',
                isActiveText: record.is_active !== false ? 'Tidak' : 'Ya',
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
                isSubCategoryText: record.parent_id ? 'Ya' : 'Tidak',
                tabLabel: record.name ?? '',
                isActiveText: record.is_active !== false ? 'Tidak' : 'Ya',
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
