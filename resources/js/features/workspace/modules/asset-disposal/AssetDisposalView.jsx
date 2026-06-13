import { useMemo } from 'react';

import AssetDisposalFormView from './AssetDisposalFormView';
import AssetDisposalTableView from './AssetDisposalTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { buildAssetDisposalConfig } from './assetDisposalConfig';

export default function AssetDisposalView({
    page,
    mode = 'table',
    activeLevel2Tab = null,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const {
        rows,
        total,
        loading,
        error,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to
    } = useBackendIndexResource({
        resource: 'asset-disposals',
        initialPerPage: 25,
        enabled: true,
    });

    const pageWithDynamicData = useMemo(() => {
        const baseConfig = buildAssetDisposalConfig(page.assetDisposal ?? {});

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

        const newConfig = {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: loading ? 'Memuat data...' : baseConfig.table.refreshLabel,
                emptyLabel: error || 'Belum ada data',
                onRefresh: reload,
                pagination: {
                    page: currentPage,
                    perPage,
                    total,
                    lastPage,
                    from,
                    to,
                    onPageChange: setPage,
                    onPerPageChange: setPerPage,
                },
            }
        };

        return {
            ...page,
            assetDisposal: newConfig
        };
    }, [page, rows, total, loading, error, reload, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    if (mode === 'form') {
        return (
            <AssetDisposalFormView
                page={pageWithDynamicData}
                activeLevel2Tab={activeLevel2Tab}
                onOpenContent={onOpenContent}
                onCloseDetail={onCloseDetail}
                onRefresh={reload}
            />
        );
    }

    return (
        <AssetDisposalTableView
            page={pageWithDynamicData}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    );
}