import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

const TAX_COLUMNS = [
    { id: 'description', label: 'Keterangan', align: 'left' },
    { id: 'typeLabel', label: 'Tipe Pajak', align: 'left' },
    { id: 'percentage', label: 'Persentase', align: 'right', widthClassName: 'w-[120px]' },
];

export default function TaxTableView({ page, rows, loading, error, onCreate, onOpenDetail, onRefresh }) {
    const tableData = {
        ...page.table,
        columns: TAX_COLUMNS,
        rows: rows,
        loading: loading,
        emptyLabel: error || page.table?.emptyLabel || 'Belum ada data',
        onRefresh: onRefresh,
    };

    return (
        <ModuleTableTemplate
            table={tableData}
            resourceName="taxes"
            exportFilename="tarif-pajak"
            exportTitle="Laporan Tarif Pajak"
            inactiveFilterKey="typeValue"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}
