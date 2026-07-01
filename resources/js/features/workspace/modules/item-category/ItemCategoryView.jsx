import { useMemo } from 'react';
import ItemCategoryFormView from './ItemCategoryFormView';
import ItemCategoryTableView from './ItemCategoryTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';

export default function ItemCategoryView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
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
        to,
    } = useBackendIndexResource({
        resource: 'product-categories',
        initialPerPage: 25,
    });

    const config = useMemo(() => {
        const baseConfig = page.itemCategory;
        const mappedRows = rows.map((row) => ({
            id: String(row.id),
            code: row.code ?? '',
            name: row.name ?? '',
            defaultLabel: row.is_default ? 'Ya' : 'Tidak',
            isDefault: Boolean(row.is_default),
            isSubCategory: Boolean(row.parent_id),
            tabLabel: row.name ?? '',
        }));

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat...' : baseConfig.table?.refreshLabel,
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
            },
        };
    }, [loading, page.itemCategory, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage, reload]);

    return mode === 'table' ? (
        <ItemCategoryTableView page={{ itemCategory: config }} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <ItemCategoryFormView
            key={activeLevel2Tab?.id ?? 'new'}
            page={{ itemCategory: config }}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}

