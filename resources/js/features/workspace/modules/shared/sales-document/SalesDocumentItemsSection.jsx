import { SearchableTableSection } from '@/features/workspace/modules/shared/sales-document/SalesDocumentPrimitives';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

export function SalesDocumentItemsSection({ config, values, isDetail, handlers }) {
    const itemTitle = values.itemCountLabel || config.itemSectionTitle;
    const canOpenItemModal = isDetail && config.itemModal?.enabled && Boolean(values.itemModal);
    
    const hideAddItem = config.hideAddItemButton || false;
    const hideImport = config.hideItemImportButton || config.hideImportButton || false;

    const hasRelatedDocument = Boolean(
        values.__relatedDocumentId ||
        values.__relatedDocumentRecord ||
        (Array.isArray(values.returnSourceReferences) && values.returnSourceReferences.length > 0)
    );
    const isReturnMode = (values.returnSource === 'Faktur' || values.returnSource === 'Uang Muka');
    const showFetchButtonForReturn = isReturnMode && hasRelatedDocument;

    const baseLeadingAction = hideAddItem
        ? null
        : config.itemSectionLeadingActionDetailOnly && !isDetail
            ? null
            : config.itemSectionLeadingActionCreateOnly && isDetail
                ? null
                : config.itemSectionLeadingAction ?? (!isDetail ? { label: 'Tambah Item', onClick: handlers?.onCreateItem } : null);

    const itemLeadingAction = hideAddItem
        ? null
        : (showFetchButtonForReturn
            ? { label: 'Ambil', onClick: handlers?.onOpenFetchItemsModal }
            : baseLeadingAction);

    const itemRowClick = canOpenItemModal ? config.onOpenItemModal : handlers?.onEditItem;
    const itemTitleClick = hideAddItem
        ? null
        : (showFetchButtonForReturn
            ? handlers?.onOpenFetchItemsModal
            : (canOpenItemModal ? config.onOpenItemModal : handlers?.onCreateItem));

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
            searchLabel="Cari barang"
            onSelectAccount={(record) => {
                if (!record) return;
                handlers?.onSelectItem?.(record);
            }}
        />
    ) : null;

    const isWithoutInvoiceMode = values.returnSource === 'Tanpa Faktur';
    const hideSearchField = isWithoutInvoiceMode ? false : (config.hideItemSearchField ?? false);

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
            hideSearchField={hideSearchField}
            leadingAction={itemLeadingAction}
            extraActions={importButton}
            onTitleClick={itemTitleClick}
            onRowClick={itemRowClick}
            onDeleteRow={!isDetail ? handlers?.onDeleteItem : null}
        />
    );
}
