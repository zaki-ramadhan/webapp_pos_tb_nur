import { SearchableTableSection } from '@/features/workspace/modules/shared/sales-document/SalesDocumentPrimitives';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

export function SalesDocumentItemsSection({ config, values, isDetail, handlers }) {
    const itemTitle = values.itemCountLabel || config.itemSectionTitle;
    const canOpenItemModal = isDetail && config.itemModal?.enabled && Boolean(values.itemModal);
    
    const hideAddItem = config.hideAddItemButton || false;
    const hideImport = config.hideItemImportButton || config.hideImportButton || false;

    const itemLeadingAction = hideAddItem
        ? null
        : config.itemSectionLeadingActionDetailOnly && !isDetail
            ? null
            : config.itemSectionLeadingActionCreateOnly && isDetail
                ? null
                : config.itemSectionLeadingAction ?? (!isDetail ? { label: 'Tambah Item', onClick: handlers?.onCreateItem } : null);

    const itemRowClick = canOpenItemModal ? config.onOpenItemModal : handlers?.onEditItem;
    const itemTitleClick = canOpenItemModal ? config.onOpenItemModal : handlers?.onCreateItem;

    const importButton = !isDetail && handlers?.onImportClick && !hideImport ? (
        <button
            type="button"
            onClick={handlers.onImportClick}
            className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white px-4 text-base text-brand-blue-accent hover:bg-brand-blue-lightest transition shrink-0 cursor-pointer"
        >
            Impor Excel/CSV
        </button>
    ) : null;

    const searchInput = config.itemSearchResource ? (
        <AccountLookupTextInput
            resource={config.itemSearchResource}
            placeholder={config.itemSearchPlaceholder}
            searchLabel="Cari barang dan jasa"
            onSelectAccount={(record) => handlers?.onSelectItem?.(record)}
        />
    ) : null;

    return (
        <SearchableTableSection
            searchValue={values.itemSearch}
            searchPlaceholder={config.itemSearchPlaceholder}
            searchInput={searchInput}
            title={itemTitle}
            columns={config.itemTable.columns}
            rows={values.items}
            emptyLabel={config.itemTable.emptyLabel}
            minWidthClassName={config.itemTable.minWidthClassName ?? 'min-w-[1000px]'}
            showTitleSearchButton={config.showItemTitleSearchButton ?? false}
            hideSearchField={config.hideItemSearchField}
            leadingAction={itemLeadingAction}
            extraActions={importButton}
            onTitleClick={itemTitleClick}
            onRowClick={itemRowClick}
        />
    );
}
