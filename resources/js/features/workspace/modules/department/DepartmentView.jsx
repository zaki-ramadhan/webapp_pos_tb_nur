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
        isActiveText: record.is_active ? 'Tidak' : 'Ya',
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
                columns: (() => {
                    const baseCols = page.table?.columns ?? [];
                    const extraCols = [
                        { id: 'parentDepartmentName', label: 'Sub Departemen', widthClassName: 'w-[150px]', align: 'left', defaultHidden: true },
                        { id: 'userList', label: 'Pengguna Berhak', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true },
                        { id: 'notes', label: 'Catatan', widthClassName: 'w-[200px]', align: 'left', defaultHidden: true, truncate: true },
                        { id: 'isActiveText', label: 'Non Aktif', widthClassName: 'w-[110px]', align: 'center', defaultHidden: true }
                    ];
                    const filteredExtra = extraCols.filter(col => !baseCols.some(bc => bc.id === col.id));
                    return [...baseCols, ...filteredExtra];
                })(),
                pageValue: departmentResource.total.toLocaleString('id-ID'),
                refreshLabel: page.table?.refreshLabel || 'Muat ulang',
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
            {level2Tabs.map((tab) => {
                if (tab.kind !== 'content') return null;

                const isCurrentForm = mode === 'form' && activeLevel2Tab?.id === tab.id;

                return (
                    <div
                        key={tab.id}
                        className={isCurrentForm ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}
                    >
                        <DepartmentFormView
                            key={tab.id}
            pageId={page.id}
            form={resolvedPage.form}
            tableRows={resolvedPage.table?.rows ?? []}
            activeLevel2Tab={tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={departmentResource.reload}
                        />
                    </div>
                );
            })}
        </div>
    );
}
