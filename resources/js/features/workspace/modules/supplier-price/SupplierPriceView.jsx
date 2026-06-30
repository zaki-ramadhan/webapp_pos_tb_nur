import { useMemo } from 'react';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import SupplierPriceFormView from './SupplierPriceFormView';
import SupplierPriceTableView from './SupplierPriceTableView';

function mapSupplierPriceRow(record) {
    return {
        id: record.id,
        number: `SP-${String(record.id).padStart(5, '0')}`,
        effectiveDate: record.effective_from ? formatIsoDate(record.effective_from) : '',
        supplier: record.supplier?.name ?? '',
        notes: record.notes ?? '',
        endDate: record.effective_until ? formatIsoDate(record.effective_until) : '',
    };
}

export default function SupplierPriceView({ 
    page, 
    mode, 
    activeLevel2Tab, 
    onOpenContent, 
    onOpenDetail, 
    onCloseDetail 
}) {
    const config = page.supplierPrice;

    const supplierPriceResource = useWorkspaceResource({
        resource: 'supplier-prices',
        initialPerPage: 25,
        mapRow: mapSupplierPriceRow,
        enabled: true,
    });

    const resolvedConfig = useMemo(() => {
        return {
            ...config,
            table: {
                ...config.table,
                ...supplierPriceResource.tableProps,
                pageValue: supplierPriceResource.total.toLocaleString('id-ID'),
                refreshLabel: supplierPriceResource.loading ? 'Memuat data...' : config.table?.refreshLabel,
                emptyLabel: supplierPriceResource.error || config.table?.emptyLabel || 'Tidak ada data',
            },
        };
    }, [config, supplierPriceResource.error, supplierPriceResource.loading, supplierPriceResource.tableProps, supplierPriceResource.total]);

    return mode === 'table' ? (
        <SupplierPriceTableView 
            config={resolvedConfig} 
            onCreate={onOpenContent} 
            onOpenDetail={onOpenDetail} 
        />
    ) : (
        <SupplierPriceFormView 
            config={resolvedConfig} 
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={supplierPriceResource.reload}
        />
    );
}
