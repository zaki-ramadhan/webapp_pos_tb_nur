import { useCallback, useMemo, useState, useEffect } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildItemRequestConfig, buildItemRequestRecord as buildStaticItemRequestRecord } from './itemRequestConfig';
import ItemRequestFormView from './ItemRequestFormView';
import ItemRequestTableView from './ItemRequestTableView';
import {
    buildItemRequestFilters,
    buildItemRequestRecord,
    buildItemRequestRow,
} from './itemRequestShared';

export default function ItemRequestView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail }) {
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
        resource: 'item-requests',
        initialPerPage: 25,
    });
    const config = useMemo(() => {
        const baseConfig = buildItemRequestConfig(page.itemRequest);
        const mappedRows = rows.map(buildItemRequestRow);

        return {
            ...baseConfig,
            rowMap: mappedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
            table: {
                loading,

                ...baseConfig.table,
                rows: mappedRows,
                filters: buildItemRequestFilters(baseConfig.table?.filters, mappedRows),
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
                refreshLabel: loading ? 'Memuat data...' : baseConfig.table?.refreshLabel,
            },
        };
    }, [loading, page.itemRequest, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    const buildRecord = useCallback((row) => {
        if (row?.__backendRecord) {
            return buildItemRequestRecord(row.__backendRecord, config);
        }

        return buildStaticItemRequestRecord(row ?? {}, config);
    }, [config]);

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
                <ItemRequestTableView
                    config={config}
                    onCreate={onOpenContent}
                    onOpenDetail={onOpenDetail}
                    loading={loading}
                    error={error}
                    onRefresh={reload}
                />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <ItemRequestFormView
                        key={lastActiveFormTab.id}
                        pageId={page.id}
                        config={config}
                        activeLevel2Tab={lastActiveFormTab}
                        onOpenContent={onOpenContent}
                        onOpenDetail={onOpenDetail}
                        onCloseDetail={onCloseDetail}
                        onRefresh={reload}
                        buildRecord={buildRecord}
                    />
                </div>
            )}
        </div>
    );
}
