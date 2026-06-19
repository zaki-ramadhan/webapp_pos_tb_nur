import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function SalesCommissionTableView({ config, onCreate, onOpenDetail }) {
    return (
        <ModuleTableTemplate
            table={config.table}
            resourceName="sales-commissions"
            exportFilename="komisi-penjualan"
            exportTitle="Laporan Komisi Penjualan"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}

