import { useCallback, useEffect, useMemo, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildSalesDepositConfig, buildSalesDepositRecord } from '@/features/workspace/modules/sales-deposit/salesDepositConfig';
import {
    buildSalesDepositFilters,
    buildSalesDepositRow,
    buildSalesDepositRecord as buildSalesDepositRecordFromBackend,
} from '@/features/workspace/modules/sales-deposit/salesDepositShared';
import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';
import SalesDepositFormView from './SalesDepositFormView';

export default function SalesDepositView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
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
        resource: 'sales-deposits',
        initialPerPage: 25,
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
                label: 'Uang Muka Penjualan',
                resource: 'sales-deposits',
                rows: mappedRows,
                filters: buildSalesDepositFilters(baseConfig.table?.filters, mappedRows),
                pageValue: total.toLocaleString('id-ID'),
                loading,
                emptyLabel: error || 'Belum ada data',
                onRefresh: reload,
                refreshLoading: loading,
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
    }, [loading, error, reload, page.salesDeposit, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    const buildRecord = useCallback((row) => {
        if (row?.__backendRecord) {
            return buildSalesDepositRecordFromBackend(row.__backendRecord, config);
        }

        return buildSalesDepositRecord(row);
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
                <ModuleTableTemplate
            table={config.table}
            resourceName="sales-deposits"
            exportFilename="uang-muka-penjualan"
            exportTitle="Laporan Uang Muka Penjualan"
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            disableExport={true}
        />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <SalesDepositFormView
            pageId={page.id}
            config={config}
            buildRecord={buildRecord}
            activeLevel2Tab={lastActiveFormTab}
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
