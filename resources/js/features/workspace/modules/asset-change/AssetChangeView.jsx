import { useMemo } from 'react';

import { buildAssetChangeConfig } from './assetChangeConfig';
import AssetChangeFormView from './AssetChangeFormView';
import AssetChangeTableView from './AssetChangeTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';

export default function AssetChangeView({
    page,
    mode = 'table',
    activeLevel2Tab = null,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'asset-changes',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });

    const config = useMemo(() => {
        const baseConfig = buildAssetChangeConfig(page.assetChange ?? {});
        
        const mappedRows = rows.map((record) => {
            const firstAssetLine = record.lines?.find((line) => line.fixed_asset) ?? record.lines?.[0];
            const assetName = firstAssetLine?.fixed_asset?.name ?? record.metadata?.asset_name ?? '-';
            
            return {
                id: String(record.id),
                __backendRecord: record,
                number: record.document_number ?? '',
                date: record.entry_date ? formatIsoDate(record.entry_date) : '',
                notes: record.notes ?? '',
                assetName: assetName,
                status: record.status ?? 'Draft',
            };
        });

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: loading ? 'Memuat data...' : baseConfig.table?.refreshLabel,
                emptyLabel: error || 'Belum ada data',
                onRefresh: reload,
            },
        };
    }, [page.assetChange, rows, total, loading, error, reload]);

    if (mode === 'table') {
        return <AssetChangeTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />;
    }

    return (
        <AssetChangeFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}

