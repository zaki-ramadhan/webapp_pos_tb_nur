import {
    ItemGeneralInfoSection,
    ItemMoreInfoSection,
} from './ItemGeneralSections';
import {
    ItemPurchaseTaxSection,
    ItemSalesInfoSection,
} from './ItemSalesPurchaseSections';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import { SectionHeading, SimpleTextField } from './itemsServicesViewShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { TrashIcon } from '@/features/workspace/shared/Icons';

export function ItemGeneralTab({ config, values, onChange, isDetail }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <ItemGeneralInfoSection
                config={config}
                values={values}
                onChange={onChange}
                isDetail={isDetail}
            />
            <ItemMoreInfoSection config={config} values={values} onChange={onChange} />
        </div>
    );
}

export function ItemSalesPurchaseTab({ config, values, onChange }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <ItemSalesInfoSection config={config} values={values} onChange={onChange} />
            <ItemPurchaseTaxSection config={config} values={values} onChange={onChange} />
        </div>
    );
}

export function ItemGroupTab({ values, onChange }) {
    const groupItems = values.groupItems || [];

    const handleAddItem = (option) => {
        if (!option) return;
        const exists = groupItems.some((item) => (item.child_product_id ?? item.id) === option.id);
        if (exists) return;

        const newItem = {
            id: `group-item-${Date.now()}`,
            child_product_id: option.id,
            code: option.code ?? '-',
            name: option.name ?? '-',
            quantity: 1,
            unit: option.base_unit?.name ?? option.baseUnit?.name ?? option.unit ?? 'PCS',
            unit_id: option.base_unit_id ?? option.base_unit?.id ?? option.baseUnit?.id ?? null,
        };

        onChange('groupItems', [...groupItems, newItem]);
    };

    const handleRemoveItem = (index) => {
        const nextItems = groupItems.filter((_, i) => i !== index);
        onChange('groupItems', nextItems);
    };

    const handleQuantityChange = (index, newQty) => {
        const nextItems = groupItems.map((item, i) => {
            if (i === index) {
                return { ...item, quantity: newQty };
            }
            return item;
        });
        onChange('groupItems', nextItems);
    };

    return (
        <div className="space-y-4">
            <SectionHeading title="Rincian Grup" />

            <div className="w-full sm:w-[360px]">
                <BackendLookupField
                    resource="products"
                    values={[]}
                    placeholder="Cari/Pilih Barang & Jasa..."
                    searchLabel="Cari barang untuk rincian grup"
                    onSelect={handleAddItem}
                />
            </div>

            <DataTable wrapperClassName="border-table-wrapper-border">
                <DataTableHeader className="bg-[#466986] text-white font-medium">
                    <DataTableRow>
                        <DataTableHead className="text-left text-white font-normal px-3 py-2 w-[160px]">Kode #</DataTableHead>
                        <DataTableHead className="text-left text-white font-normal px-3 py-2">Nama Barang</DataTableHead>
                        <DataTableHead className="text-right text-white font-normal px-3 py-2 w-[140px]">Kuantitas</DataTableHead>
                        <DataTableHead className="text-left text-white font-normal px-3 py-2 w-[120px]">Satuan</DataTableHead>
                        <DataTableHead className="text-center text-white font-normal px-2 py-2 w-[60px]">Aksi</DataTableHead>
                    </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                    {groupItems.length > 0 ? (
                        groupItems.map((item, index) => (
                            <DataTableRow key={item.id ?? index} className="border-ui-border-row bg-white">
                                <DataTableCell className="text-left text-sm font-normal text-blue-600 px-3 py-2">
                                    {item.code ?? item.child_product?.code ?? '-'}
                                </DataTableCell>
                                <DataTableCell className="text-left text-sm text-text-workspace-dark px-3 py-2">
                                    {item.name ?? item.child_product?.name ?? '-'}
                                </DataTableCell>
                                <DataTableCell className="text-right text-sm text-text-workspace-dark px-3 py-2 w-[140px]">
                                    <SimpleTextField
                                        value={String(item.quantity ?? 1)}
                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                        className="text-right h-8"
                                        formatAsAmount
                                        allowDecimal
                                    />
                                </DataTableCell>
                                <DataTableCell className="text-left text-sm text-text-workspace-dark px-3 py-2">
                                    {item.unit ?? item.child_product?.base_unit?.name ?? '-'}
                                </DataTableCell>
                                <DataTableCell className="text-center px-2 py-2 w-[60px]">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="text-danger hover:text-red-700 transition cursor-pointer p-1"
                                        title="Hapus rincian"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </DataTableCell>
                            </DataTableRow>
                        ))
                    ) : (
                        <DataTableRow className="border-ui-border-row bg-white">
                            <DataTableCell colSpan={5} className="px-3 py-4 text-center text-sm text-text-workspace-dark">
                                Belum ada data
                            </DataTableCell>
                        </DataTableRow>
                    )}
                </DataTableBody>
            </DataTable>

            <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="printGroupDetails"
                        checked={values.printGroupDetails !== false}
                        onChange={(e) => onChange('printGroupDetails', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="printGroupDetails" className="text-xs sm:text-sm text-brand-dark cursor-pointer select-none">
                        Tampilkan Rincian saat dicetak
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="allowEditGroupQuantity"
                        checked={Boolean(values.allowEditGroupQuantity)}
                        onChange={(e) => onChange('allowEditGroupQuantity', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="allowEditGroupQuantity" className="text-xs sm:text-sm text-brand-dark cursor-pointer select-none">
                        Dapat mengubah kuantitas rincian grup
                    </label>
                </div>
            </div>
        </div>
    );
}
