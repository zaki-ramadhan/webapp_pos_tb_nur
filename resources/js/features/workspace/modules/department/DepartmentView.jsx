import { useEffect, useMemo, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import useWorkspaceResource from '@/features/workspace/backend/useWorkspaceResource';
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

export default function DepartmentView({ page, mode, activeLevel2Tab, level2Tabs = [], onOpenContent, onOpenDetail, onCloseDetail}) {
    const departmentResource = useWorkspaceResource({
        resource: 'departments',
        initialPerPage: 25,
        mapRow: mapDepartmentRow,
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
        const mappedRows = departmentResource.mappedRows;
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
                loading,

                ...page.table,
                ...departmentResource.tableProps,
                pageValue: departmentResource.total.toLocaleString('id-ID'),
                refreshLabel: departmentResource.loading ? 'Memuat data...' : page.table?.refreshLabel,
                emptyLabel: departmentResource.error || page.table?.emptyLabel || 'Tidak ada data',
            },
        };
    }, [branchResource.rows, departmentResource.error, departmentResource.loading, departmentResource.mappedRows, departmentResource.tableProps, departmentResource.total, page, userResource.rows]);

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
                <DepartmentTableView
            table={resolvedPage.table}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <DepartmentFormView
            key={lastActiveFormTab.id}
            pageId={page.id}
            form={resolvedPage.form}
            tableRows={resolvedPage.table?.rows ?? []}
            activeLevel2Tab={lastActiveFormTab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={departmentResource.reload}
        />
                </div>
            )}
        </div>
    );
}
