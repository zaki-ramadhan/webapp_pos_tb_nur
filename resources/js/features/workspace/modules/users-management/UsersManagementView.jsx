import { useMemo } from 'react';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapUserRow } from '@/features/workspace/backend/workspaceBackendAdapters';
import UserFormView from './UserFormView';
import UserTableView from './UserTableView';

export default function UsersManagementView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const usersResource = useBackendIndexResource({ resource: 'users', initialPerPage: 25 });
    const groupsResource = useBackendIndexResource({ resource: 'access-groups', initialPerPage: 25 });
    const rolesResource = useBackendIndexResource({ resource: 'roles', initialPerPage: 25 });
    const employeesResource = useBackendIndexResource({ resource: 'employees', initialPerPage: 250 });

    const resolvedTable = useMemo(() => ({
        ...page.table,
        rows: usersResource.rows.map(mapUserRow),
        pageValue: usersResource.total.toLocaleString('id-ID'),
        loading: usersResource.loading,
        refreshLabel: usersResource.loading ? 'Memuat...' : page.table.refreshLabel,
        onRefresh: usersResource.reload,
        pagination: {
            page: usersResource.page,
            perPage: usersResource.perPage,
            total: usersResource.total,
            lastPage: usersResource.lastPage,
            from: usersResource.from,
            to: usersResource.to,
            onPageChange: usersResource.setPage,
            onPerPageChange: usersResource.setPerPage,
        },
    }), [usersResource, page.table]);

    const lookupData = useMemo(() => ({
        groups: groupsResource.rows,
        roles: rolesResource.rows,
        employees: employeesResource.rows,
    }), [groupsResource.rows, rolesResource.rows, employeesResource.rows]);

    return mode === 'table' ? (
        <UserTableView
            table={resolvedTable}
            onRefresh={usersResource.reload}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <UserFormView
            form={page.form}
            tableRows={resolvedTable.rows}
            activeLevel2Tab={activeLevel2Tab}
            onRefresh={usersResource.reload}
            onOpenDetail={onOpenDetail}
            lookupData={lookupData}
        />
    );
}
