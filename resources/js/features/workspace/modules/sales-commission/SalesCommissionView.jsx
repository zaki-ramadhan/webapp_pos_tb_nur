import { useEffect, useMemo, useState } from 'react';
import SalesCommissionFormView from './SalesCommissionFormView';
import SalesCommissionTableView from './SalesCommissionTableView';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';

export default function SalesCommissionView({
    page,
    mode,
    activeLevel2Tab, level2Tabs = [],
    onOpenContent,
    onOpenDetail,
    onCloseDetail,}) {
    const {
        mappedRows,
        tableProps,
        reload,
    } = useWorkspaceResource({
        resource: 'sales-commissions',
        initialPerPage: 25,
        mapRow: (row) => {
            let meta = {};
            try {
                if (typeof row.metadata === 'object' && row.metadata !== null) {
                    meta = row.metadata;
                } else if (typeof row.metadata === 'string' && (row.metadata.startsWith('{') || row.metadata.startsWith('['))) {
                    meta = JSON.parse(row.metadata);
                }
            } catch (e) {}
            return {
                id: String(row.id),
                name: meta.name ?? row.document_number ?? '',
                periodLabel: meta.periodType === 'forever' ? 'Selamanya' : 'Periode Tertentu',
                notes: row.notes ?? '',
                periodType: meta.periodType ?? 'forever',
                sellerScope: meta.sellerScope ?? 'all',
                orderSelections: meta.orderSelections ?? ['first'],
                productScope: meta.productScope ?? 'Semua Barang',
                supplierScope: meta.supplierScope ?? 'Semua Pemasok',
                conditionType: meta.conditionType ?? 'none',
                salesValueFrom: meta.salesValueFrom ?? '',
                salesValueTo: meta.salesValueTo ?? '',
                quantityFrom: meta.quantityFrom ?? '',
                quantityTo: meta.quantityTo ?? '',
                quantityUnit: meta.quantityUnit ?? '',
                rewardType: meta.rewardType ?? 'Persentase',
                rewardValue: meta.rewardValue ?? '',
                rewardBase: meta.rewardBase ?? 'Nilai Penjualan',
                inactive: Boolean(row.is_closed),
                document_number: row.document_number,
            };
        }
    });

    const config = useMemo(() => {
        const baseConfig = page.salesCommission;
        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                ...tableProps,
                pageValue: tableProps.total.toLocaleString('id-ID'),
            },
        };
    }, [page.salesCommission, tableProps]);

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
                <SalesCommissionTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <SalesCommissionFormView
            config={config}
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

