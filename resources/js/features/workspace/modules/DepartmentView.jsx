import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import DepartmentFormView from '@/features/workspace/modules/department/DepartmentFormView';
import DepartmentTableView from '@/features/workspace/modules/department/DepartmentTableView';

function mapDepartmentRow(record) {
    const userList = (record.users ?? [])
        .map((user) => user.name)
        .filter(Boolean)
        .join(', ');

    return {
        id: record.id,
        code: record.code ?? '',
        name: record.name ?? '',
        notes: record.notes ?? '',
        userList: userList || 'Semua Pengguna',
        userIds: (record.users ?? []).map((user) => user.id),
        inactiveValue: record.is_active === false ? 'yes' : 'no',
        isActive: record.is_active !== false,
        tabLabel: record.name ?? '',
    };
}

export default function DepartmentView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const { rows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'departments',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });

    const resolvedPage = useMemo(() => {
        const mappedRows = rows.map((row) => mapDepartmentRow(row));

        return {
            ...page,
            table: {
                ...page.table,
                rows: mappedRows,
                pageValue: total.toLocaleString('id-ID'),
                refreshLabel: loading ? 'Memuat data...' : page.table?.refreshLabel,
                emptyLabel: error || page.table?.emptyLabel || 'Tidak ada data',
                onRefresh: reload,
            },
        };
    }, [error, loading, page, reload, rows, total]);

    return mode === 'table' ? (
        <DepartmentTableView
            table={resolvedPage.table}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <DepartmentFormView
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
