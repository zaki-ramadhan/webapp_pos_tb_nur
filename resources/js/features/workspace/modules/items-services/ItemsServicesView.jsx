import { useMemo } from 'react';

import { buildItemsServicesConfig } from '@/features/workspace/modules/items-services/itemsServicesConfig';
import ItemsServicesFormView from '@/features/workspace/modules/items-services/ItemsServicesFormView';
import ItemsServicesTableView from '@/features/workspace/modules/items-services/ItemsServicesTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapProductRow } from '@/features/workspace/backend/workspaceBackendAdapters';

export default function ItemsServicesView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
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
        resource: 'products',
        initialPerPage: 25,
    });

    const config = useMemo(() => {
        const baseConfig = buildItemsServicesConfig(page.itemsServices);
        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: rows.map(mapProductRow),
                pageValue: total.toLocaleString('id-ID'),
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
                refreshLabel: loading ? 'Memuat...' : baseConfig.table.refreshLabel,
            },
        };
    }, [loading, page.itemsServices, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    return mode === 'table' ? (
        <ItemsServicesTableView
            config={config}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <ItemsServicesFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    );
}
