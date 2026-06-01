import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import BranchFormView from './BranchFormView';
import BranchTableView from './BranchTableView';

function mapBranchRow(record) {
    const userList = (record.users ?? [])
        .map((user) => user.name)
        .filter(Boolean)
        .join(', ');

    return {
        id: record.id,
        code: record.code ?? '',
        name: record.name ?? '',
        phone: record.phone ?? '',
        street: record.street ?? '',
        city: record.city ?? '',
        postalCode: record.postal_code ?? '',
        province: record.province ?? '',
        country: record.country ?? '',
        userList: userList || 'Semua Pengguna',
        users: record.users ?? [],
        userIds: (record.users ?? []).map((user) => user.id),
        inactiveLabel: record.is_active === false ? 'Ya' : 'Tidak',
        inactiveValue: record.is_active === false ? 'yes' : 'no',
        isActive: record.is_active !== false,
        tabLabel: record.name ?? '',
    };
}

export default function BranchView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'branches',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });

    const resolvedPage = useMemo(() => {
        const mappedRows = rows.map((row) => mapBranchRow(row));

        return {
            ...page,
            table: {
                ...page.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                loading,
                refreshLabel: loading ? 'Memuat data...' : page.table?.refreshLabel,
                emptyLabel: error || 'Belum ada data',
                onRefresh: reload,
            },
        };
    }, [error, loading, page, reload, rows, total]);

    return mode === 'table' ? (
        <BranchTableView
            table={resolvedPage.table}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <BranchFormView
            pageId={page.id}
            form={resolvedPage.form}
            tableRows={resolvedPage.table?.rows ?? []}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={reload}
        />
    );
}
