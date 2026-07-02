import { useEffect, useMemo, useState } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import EmployeeFormView from '@/features/workspace/modules/employee/EmployeeFormView';
import EmployeeTableView from '@/features/workspace/modules/employee/EmployeeTableView';
import { buildEmployeeFilters, buildEmployeeRow } from '@/features/workspace/modules/employee/employeeViewShared';
import { isWorkspacePageInactive } from '@/features/workspace/shared/workspaceAvailability';

export default function EmployeeView({
    page,
    mode,
    activeLevel2Tab, level2Tabs = [],
    onOpenContent,
    onOpenDetail,
    onCloseDetail,}) {
    const employeeResource = useBackendIndexResource({
        resource: 'employees',
        initialPerPage: 25,
        enabled: true,
    });
    const branchResource = useBackendIndexResource({
        resource: 'branches',
        initialPerPage: 25,
        enabled: true,
    });
    const departmentResource = useBackendIndexResource({
        resource: 'departments',
        initialPerPage: 25,
        enabled: true,
    });
    const userResource = useBackendIndexResource({
        resource: 'users',
        initialPerPage: 250,
        enabled: true,
    });

    const resolvedPage = useMemo(() => {
        const mappedRows = employeeResource.rows.map((record) => buildEmployeeRow(record));

        return {
            ...page,
            form: {
                ...page.form,
                branchOptions: branchResource.rows.length
                    ? branchResource.rows.map((record) => record.name ?? record.code ?? `Cabang #${record.id}`)
                    : (page.form?.branchOptions ?? []),
                departmentOptions: departmentResource.rows.length
                    ? departmentResource.rows.map((record) => record.name ?? record.code ?? `Departemen #${record.id}`)
                    : (page.form?.departmentOptions ?? []),
                lookupOptions: {
                    branches: branchResource.rows.map((record) => ({
                        id: record.id,
                        label: record.name ?? record.code ?? `Cabang #${record.id}`,
                        code: record.code ?? '',
                    })),
                    departments: departmentResource.rows.map((record) => ({
                        id: record.id,
                        label: record.name ?? record.code ?? `Departemen #${record.id}`,
                        code: record.code ?? '',
                    })),
                    users: userResource.rows.map((record) => ({
                        id: record.id,
                        label: record.name ?? '',
                        email: record.email ?? '',
                    })),
                },
            },
            table: {
                ...page.table,
                rows: mappedRows,
                filters: buildEmployeeFilters(page.table?.filters ?? [], mappedRows)
                    .filter((filter) => !(filter.id === 'department' && isWorkspacePageInactive('department'))),
                pageValue: employeeResource.total.toLocaleString('id-ID'),
                loading: employeeResource.loading,
                refreshLabel: employeeResource.loading ? 'Memuat data...' : page.table?.refreshLabel,
                emptyLabel: employeeResource.error || page.table?.emptyLabel || 'Belum ada data',
                onRefresh: employeeResource.reload,
                pagination: {
                    page: employeeResource.page,
                    perPage: employeeResource.perPage,
                    total: employeeResource.total,
                    lastPage: employeeResource.lastPage,
                    from: employeeResource.from,
                    to: employeeResource.to,
                    onPageChange: employeeResource.setPage,
                    onPerPageChange: employeeResource.setPerPage,
                },
            },
        };
    }, [branchResource.rows, departmentResource.rows, userResource.rows, employeeResource.error, employeeResource.loading, employeeResource.reload, employeeResource.rows, employeeResource.total, employeeResource.page, employeeResource.perPage, employeeResource.lastPage, employeeResource.from, employeeResource.to, employeeResource.setPage, employeeResource.setPerPage, page]);

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
                <EmployeeTableView
            table={resolvedPage.table}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
            </div>
            {lastActiveFormTab && (
                <div className={mode === 'form' ? 'flex flex-1 flex-col min-h-0 w-full h-full' : 'hidden'}>
                    <EmployeeFormView
            key={lastActiveFormTab.id}
            pageId={page.id}
            form={resolvedPage.form}
            tableRows={resolvedPage.table?.rows ?? []}
            activeLevel2Tab={lastActiveFormTab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={employeeResource.reload}
        />
                </div>
            )}
        </div>
    );
}
