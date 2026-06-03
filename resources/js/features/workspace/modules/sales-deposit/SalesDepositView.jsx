import { useCallback, useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildSalesDepositConfig, buildSalesDepositRecord } from '@/features/workspace/modules/sales-deposit/salesDepositConfig';
import {
    buildSalesDepositFilters,
    buildSalesDepositRow,
    buildSalesDepositRecord as buildSalesDepositRecordFromBackend,
} from '@/features/workspace/modules/sales-deposit/salesDepositShared';
import SalesDepositFormView from './SalesDepositFormView';
import SalesDepositTableView from './SalesDepositTableView';

export default function SalesDepositView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'sales-deposits',
        filters: {
            per_page: 100,
        },
    });
    const config = useMemo(() => {
        const baseConfig = buildSalesDepositConfig(page.salesDeposit);
        const mappedRows = rows.map(buildSalesDepositRow);

        return {
            ...baseConfig,
            rowMap: mappedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
            table: {
                ...baseConfig.table,
                rows: mappedRows,
                filters: buildSalesDepositFilters(baseConfig.table?.filters, mappedRows),
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat data...' : baseConfig.table?.refreshLabel,
            },
        };
    }, [loading, page.salesDeposit, rows, total]);

    const buildRecord = useCallback((row) => {
        if (row?.__backendRecord) {
            return buildSalesDepositRecordFromBackend(row.__backendRecord, config);
        }

        return buildSalesDepositRecord(row);
    }, [config]);

    return mode === 'table' ? (
        <SalesDepositTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            loading={loading}
            error={error}
            onRefresh={reload}
        />
    ) : (
        <SalesDepositFormView
            pageId={page.id}
            config={config}
            buildRecord={buildRecord}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
