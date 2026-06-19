import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function BranchTableView({ table, onCreate, onOpenDetail }) {
    return (
        <ModuleTableTemplate
            table={table}
            resourceName="branches"
            exportFilename="daftar-cabang"
            exportTitle="Daftar Cabang"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}
