import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function EmployeeTableView({ table, onCreate, onOpenDetail }) {
    return (
        <ModuleTableTemplate
            table={table}
            resourceName="employees"
            exportFilename="daftar-karyawan"
            exportTitle="Laporan Daftar Karyawan"
            tableMinWidth="min-w-[1460px]"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}
