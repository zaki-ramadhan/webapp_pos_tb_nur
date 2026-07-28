import { useMemo } from 'react';
import { TransactionLineItemsSection } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

export function ItemRequestDetailsSection({ config, values, setValues, isDetail, handlers = {} }) {
    const filteredItems = useMemo(() => {
        const keyword = (values.itemSearch ?? '').trim().toLowerCase();

        if (!keyword) {
            return values.items ?? [];
        }

        return (values.items ?? []).filter((item) =>
            [item.code, item.name, item.quantity, item.unit, item.notes]
                .join(' ')
                .toLowerCase()
                .includes(keyword),
        );
    }, [values.itemSearch, values.items]);

    const customSearchInput = (
        <div className="flex gap-2 w-full items-center">
            <div className="min-w-0 flex-1 sm:max-w-[320px] md:max-w-[380px]">
                <AccountLookupTextInput
                    id="itemRequestItemSearch"
                    resource="products"
                    value={values.itemSearch}
                    placeholder={config.detailSearchPlaceholder}
                    searchLabel="Cari barang atau jasa"
                    onSelectAccount={(record, label) => {
                        if (record) {
                            handlers.onSelectItemSuggestion?.(record, label);
                        }
                    }}
                />
            </div>
        </div>
    );

    return (
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
            onRowClick={handlers.onEditItem}
            getRowClassName={() => 'cursor-pointer hover:bg-workspace-hover-bg'}
            searchInput={customSearchInput}
        />
    );
}
