import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function ItemCategoryTableView({ page, onCreate, onOpenDetail }) {
    const config = page.itemCategory;

    return (
        <ModuleTableTemplate
            table={config.table}
            resourceName="product-categories"
            exportFilename="kategori-barang"
            exportTitle="Laporan Kategori Barang"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
        />
    );
}
