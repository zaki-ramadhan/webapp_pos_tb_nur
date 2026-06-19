import { useMemo } from 'react';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import AssetTaxCategoryTableView from './AssetTaxCategoryTableView';
import AssetTaxCategoryFormView from './AssetTaxCategoryFormView';
import { calculateAssetTaxCategoryRate } from './assetTaxCategoryConfig';

function mapAssetTaxCategoryRow(record) {
    const yearsValue = record.asset_life_months ? Math.round(record.asset_life_months / 12) : 0;
    const rateValue = record.depreciation_rate !== undefined && record.depreciation_rate !== null
        ? String(record.depreciation_rate)
        : calculateAssetTaxCategoryRate(record.depreciation_method, yearsValue);

    return {
        id: record.id,
        name: record.name ?? '',
        code: record.code ?? '',
        depreciationMethod: record.depreciation_method ?? 'Metode Garis Lurus',
        estimatedLifeYears: String(yearsValue),
        depreciationRate: rateValue,
        methodFilter: record.depreciation_method ?? 'Metode Garis Lurus',
        inactiveValue: record.is_active === false ? 'yes' : 'no',
        tabLabel: record.name ?? '',
    };
}

export default function AssetTaxCategoryView({
    page,
    mode = 'table',
    activeLevel2Tab = null,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const resource = useWorkspaceResource({
        resource: 'asset-tax-categories',
        initialPerPage: 25,
        mapRow: mapAssetTaxCategoryRow,
        enabled: true,
    });

    const resolvedPage = useMemo(() => {
        return {
            ...page,
            assetTaxCategory: {
                ...page.assetTaxCategory,
                table: {
                    ...page.assetTaxCategory?.table,
                    ...resource.tableProps,
                    rows: resource.mappedRows,
                    pageValue: resource.total.toLocaleString('id-ID'),
                    loading: resource.loading,
                },
            },
        };
    }, [page, resource]);

    if (mode === 'form') {
        return (
            <AssetTaxCategoryFormView
                pageId={page.id}
                form={resolvedPage.assetTaxCategory}
                tableRows={resolvedPage.assetTaxCategory?.table?.rows ?? []}
                activeLevel2Tab={activeLevel2Tab}
                onOpenContent={onOpenContent}
                onOpenDetail={onOpenDetail}
                onCloseDetail={onCloseDetail}
                onRefresh={resource.reload}
            />
        );
    }

    return (
        <AssetTaxCategoryTableView
            table={resolvedPage.assetTaxCategory?.table}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    );
}
