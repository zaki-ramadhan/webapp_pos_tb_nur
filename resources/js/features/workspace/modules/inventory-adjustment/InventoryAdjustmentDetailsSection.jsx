import { useMemo, useState } from 'react';
import {
    TransactionLineItemsSection,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import SelectField from '@/components/ui/SelectField';
import { buildTotals } from './inventoryAdjustmentShared';
import InventoryAdjustmentImportModal from './InventoryAdjustmentImportModal';

export default function InventoryAdjustmentDetailsSection({
    config,
    values,
    setValues,
    isDetail,
    onOpenItem,
    onCreateItem,
}) {
    const [showImportModal, setShowImportModal] = useState(false);

    const filteredItems = useMemo(() => {
        const query = (values.itemSearch || '').toLowerCase().trim();
        if (!query) return values.items || [];
        return (values.items || []).filter(
            (item) =>
                (item.name || '').toLowerCase().includes(query) ||
                (item.code || '').toLowerCase().includes(query)
        );
    }, [values.items, values.itemSearch]);

    // Satukan search input dan dropdown mode/impor di sebelah kiri
    const customSearchInput = (
        <div className="flex gap-2 w-full items-center">
            <div className="min-w-0 flex-1">
                <input
                    type="text"
                    value={values.itemSearch || ''}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            itemSearch: event.target.value,
                        }))
                    }
                    placeholder={config.detailSearchPlaceholder}
                    className="h-[40px] w-full rounded-[4px] border border-[#cfd6e2] px-3.5 text-xs sm:text-sm text-[#1f2436] outline-none focus:border-[#7aa2d5]"
                />
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
                className="h-[34px] min-w-[120px] rounded-[4px] border-[#7aa2d5]"
                selectClassName="text-xs sm:text-sm text-[#21539b]"
                containerClassName="w-auto shrink-0"
            >
                <option value="Rincian">Rincian</option>
                <option value="Impor barang">Impor barang</option>
            </SelectField>
        </div>
    );

    return (
        <>
            <TransactionLineItemsSection
                searchValue={values.itemSearch}
                onSearchChange={(e) =>
                    setValues((current) => ({ ...current, itemSearch: e.target.value }))
                }
                searchPlaceholder={config.detailSearchPlaceholder}
                title={values.itemCountLabel ?? config.itemSectionTitle}
                columns={config.itemTable.columns}
                rows={filteredItems}
                emptyLabel={config.itemTable.emptyLabel}
                minWidthClassName={config.itemTable.minWidthClassName}
                onRowClick={isDetail ? onOpenItem : undefined}
                getRowClassName={() => (isDetail ? 'cursor-pointer hover:bg-[#eef3fb]' : '')}
                searchInput={customSearchInput}
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
