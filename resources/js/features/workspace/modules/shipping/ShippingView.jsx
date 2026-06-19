import { useMemo } from 'react';
import ShippingFormView from './ShippingFormView';
import ShippingTableView from './ShippingTableView';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';

function mapShippingRow(row) {
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
}

export default function ShippingView({
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
        resource: 'shipping-methods',
        initialPerPage: 25,
        mapRow: mapShippingRow,
    });

    const resolvedPage = useMemo(() => ({
        ...page,
        table: {
            ...page.table,
            ...tableProps,
            pageValue: tableProps.total.toLocaleString('id-ID'),
            filterOptions: page.table.filters?.[0]?.options ?? [],
        },
    }), [page, mappedRows, tableProps]);

    return mode === 'table' ? (
        <ShippingTableView
            table={resolvedPage.table}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
            onRefresh={reload}
        />
    ) : (
        <ShippingFormView
            form={resolvedPage.form}
            tableRows={resolvedPage.table.rows}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
