import { useCallback, useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildItemRequestConfig, buildItemRequestRecord as buildStaticItemRequestRecord } from './itemRequestConfig';
import ItemRequestFormView from './ItemRequestFormView';
import ItemRequestTableView from './ItemRequestTableView';
import {
    buildItemRequestFilters,
    buildItemRequestRecord,
    buildItemRequestRow,
} from './itemRequestShared';

export default function ItemRequestView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'item-requests',
        filters: {
            per_page: 100,
        },
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
                ...baseConfig.table,
                rows: mappedRows,
                filters: buildItemRequestFilters(baseConfig.table?.filters, mappedRows),
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat data...' : baseConfig.table?.refreshLabel,
            },
        };
    }, [loading, page.itemRequest, rows, total]);

    const buildRecord = useCallback((row) => {
        if (row?.__backendRecord) {
            return buildItemRequestRecord(row.__backendRecord, config);
        }

        return buildStaticItemRequestRecord(row ?? {}, config);
    }, [config]);

    if (mode === 'table') {
        return (
            <ItemRequestTableView
                config={config}
                onCreate={onOpenContent}
                onOpenDetail={onOpenDetail}
                loading={loading}
                error={error}
                onRefresh={reload}
            />
        );
    }

    return (
        <ItemRequestFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
            buildRecord={buildRecord}
        />
    );
}
