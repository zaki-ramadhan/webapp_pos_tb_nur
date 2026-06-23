import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function GroupAccessTableView({ table, onCreate, onOpenDetail }) {
    return (
        <ModuleTableTemplate
            table={table}
            resourceName="access-groups"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
            disableImport={true}
            disableExport={true}
            disablePrint={true}
            disableColumnSettings={true}
        />
    );
}

