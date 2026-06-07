import { useMemo } from 'react';
import SalesTargetFormView from './SalesTargetFormView';
import SalesTargetTableView from './SalesTargetTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';

export default function SalesTargetView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'sales-targets',
        filters: {
            per_page: 100,
        },
    });

    const config = useMemo(() => {
        const baseConfig = page.salesTarget;
        const mappedRows = rows.map((row) => {
            const meta = row.metadata ?? {};
            const isPerSales = meta.targetType === 'Per Penjual';
            return {
                id: String(row.id),
                name: meta.name ?? row.document_number ?? '',
                startDate: meta.startDate ?? '',
                endDate: meta.endDate ?? '',
                targetType: meta.targetType ?? 'Per Barang',
                targetTypeFilter: isPerSales ? 'per-sales' : 'per-item',
                branch: meta.branch ?? '[Semua Cabang]',
                notes: row.notes ?? '',
                analyst: meta.analyst ?? '',
                detailConfig: {
                    title: meta.detailConfig?.title ?? (isPerSales ? 'Rincian Penjual' : 'Rincian Barang'),
                    searchPlaceholder: meta.detailConfig?.searchPlaceholder ?? (isPerSales ? 'Cari/Pilih...' : 'Cari/Pilih Barang & Jasa...'),
                    columns: meta.detailConfig?.columns ?? (isPerSales ? [
                        { id: 'salesperson', label: 'Nama Penjual', widthClassName: 'w-[82%]' },
                        { id: 'value', label: 'Nilai', widthClassName: 'w-[18%]', align: 'right' }
                    ] : [
                        { id: 'name', label: 'Nama Barang', widthClassName: 'w-[58%]' },
                        { id: 'code', label: 'Kode #', widthClassName: 'w-[14%]' },
                        { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[12%]', align: 'right' },
                        { id: 'value', label: 'Nilai', widthClassName: 'w-[16%]', align: 'right' }
                    ]),
                    rows: meta.detailConfig?.rows ?? [],
                    modal: meta.detailConfig?.modal ?? null,
                },
                document_number: row.document_number,
            };
        });

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat...' : baseConfig.table?.refreshLabel,
            },
        };
    }, [loading, page.salesTarget, rows, total]);

    return mode === 'table' ? (
        <SalesTargetTableView
            config={config}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <SalesTargetFormView
            pageId={page.id}
            config={config}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
