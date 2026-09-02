import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function SimpleMasterTableView({ table, onCreate, onOpenDetail }) {
    const isItemUnit = table.resource === 'units';

    return (
        <ModuleTableTemplate
            table={table}
            resourceName={table.resource}
            exportFilename={table.label ? table.label.toLowerCase().replace(/\s+/g, '-') : 'data-toko'}
            exportTitle={table.label || 'Laporan'}
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
            disableImport={isItemUnit}
            disableExport={isItemUnit}
            disableColumnSettings={isItemUnit}
        />
    );
}
