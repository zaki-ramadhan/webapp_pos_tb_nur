import { useMemo } from 'react';

import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import EmployeeFormView from '@/features/workspace/modules/employee/EmployeeFormView';
import EmployeeTableView from '@/features/workspace/modules/employee/EmployeeTableView';
import { buildEmployeeFilters, buildEmployeeRow } from '@/features/workspace/modules/employee/employeeViewShared';

export default function EmployeeView({
    page,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
}) {
    const employeeResource = useBackendIndexResource({
        resource: 'employees',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });
    const branchResource = useBackendIndexResource({
        resource: 'branches',
        filters: {
            per_page: 100,
        },
        enabled: true,
    });
    const departmentResource = useBackendIndexResource({
        resource: 'departments',
        filters: {
            per_page: 100,
        },
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
                },
            },
            table: {
                ...page.table,
                rows: mappedRows,
                filters: buildEmployeeFilters(page.table?.filters ?? [], mappedRows),
                pageValue: employeeResource.total.toLocaleString('id-ID'),
                loading: employeeResource.loading,
                refreshLabel: employeeResource.loading ? 'Memuat data...' : page.table?.refreshLabel,
                emptyLabel: employeeResource.error || page.table?.emptyLabel || 'Belum ada data',
                onRefresh: employeeResource.reload,
            },
        };
    }, [branchResource.rows, departmentResource.rows, employeeResource.error, employeeResource.loading, employeeResource.reload, employeeResource.rows, employeeResource.total, page]);

    return mode === 'table' ? (
        <EmployeeTableView
            table={resolvedPage.table}
            onCreate={onOpenContent}
            onOpenDetail={onOpenDetail}
        />
    ) : (
        <EmployeeFormView
            pageId={page.id}
            form={resolvedPage.form}
            tableRows={resolvedPage.table?.rows ?? []}
            activeLevel2Tab={activeLevel2Tab}
            onOpenContent={onOpenContent}
            onOpenDetail={onOpenDetail}
            onCloseDetail={onCloseDetail}
            onRefresh={employeeResource.reload}
        />
    );
}
