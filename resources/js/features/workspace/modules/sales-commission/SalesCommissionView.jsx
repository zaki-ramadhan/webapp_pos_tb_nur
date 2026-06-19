import { useMemo } from 'react';
import SalesCommissionFormView from './SalesCommissionFormView';
import SalesCommissionTableView from './SalesCommissionTableView';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';

export default function SalesCommissionView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
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

    return mode === 'table' ? (
        <SalesCommissionTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <SalesCommissionFormView
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}

