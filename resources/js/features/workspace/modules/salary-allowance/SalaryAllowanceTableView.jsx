import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

const SALARY_COLUMNS = [
    { id: 'name', label: 'Nama', align: 'left' },
    { id: 'type', label: 'Tipe Gaji atau Tunjangan', align: 'left' },
    { id: 'activeLabel', label: 'Status', align: 'center', widthClassName: 'w-[120px]' },
];

export default function SalaryAllowanceTableView({
    config,
    rows,
    onCreate,
    onOpenDetail,
}) {
    return (
        <ModuleTableTemplate
            table={{
                ...config.table,
                columns: SALARY_COLUMNS,
                rows,
            }}
            resourceName="salary-allowances"
            exportFilename="gaji-tunjangan"
            exportTitle="Laporan Gaji dan Tunjangan"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}
