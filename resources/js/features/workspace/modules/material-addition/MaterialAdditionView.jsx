import { useCallback, useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildMaterialAdditionConfig, buildMaterialAdditionRecord as buildStaticMaterialAdditionRecord } from './materialAdditionConfig';
import MaterialAdditionFormView from './MaterialAdditionFormView';
import MaterialAdditionTableView from './MaterialAdditionTableView';
import {
    buildMaterialAdditionFilters,
    buildMaterialAdditionRecord,
    buildMaterialAdditionRow,
} from './materialAdditionShared';

export default function MaterialAdditionView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
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
        resource: 'material-additions',
        initialPerPage: 25,
    });
    const config = useMemo(() => {
        const baseConfig = buildMaterialAdditionConfig(page.materialAddition);
        const mappedRows = rows.map(buildMaterialAdditionRow);

        return {
            ...baseConfig,
            rowMap: mappedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
            table: {
                ...baseConfig.table,
                rows: mappedRows,
                filters: buildMaterialAdditionFilters(baseConfig.table?.filters, mappedRows),
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
    }, [loading, page.materialAddition, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    const buildRecord = useCallback((row) => {
        if (row?.__backendRecord) {
            return buildMaterialAdditionRecord(row.__backendRecord, config);
        }

        return buildStaticMaterialAdditionRecord(row ?? {}, config);
    }, [config]);

    if (mode === 'table') {
        return (
            <MaterialAdditionTableView
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
        <MaterialAdditionFormView
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
