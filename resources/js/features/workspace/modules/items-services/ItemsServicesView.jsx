import { useEffect, useMemo, useState } from 'react';

import { buildItemsServicesConfig } from '@/features/workspace/modules/items-services/itemsServicesConfig';
import ItemsServicesFormView from '@/features/workspace/modules/items-services/ItemsServicesFormView';
import ItemsServicesTableView from '@/features/workspace/modules/items-services/ItemsServicesTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapProductRow } from '@/features/workspace/backend/workspaceBackendAdapters';

export default function ItemsServicesView({
    page,
    mode,
    activeLevel2Tab, level2Tabs = [],
    onOpenContent,
    onOpenDetail,}) {
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
        const mapped = rows.map(mapProductRow);

        const uniqueBrands = [...new Set(mapped.map((r) => r.brand).filter(Boolean))];
        const brandOptions = [
            { value: 'all', label: 'Merek Barang: Semua' },
            ...uniqueBrands.map((b) => ({ value: b, label: `Merek Barang: ${b}` })),
        ];

        const uniqueCategories = [...new Set(mapped.map((r) => r.categoryFilter).filter(Boolean))];
        const categoryOptions = [
            { value: 'all', label: 'Kategori Barang: Semua' },
            ...uniqueCategories.map((cat) => ({ value: cat, label: `Kategori Barang: ${cat}` })),
        ];

        const updatedFilters = (baseConfig.table.filters ?? []).map((filter) => {
            if (filter.id === 'brand') {
                return { ...filter, options: brandOptions };
            }
            if (filter.id === 'category') {
                return { ...filter, options: categoryOptions };
            }
            return filter;
        });

        return {
            ...baseConfig,
            table: {
                loading,

                ...baseConfig.table,
                rows: mapped,
                filters: updatedFilters,
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
                refreshLabel: baseConfig.table?.refreshLabel || 'Muat ulang',
                onRefresh: reload,
            },
        };
    }, [loading, page.itemsServices, reload, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

        const [lastActiveFormTab, setLastActiveFormTab] = useState(null);

    useEffect(() => {
        if (activeLevel2Tab && activeLevel2Tab.kind === 'content') {
            setLastActiveFormTab(activeLevel2Tab);
        } else if (!activeLevel2Tab) {
            setLastActiveFormTab(null);
        }
    }, [activeLevel2Tab]);

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <ItemsServicesTableView
            config={config}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
            </div>
            {level2Tabs.map((tab) => {
                if (tab.kind !== 'content') return null;

                const isCurrentForm = mode === 'form' && activeLevel2Tab?.id === tab.id;

                return (
                    <div
                        key={tab.id}
                        className={isCurrentForm ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}
                    >
                        <ItemsServicesFormView
                            key={tab.id}
            pageId={page.id}
            config={config}
            activeLevel2Tab={tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
                        />
                    </div>
                );
            })}
        </div>
    );
}
