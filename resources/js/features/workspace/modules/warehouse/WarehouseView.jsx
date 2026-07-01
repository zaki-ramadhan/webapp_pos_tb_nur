import { useCallback, useEffect, useMemo, useState } from 'react';
import WarehouseFormView from './WarehouseFormView';
import WarehouseTableView from './WarehouseTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { buildWarehouseEntry, mapWarehouseTableRow } from './warehouseShared';

export default function WarehouseView({
    page,
    mode,
    activeLevel2Tab,
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
        to,
    } = useBackendIndexResource({
        resource: 'warehouses',
        initialPerPage: 25,
    });

    // ─── Pola SalaryAllowance: fetch detail record di level View ─────────────
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

    // Inisialisasi synchronous untuk mock records agar data sudah siap saat mount pertama
    const [fetchedDetailRow, setFetchedDetailRow] = useState(() => {
        if (!recordId) return null;
        const mockDetail = page.warehouse?.detailRecords?.[recordId];
        if (mockDetail) return { ...mockDetail, id: recordId, __source: 'mock' };
        return null;
    });
    const [fetchingId, setFetchingId] = useState(null);

    useEffect(() => {
        if (!recordId) {
            setFetchedDetailRow(null);
            return;
        }

        // Cek mock dulu (string id seperti 'warehouse-jakarta')
        const mockDetail = page.warehouse?.detailRecords?.[recordId];
        if (mockDetail) {
            setFetchedDetailRow({ ...mockDetail, id: recordId, __source: 'mock' });
            return;
        }

        // Fetch dari backend hanya jika ID numerik
        const numericId = Number(recordId);
        if (!Number.isFinite(numericId) || numericId <= 0) return;

        let active = true;
        setFetchingId(recordId);

        async function fetchDetail() {
            try {
                const record = await getBackendResource('warehouses', recordId);
                if (active && record) {
                    setFetchedDetailRow({ ...record, __source: 'backend' });
                }
            } catch {
                // Ignore – form akan menampilkan data terbatas dari tabel
            } finally {
                if (active) setFetchingId(null);
            }
        }
        fetchDetail();
        return () => { active = false; };
    }, [recordId, page.warehouse?.detailRecords]);

    // ─── Bangun entry lengkap yang dioper ke FormView ─────────────────────────
    const defaults = useMemo(() => page.warehouse?.createDefaults ?? {}, [page.warehouse]);
    const warehouseEntry = useMemo(
        () => buildWarehouseEntry(fetchedDetailRow, defaults),
        [fetchedDetailRow, defaults],
    );

    // ─── Config untuk tabel ───────────────────────────────────────────────────
    const config = useMemo(() => {
        const baseConfig = page.warehouse;
        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: rows.map(mapWarehouseTableRow),
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat...' : baseConfig.table.refreshLabel,
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
    }, [loading, page.warehouse, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    const handlePersist = useCallback((record) => {
        setFetchedDetailRow({ ...record, __source: 'backend' });
    }, []);

    return mode === 'table' ? (
        <WarehouseTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <WarehouseFormView
            key={activeLevel2Tab?.id ?? 'new'}
            config={config}
            entry={warehouseEntry}
            isDetailMode={Boolean(recordId)}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            onPersist={handlePersist}
        />
    );
}
