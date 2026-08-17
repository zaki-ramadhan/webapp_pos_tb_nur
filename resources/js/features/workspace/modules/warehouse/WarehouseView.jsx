import { useCallback, useEffect, useMemo, useState } from 'react';
import WarehouseFormView from './WarehouseFormView';
import WarehouseTableView from './WarehouseTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { getBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import { buildWarehouseEntry, mapWarehouseTableRow } from './warehouseShared';

export default function WarehouseView({
    page,
    mode,
    activeLevel2Tab, level2Tabs = [],
    onOpenContent,
    onOpenDetail,
    onCloseDetail,}) {
    const {
        rows,
        total,
        loading,
        error,
        reload,
        serverTableProps,
    } = useBackendIndexResource({
        resource: 'warehouses',
        initialPerPage: 25,
    });

    const defaults = useMemo(() => page.warehouse?.createDefaults ?? {}, [page.warehouse]);

    const [fetchedDetailRowMap, setFetchedDetailRowMap] = useState(() => {
        const initial = {};
        const mockRecords = page.warehouse?.detailRecords ?? {};
        Object.entries(mockRecords).forEach(([id, data]) => {
            initial[id] = { ...data, id, __source: 'mock' };
        });
        return initial;
    });

    // Fetch detail records untuk setiap tab detail yang sedang dibuka
    useEffect(() => {
        const detailTabs = (level2Tabs || []).filter((t) => t.tabType === 'detail' && t.recordId);
        if (activeLevel2Tab?.tabType === 'detail' && activeLevel2Tab.recordId) {
            if (!detailTabs.some((t) => String(t.recordId) === String(activeLevel2Tab.recordId))) {
                detailTabs.push(activeLevel2Tab);
            }
        }

        detailTabs.forEach((tab) => {
            const rid = tab.recordId;
            const numericId = Number(rid);
            if (Number.isFinite(numericId) && numericId > 0 && !fetchedDetailRowMap[rid]) {
                getBackendResource('warehouses', rid)
                    .then((record) => {
                        if (record) {
                            setFetchedDetailRowMap((prev) => ({
                                ...prev,
                                [rid]: { ...record, __source: 'backend' },
                            }));
                        }
                    })
                    .catch(() => {});
            }
        });
    }, [level2Tabs, activeLevel2Tab, fetchedDetailRowMap]);

    const handlePersist = useCallback((record) => {
        if (record?.id) {
            setFetchedDetailRowMap((prev) => ({
                ...prev,
                [record.id]: { ...record, __source: 'backend' },
            }));
        }
    }, []);

    // ─── Config untuk tabel ───────────────────────────────────────────────────
    const config = useMemo(() => {
        const baseConfig = page.warehouse;
        return {
            ...baseConfig,
            table: {
                loading,
                error,
                emptyLabel: error || baseConfig.table?.emptyLabel || 'Tidak ada data',
                ...baseConfig.table,
                columns: (() => {
                    const baseCols = baseConfig.table?.columns ?? [];
                    const extraCols = [
                        { id: 'responsiblePerson', label: 'Penanggung Jawab', widthClassName: 'w-[160px]', align: 'left', defaultHidden: true },
                        { id: 'fullAddress', label: 'Alamat Lengkap', widthClassName: 'w-[260px]', align: 'left', defaultHidden: true },
                        { id: 'allUsersText', label: 'Hak Akses Pengguna', widthClassName: 'w-[180px]', align: 'left', defaultHidden: true },
                        { id: 'description', label: 'Keterangan', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true, truncate: true },
                        { id: 'isActiveText', label: 'Non Aktif', widthClassName: 'w-[110px]', align: 'center', defaultHidden: true }
                    ];
                    const filteredExtra = extraCols.filter((col) => !baseCols.some((bc) => bc.id === col.id));
                    return [...baseCols, ...filteredExtra];
                })(),
                rows: rows.map(mapWarehouseTableRow),
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: baseConfig.table?.refreshLabel || 'Muat ulang',
                onRefresh: reload,
                ...serverTableProps,
            },
        };
    }, [loading, error, page.warehouse, rows, total, reload, serverTableProps]);

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <WarehouseTableView
                    config={config}
                    onCreate={onOpenContent}
                    onOpenDetail={onOpenDetail}
                    onRefresh={reload}
                />
            </div>
            {level2Tabs.map((tab) => {
                if (tab.kind !== 'content') return null;

                const isCurrentForm = mode === 'form' && activeLevel2Tab?.id === tab.id;
                const tabRecordId = tab.tabType === 'detail' ? tab.recordId : null;
                const tabRawRecord = tabRecordId
                    ? (fetchedDetailRowMap[tabRecordId] || page.warehouse?.detailRecords?.[tabRecordId] || null)
                    : null;
                const tabEntry = buildWarehouseEntry(tabRawRecord, defaults);

                return (
                    <div
                        key={tab.id}
                        className={isCurrentForm ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}
                    >
                        <WarehouseFormView
                            key={tab.id}
                            config={config}
                            entry={tabEntry}
                            isDetailMode={Boolean(tabRecordId)}
                            activeLevel2Tab={tab}
                            onOpenContent={onOpenContent}
                            onOpenDetail={onOpenDetail}
                            onCloseDetail={onCloseDetail}
                            onRefresh={reload}
                            onPersist={handlePersist}
                        />
                    </div>
                );
            })}
        </div>
    );
}
