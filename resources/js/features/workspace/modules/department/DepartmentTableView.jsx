import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function DepartmentTableView({ table, onCreate, onOpenDetail }) {
    return (
        <ModuleTableTemplate
            table={table}
            resourceName="departments"
            exportFilename="departemen"
            exportTitle="Laporan Departemen"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}
