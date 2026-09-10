import { useMemo } from 'react';

import { buildBusinessPartnerConfig } from '@/features/workspace/modules/business-partner/businessPartnerConfig';
import { BusinessPartnerTableView } from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import BusinessPartnerFormView from '@/features/workspace/modules/business-partner/BusinessPartnerFormView';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import { mapPartnerRow } from '@/features/workspace/backend/workspaceBackendAdapters';

export default function BusinessPartnerView({
    page,
    mode,
    activeLevel2Tab,
    level2Tabs = [],
    onOpenContent,
    onOpenDetail,
    partnerType = 'customer',
}) {
    const resourceName = partnerType === 'supplier' ? 'suppliers' : 'customers';
    const {
        mappedRows,
        tableProps,
        reload,
        error,
    } = useWorkspaceResource({
        resource: resourceName,
        initialPerPage: 25,
        mapRow: mapPartnerRow,
    });

    const pageConfig = partnerType === 'supplier' ? page.suppliers ?? {} : page.customers ?? {};
    const config = useMemo(() => {
        const baseConfig = buildBusinessPartnerConfig(partnerType, pageConfig);
        const rowsWithFilters = mappedRows.map((row) => ({
            ...row,
            inactiveValue: row.isActive ? 'active' : 'inactive',
        }));

        const uniqueCategories = [...new Set(rowsWithFilters.map((r) => r.categoryName).filter(Boolean))];
        const categoryOptions = [
            { value: 'all', label: 'Kategori: Semua' },
            ...uniqueCategories.map((cat) => ({ value: cat, label: `Kategori: ${cat}` })),
        ];

        const statusOptions = [
            { value: 'all', label: 'Status: Semua' },
            { value: 'active', label: 'Status: Aktif' },
            { value: 'inactive', label: 'Status: Non Aktif' },
        ];

        const updatedFilters = (baseConfig.table.filters ?? []).map((filter) => {
            if (filter.id === 'inactive') {
                return { ...filter, rowKey: 'inactiveValue', options: statusOptions };
            }
            if (filter.id === 'category') {
                return { ...filter, rowKey: 'categoryName', options: categoryOptions };
            }
            return filter;
        });

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                ...tableProps,
                error,
                emptyLabel: error || baseConfig.table?.emptyLabel || 'Belum ada data',
                rows: rowsWithFilters,
                filters: updatedFilters,
                pageValue: tableProps.total.toLocaleString('id-ID'),
                refreshLabel: baseConfig.table?.refreshLabel || 'Muat ulang',
                onRefresh: reload,
            },
        };
    }, [pageConfig, partnerType, mappedRows, tableProps, reload, error]);

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <BusinessPartnerTableView
                    config={config}
                    onCreate={onOpenContent}
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
                        <BusinessPartnerFormView
                            key={tab.id}
                            config={config}
                            activeLevel2Tab={tab}
                            partnerType={partnerType}
                            onRefresh={reload}
                            onOpenDetail={onOpenDetail}
                        />
                    </div>
                );
            })}
        </div>
    );
}
