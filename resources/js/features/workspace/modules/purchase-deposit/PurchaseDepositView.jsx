import { useCallback, useEffect, useMemo, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildPurchaseDepositConfig } from './purchaseDepositConfig';
import {
    buildPurchaseDepositFilters,
    buildPurchaseDepositRow,
    buildPurchaseDepositRecord,
} from './purchaseDepositShared';
import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';
import PurchaseDepositFormView from './PurchaseDepositFormView';

export default function PurchaseDepositView({
    page,
    mode,
    activeLevel2Tab,
    level2Tabs = [],
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
        serverTableProps,
    } = useBackendIndexResource({
        resource: 'purchase-deposits',
        initialPerPage: 25,
    });

    const config = useMemo(() => {
        const baseConfig = buildPurchaseDepositConfig(page?.purchaseDeposit);
        const mappedRows = rows.map(buildPurchaseDepositRow);

        return {
            ...baseConfig,
            rowMap: mappedRows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
            table: {
                ...baseConfig.table,
                label: 'Uang Muka Pembelian',
                resource: 'purchase-deposits',
                rows: mappedRows,
                filters: buildPurchaseDepositFilters(baseConfig.table?.filters, mappedRows),
                pageValue: total.toLocaleString('id-ID'),
                loading,
                emptyLabel: loading ? 'Memuat data...' : (error || 'Tidak ada data uang muka pembelian'),
                onRefresh: reload,
                refreshLoading: loading,
                ...serverTableProps,
            },
        };
    }, [loading, error, reload, page?.purchaseDeposit, rows, total, serverTableProps]);

    const buildRecord = useCallback((row) => {
        return buildPurchaseDepositRecord(row, config);
    }, [config]);

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full h-full relative">
            <div className={mode === 'table' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                <ModuleTableTemplate
                    table={config.table}
                    resourceName="purchase-deposits"
                    exportFilename="uang-muka-pembelian"
                    exportTitle="Laporan Uang Muka Pembelian"
                    onCreate={onOpenContent}
                    onOpenDetail={onOpenDetail}
                    disableExport={false}
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
                        <PurchaseDepositFormView
                            key={tab.id}
                            pageId={page.id}
                            config={config}
                            buildRecord={buildRecord}
                            activeLevel2Tab={tab}
                            onOpenContent={onOpenContent}
                            onOpenDetail={onOpenDetail}
                            onCloseDetail={onCloseDetail}
                            onRefresh={reload}
                        />
                    </div>
                );
            })}
        </div>
    );
}
