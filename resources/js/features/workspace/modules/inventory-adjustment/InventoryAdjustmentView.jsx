import { useMemo } from 'react';

import {
    buildInventoryAdjustmentRecord as buildBackendInventoryAdjustmentRecord,
    buildInventoryAdjustmentTableRows,
    INVENTORY_ADJUSTMENT_BACKEND_CONFIG,
} from '@/features/workspace/backend/inventoryAdjustmentBackend';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    buildInventoryAdjustmentConfig,
    buildInventoryAdjustmentRecord,
} from '@/features/workspace/modules/price-adjustment/priceAdjustmentConfig';
import {
    InventoryAdjustmentFormView,
    InventoryAdjustmentTableView,
} from '@/features/workspace/modules/inventory-adjustment/InventoryAdjustmentWorkspace';

export default function InventoryAdjustmentView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const backendConfig = INVENTORY_ADJUSTMENT_BACKEND_CONFIG[page.id] ?? null;
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
        resource: backendConfig?.resource,
        initialPerPage: 25,
        enabled: Boolean(backendConfig),
    });
    const pageConfig = page.inventoryAdjustment ?? page.priceAdjustment;
    const isPriceAdjustment = page.id === 'price-adjustment';
    const config = useMemo(
        () => {
            const baseConfig = buildInventoryAdjustmentConfig(pageConfig);

            baseConfig.labels = {
                ...baseConfig.labels,
                date: baseConfig.labels.date || 'Tanggal',
                documentNumber: isPriceAdjustment ? (baseConfig.labels.documentNumber || 'Nomor #') : 'No Penyesuaian #',
            };

            if (!backendConfig) {
                return baseConfig;
            }

            const mappedRows = buildInventoryAdjustmentTableRows(rows);

            // Build dynamic filter options from loaded data
            const uniqueMonths = [...new Set(mappedRows.map(r => {
                if (!r.dateFilter) return null;
                const [y, m] = r.dateFilter.split('-');
                return y && m ? `${y}-${m}` : null;
            }).filter(Boolean))].sort().reverse();

            const uniqueTypes = [...new Set(mappedRows.map(r => r.adjustmentType).filter(Boolean))].sort();
            const uniqueCategories = [...new Set(mappedRows.map(r => r.salesCategory).filter(Boolean))].sort();

            const monthLabel = (ym) => {
                const [y, m] = ym.split('-');
                const d = new Date(Number(y), Number(m) - 1);
                return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            };

            const dynamicFilters = (baseConfig.table.filters ?? []).map(f => {
                if (f.id === 'date') {
                    return {
                        ...f,
                        options: [
                            { value: 'all', label: 'Tanggal: Semua' },
                            ...uniqueMonths.map(ym => ({ value: ym, label: monthLabel(ym) })),
                        ],
                    };
                }
                if (f.id === 'type') {
                    return {
                        ...f,
                        options: [
                            { value: 'all', label: 'Tipe Penyesuaian: Semua' },
                            ...uniqueTypes.map(t => ({ value: t, label: t })),
                        ],
                    };
                }
                if (f.id === 'category') {
                    return {
                        ...f,
                        options: [
                            { value: 'all', label: 'Kategori Penjualan: Semua' },
                            ...uniqueCategories.map(c => ({ value: c, label: c })),
                        ],
                    };
                }
                if (f.id === 'inactive') {
                    return {
                        ...f,
                        options: [
                            { value: 'all', label: 'Status: Semua' },
                            { value: 'active', label: 'Aktif' },
                            { value: 'inactive', label: 'Non Aktif' },
                        ],
                    };
                }
                return f;
            });

            // matchesFilter di TableListView untuk dateFilter perlu exact match,
            // kita pakai prefix month match lewat rowKey custom
            const rowsWithMonthKey = mappedRows.map(r => ({
                ...r,
                dateFilter: r.dateFilter ? r.dateFilter.slice(0, 7) : '',
            }));

            return {
                ...baseConfig,
                table: {
                    ...baseConfig.table,
                    rows: rowsWithMonthKey,
                    filters: dynamicFilters,
                    pageValue: total.toLocaleString('id-ID'),
                    loading,
                    refreshLabel: loading ? 'Memuat data...' : (baseConfig.table.refreshLabel || 'Muat ulang'),
                    createLabel: baseConfig.table.createLabel || 'Tambah Penyesuaian',
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
                },
            };
        },
        [backendConfig, error, loading, pageConfig, reload, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage],
    );
    const resolvedBuildRecord = useMemo(
        () => (row = {}) => {
            if (row.__backendRecord) {
                return buildBackendInventoryAdjustmentRecord(row.__backendRecord, config);
            }

            return buildInventoryAdjustmentRecord(row, config);
        },
        [config],
    );

    return mode === 'table' ? (
        <InventoryAdjustmentTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <InventoryAdjustmentFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            buildRecord={resolvedBuildRecord}
            backendConfig={backendConfig}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
