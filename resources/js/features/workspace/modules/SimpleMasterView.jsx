import { useEffect, useMemo, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { SIMPLE_MASTER_BACKEND_CONFIG } from '@/features/workspace/backend/workspaceBackendAdapters';
import SimpleMasterFormView from './simple-master/SimpleMasterFormView';
import SimpleMasterTableView from './simple-master/SimpleMasterTableView';

export default function SimpleMasterView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
    const backendConfig = SIMPLE_MASTER_BACKEND_CONFIG[page.id] ?? null;
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
        resource: backendConfig?.resource,
        initialPerPage: 25,
        enabled: Boolean(backendConfig),
    });

    const resolvedPage = useMemo(() => {
        if (!backendConfig) {
            return page;
        }

        const mappedRows = rows.map((row) => backendConfig.toRow(row));

        return {
            ...page,
            table: {
                ...page.table,
                resource: backendConfig.resource,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: loading ? 'Memuat data...' : page.table?.refreshLabel,
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
    }, [backendConfig, error, loading, page, reload, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

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
                <SimpleMasterTableView table={resolvedPage.table} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <SimpleMasterFormView
            key={lastActiveFormTab.id}
            page={resolvedPage}
            activeLevel2Tab={lastActiveFormTab}
            backendConfig={backendConfig}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
                </div>
            )}
        </div>
    );
}
