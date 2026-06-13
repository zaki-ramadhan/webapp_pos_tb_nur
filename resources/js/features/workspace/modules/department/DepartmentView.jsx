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
        parentDepartmentId: record.parent_department_id ?? record.parentDepartment?.id ?? record.parent_department?.id ?? null,
        parentDepartmentName: record.parentDepartment?.name ?? record.parent_department?.name ?? '',
        userList: userList || 'Semua Pengguna',
        users: record.users ?? [],
        userIds: (record.users ?? []).map((user) => user.id),
        inactiveValue: record.is_active === false ? 'yes' : 'no',
        isActive: record.is_active !== false,
        tabLabel: record.name ?? '',
    };
}

export default function DepartmentView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail, onCloseDetail }) {
    const departmentResource = useBackendIndexResource({
        resource: 'departments',
        initialPerPage: 25,
        enabled: true,
    });
    const userResource = useBackendIndexResource({
        resource: 'users',
        initialPerPage: 25,
        enabled: true,
    });
    const branchResource = useBackendIndexResource({
        resource: 'branches',
        initialPerPage: 25,
        enabled: true,
    });

    const resolvedPage = useMemo(() => {
        const mappedRows = departmentResource.rows.map((row) => mapDepartmentRow(row));
        const userOptions = userResource.rows.map((row) => ({
            id: row.id,
            label: row.name ?? row.email ?? `User #${row.id}`,
            email: row.email ?? '',
            branchIds: (row.branches ?? []).map((branch) => branch.id).filter(Boolean),
            branchLabels: (row.branches ?? []).map((branch) => branch.name).filter(Boolean),
            searchText: [row.name, row.email, ...(row.branches ?? []).map((branch) => branch.name)].filter(Boolean).join(' '),
        }));
        const branchOptions = branchResource.rows.map((row) => ({
            id: row.id,
            label: row.name ?? row.code ?? `Cabang #${row.id}`,
            code: row.code ?? '',
            searchText: [row.name, row.code, row.city, row.province].filter(Boolean).join(' '),
        }));

        return {
            ...page,
            form: {
                ...page.form,
                lookupOptions: {
                    parentDepartments: mappedRows,
                    users: userOptions,
                    branches: branchOptions,
                },
            },
            table: {
                ...page.table,
                rows: mappedRows,
                pageValue: departmentResource.total.toLocaleString('id-ID'),
                loading: departmentResource.loading,
                refreshLabel: departmentResource.loading ? 'Memuat data...' : page.table?.refreshLabel,
                emptyLabel: departmentResource.error || page.table?.emptyLabel || 'Tidak ada data',
                onRefresh: departmentResource.reload,
                pagination: {
                    page: departmentResource.page,
                    perPage: departmentResource.perPage,
                    total: departmentResource.total,
                    lastPage: departmentResource.lastPage,
                    from: departmentResource.from,
                    to: departmentResource.to,
                    onPageChange: departmentResource.setPage,
                    onPerPageChange: departmentResource.setPerPage,
                },
            },
        };
    }, [branchResource.rows, departmentResource.error, departmentResource.loading, departmentResource.reload, departmentResource.rows, departmentResource.total, departmentResource.page, departmentResource.perPage, departmentResource.lastPage, departmentResource.from, departmentResource.to, departmentResource.setPage, departmentResource.setPerPage, page, userResource.rows]);

    return mode === 'table' ? (
        <DepartmentTableView
            table={resolvedPage.table}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <DepartmentFormView
            pageId={page.id}
            form={resolvedPage.form}
            tableRows={resolvedPage.table?.rows ?? []}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={departmentResource.reload}
        />
    );
}
