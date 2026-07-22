import { useEffect, useMemo, useState } from 'react';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { mapUserRow } from '@/features/workspace/backend/workspaceBackendAdapters';
import UserFormView from './UserFormView';
import UserTableView from './UserTableView';

export default function UsersManagementView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail}) {
    const usersResource = useBackendIndexResource({ resource: 'users', initialPerPage: 25 });
    const groupsResource = useBackendIndexResource({ resource: 'access-groups', initialPerPage: 25 });
    const rolesResource = useBackendIndexResource({ resource: 'roles', initialPerPage: 25 });
    const employeesResource = useBackendIndexResource({ resource: 'employees', initialPerPage: 250 });

    const resolvedTable = useMemo(() => ({
        ...page.table,
        rows: usersResource.rows.map(mapUserRow),
        pageValue: usersResource.total.toLocaleString('id-ID'),
        loading: usersResource.loading,
        refreshLabel: page.table?.refreshLabel || 'Muat ulang',
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
                <UserTableView
            table={resolvedTable}
            onRefresh={usersResource.reload}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <UserFormView
            form={page.form}
            tableRows={resolvedTable.rows}
            activeLevel2Tab={lastActiveFormTab}
            onRefresh={usersResource.reload}
            onOpenDetail={onOpenDetail}
            lookupData={lookupData}
        />
                </div>
            )}
        </div>
    );
}
