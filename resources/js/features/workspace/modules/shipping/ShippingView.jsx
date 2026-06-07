import { useMemo } from 'react';
import ShippingFormView from './ShippingFormView';
import ShippingTableView from './ShippingTableView';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';

export default function ShippingView({
    page,
    mode,
    activeLevel2Tab,
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
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to,
    } = useBackendIndexResource({
        resource: 'shipping-methods',
        initialPerPage: 25,
    });

    const config = useMemo(() => {
        const baseConfig = page;
        const mappedRows = rows.map((row) => {
            let extra = {};
            try {
                if (typeof row.notes === 'object' && row.notes !== null) {
                    extra = row.notes;
                } else if (typeof row.notes === 'string' && (row.notes.startsWith('{') || row.notes.startsWith('['))) {
                    extra = JSON.parse(row.notes);
                }
            } catch (e) {}

            return {
                id: String(row.id),
                code: row.code ?? '',
                name: row.name ?? '',
                pic: extra.pic ?? '',
                phone: extra.phone ?? '',
                street: extra.street ?? '',
                city: extra.city ?? '',
                postalCode: extra.postalCode ?? '',
                province: extra.province ?? '',
                country: extra.country ?? '',
                address: [extra.street, extra.city, extra.province].filter(Boolean).join(', '),
                inactiveValue: row.is_active ? 'no' : 'yes',
                inactiveLabel: row.is_active ? 'Tidak' : 'Ya',
                tabLabel: row.name ?? '',
            };
        });

        return {
            ...baseConfig,
            table: {
                ...baseConfig.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat...' : baseConfig.table?.refreshLabel,
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
    }, [loading, page, rows, total, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    return mode === 'table' ? (
        <ShippingTableView
            table={config.table}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <ShippingFormView
            form={config.form}
            tableRows={config.table.rows}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
