import { useMemo } from 'react';
import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function AssetTaxCategoryTableView({ table, onCreate, onOpenDetail }) {
    const tableProps = useMemo(() => ({
        ...table,
        filterOptions: [
            { value: 'all', label: 'Status Aktif: Semua' },
            { value: 'no', label: 'Status Aktif: Ya' },
            { value: 'yes', label: 'Status Aktif: Tidak' },
        ],
    }), [table]);

    return (
        <ModuleTableTemplate
            table={tableProps}
            resourceName="asset-tax-categories"
            exportFilename="kategori_pajak_aset"
            exportTitle="Daftar Kategori Aset Tetap Pajak"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
            tableMinWidth="min-w-[1120px]"
        />
    );
}
