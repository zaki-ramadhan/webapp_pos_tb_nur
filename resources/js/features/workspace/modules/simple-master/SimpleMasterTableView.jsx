import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function SimpleMasterTableView({ table, onCreate, onOpenDetail }) {
    return (
        <ModuleTableTemplate
            table={table}
            resourceName={table.resource}
            exportFilename={table.label ? table.label.toLowerCase().replace(/\s+/g, '-') : 'data-master'}
            exportTitle={table.label || 'Laporan'}
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}
