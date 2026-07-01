import { useMemo, useState } from 'react';
import {
    TransactionLineItemsSection,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { SearchIcon, ViewModeIcon } from '@/features/workspace/shared/Icons';
import { buildTotals } from './inventoryAdjustmentShared';
import InventoryAdjustmentImportModal from './InventoryAdjustmentImportModal';

import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

export default function InventoryAdjustmentDetailsSection({
    pageId,
    config,
    values,
    setValues,
    isDetail,
    onOpenItem,
    onCreateItem,
    onSelectItem,
}) {
    const [showImportModal, setShowImportModal] = useState(false);
    const [isColumnsToggled, setIsColumnsToggled] = useState(false);
    const isPriceAdjustment = pageId === 'price-adjustment';
    const isDiscountMode = isPriceAdjustment && values.adjustmentType === 'Diskon (%)';

    const filteredItems = useMemo(() => {
        const query = (values.itemSearch || '').toLowerCase().trim();
        if (!query) return values.items || [];
        return (values.items || []).filter(
            (item) =>
                (item.name || '').toLowerCase().includes(query) ||
                (item.code || '').toLowerCase().includes(query)
        );
    }, [values.items, values.itemSearch]);

    const docSalesCategory = useMemo(() => {
        const cats = values.salesCategory ?? [];
        if (!cats.length) return '';
        const raw = cats[0] ?? '';
        // Strip "[CODE] " prefix if present
        return raw.replace(/^\[[^\]]+\]\s*/, '');
    }, [values.salesCategory]);

    const mappedItems = useMemo(() => {
        if (!isPriceAdjustment) return filteredItems;

        return filteredItems.map((item, index) => ({
            ...item,
            no: index + 1,
            salesCategory: docSalesCategory || item.salesCategory || 'Umum',
            oldDiscount: item.oldDiscount ?? '0',
            minQty: item.minQty ?? '0',
            newDiscount: item.newDiscount ?? '0',
        }));
    }, [filteredItems, isPriceAdjustment, docSalesCategory]);

    const columns = useMemo(() => {
        if (!isPriceAdjustment) return config.itemTable.columns;

        if (isDiscountMode || isColumnsToggled) {
            return [
                { id: 'no', label: 'No.', widthClassName: 'w-[50px]', align: 'center', kind: 'spacer' },
                { id: 'salesCategory', label: 'Kategori Penjualan', widthClassName: 'w-[160px]', align: 'left' },
                { id: 'name', label: 'Nama Barang', widthClassName: 'w-[220px]', align: 'left' },
                { id: 'code', label: 'Kode Barang', widthClassName: 'w-[130px]', align: 'left' },
                { id: 'unit', label: 'Satuan', widthClassName: 'w-[90px]', align: 'left' },
                { id: 'oldDiscount', label: 'Diskon Lama (%)', widthClassName: 'w-[130px]', align: 'right' },
                { id: 'minQty', label: 'Untuk Kts Diatas', widthClassName: 'w-[130px]', align: 'right' },
                { id: 'newDiscount', label: 'Diskon Barang', widthClassName: 'w-[130px]', align: 'right' },
            ];
        }

        return [
            { id: 'no', label: 'No.', widthClassName: 'w-[50px]', align: 'center', kind: 'spacer' },
            { id: 'name', label: 'Nama Barang', widthClassName: 'w-[40%]', align: 'left' },
            { id: 'code', label: 'Kode Barang', widthClassName: 'w-[150px]', align: 'left' },
            { id: 'unit', label: 'Satuan', widthClassName: 'w-[100px]', align: 'left' },
            { id: 'newDiscount', label: 'Diskon Baru (%)', widthClassName: 'w-[130px]', align: 'right' },
        ];
    }, [isPriceAdjustment, isDiscountMode, isColumnsToggled, config.itemTable.columns]);

    const customSearchInput = (
        <div className="flex gap-2 w-full items-center">
            <div className="min-w-0 flex-1 w-full sm:max-w-[320px] md:max-w-[380px]">
                {isDetail ? (
                    <TextInput
                        value={values.itemSearch || ''}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                itemSearch: event.target.value,
                            }))
                        }
                        placeholder={config.detailSearchPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-brand-dark" />}
                        className="h-[40px] w-full rounded-[4px] border-ui-border"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                ) : (
                    <AccountLookupTextInput
                        resource="items-services"
                        value={values.itemSearch || ''}
                        placeholder={config.detailSearchPlaceholder}
                        searchLabel="Cari barang dan jasa"
                        dialogTitle="Pilih Barang/Jasa"
                        disabled={isDetail}
                        onSelectAccount={(productRecord) => {
                            if (productRecord) {
                                onSelectItem?.(productRecord);
                            }
                        }}
                        className="h-[40px] w-full rounded-[4px] border-ui-border"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                )}
            </div>
            <SelectField
                value={values.detailMode}
                onChange={(event) => {
                    if (event.target.value === 'Impor barang') {
                        setShowImportModal(true);
                        return;
                    }
                    setValues((current) => ({
                        ...current,
                        detailMode: event.target.value,
                    }));
                }}
                className="h-[34px] min-w-[120px] rounded-[4px] border-brand-blue-border"
                selectClassName="text-xs sm:text-sm text-brand-blue-accent"
                containerClassName="w-auto shrink-0"
            >
                <option value="Rincian">Rincian</option>
                <option value="Impor barang">Impor barang</option>
            </SelectField>

            {isPriceAdjustment && (
                <button
                    type="button"
                    onClick={() => setIsColumnsToggled((prev) => !prev)}
                    title="Toggle Kolom Tabel"
                    className={`inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[4px] border transition ${
                        isColumnsToggled
                            ? 'border-brand-blue-border bg-brand-blue/10 text-brand-blue'
                            : 'border-ui-border bg-white text-slate-500 hover:text-brand-blue'
                    }`}
                >
                    <ViewModeIcon className="h-5 w-5" />
                </button>
            )}
        </div>
    );

    const minWidth = isPriceAdjustment
        ? ((isDiscountMode || isColumnsToggled) ? 'min-w-[1150px]' : 'min-w-[760px]')
        : config.itemTable.minWidthClassName;

    return (
        <>
            <TransactionLineItemsSection
                searchValue={values.itemSearch}
                onSearchChange={(e) =>
                    setValues((current) => ({ ...current, itemSearch: e.target.value }))
                }
                searchPlaceholder={config.detailSearchPlaceholder}
                title={values.itemCountLabel ?? config.itemSectionTitle}
                columns={columns}
                rows={mappedItems}
                emptyLabel={config.itemTable.emptyLabel}
                minWidthClassName={minWidth}
                onRowClick={isDetail ? onOpenItem : undefined}
                getRowClassName={() => (isDetail ? 'cursor-pointer hover:bg-workspace-hover-bg' : '')}
                searchInput={customSearchInput}
                searchWrapperClassName="w-full sm:max-w-none flex-1"
            />

            <InventoryAdjustmentImportModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={(importedItems) => {
                    setValues((current) =>
                        buildTotals(current, [...(current.items ?? []), ...importedItems])
                    );
                }}
            />
        </>
    );
}
