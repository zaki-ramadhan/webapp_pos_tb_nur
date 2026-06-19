import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function ShippingTableView({ table, onCreate, onOpenDetail, onRefresh }) {
    return (
        <ModuleTableTemplate
            table={table}
            resourceName="shipping-methods"
            exportFilename="metode-pengiriman"
            exportTitle="Laporan Metode Pengiriman"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}
