import { useMemo } from 'react';
import ItemCategoryFormView from './ItemCategoryFormView';
import ItemCategoryTableView from './ItemCategoryTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';

export default function ItemCategoryView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'product-categories',
        filters: {
            per_page: 100,
        },
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
            },
        };
    }, [loading, page.itemCategory, rows, total, reload]);

    return mode === 'table' ? (
        <ItemCategoryTableView page={{ itemCategory: config }} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <ItemCategoryFormView
            page={{ itemCategory: config }}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}

