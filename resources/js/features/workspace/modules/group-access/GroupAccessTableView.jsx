import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function GroupAccessTableView({ table, onCreate, onOpenDetail }) {
    return (
        <ModuleTableTemplate
            table={table}
            resourceName="access-groups"
            exportFilename="akses_grup"
            exportTitle="Laporan Akses Grup"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}

