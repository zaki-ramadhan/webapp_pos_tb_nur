import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function WarehouseTableView({ config, onCreate, onOpenDetail }) {
    return (
        <ModuleTableTemplate
            table={config.table}
            resourceName="warehouses"
            exportFilename="daftar-gudang"
            exportTitle="Laporan Daftar Gudang"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
            disableImport={true}
            disableExport={true}
        />
    );
}
