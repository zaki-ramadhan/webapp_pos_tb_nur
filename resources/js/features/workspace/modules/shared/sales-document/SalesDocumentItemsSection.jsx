import { SearchableTableSection } from '@/features/workspace/modules/shared/sales-document/SalesDocumentPrimitives';

export function SalesDocumentItemsSection({ config, values, isDetail, handlers }) {
    const itemTitle = values.itemCountLabel || config.itemSectionTitle;
    const canOpenItemModal = isDetail && config.itemModal?.enabled && Boolean(values.itemModal);
    const itemLeadingAction =
        config.itemSectionLeadingActionDetailOnly && !isDetail
            ? null
            : config.itemSectionLeadingActionCreateOnly && isDetail
              ? null
              : config.itemSectionLeadingAction ?? (!isDetail ? { label: 'Tambah Item', onClick: handlers?.onCreateItem } : null);

    const itemRowClick = canOpenItemModal ? config.onOpenItemModal : handlers?.onEditItem;
    const itemTitleClick = canOpenItemModal ? config.onOpenItemModal : handlers?.onCreateItem;

    const importButton = !isDetail && handlers?.onImportClick ? (
        <button
            type="button"
            onClick={handlers.onImportClick}
            className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b] hover:bg-[#f3f7fc] transition shrink-0 cursor-pointer"
        >
            Impor Excel/CSV
        </button>
    ) : null;

    return (
        <SearchableTableSection
            searchValue={values.itemSearch}
            searchPlaceholder={config.itemSearchPlaceholder}
            title={itemTitle}
            columns={config.itemTable.columns}
            rows={values.items}
            emptyLabel={config.itemTable.emptyLabel}
            minWidthClassName={config.itemTable.minWidthClassName ?? 'min-w-[1000px]'}
            showTitleSearchButton={config.showItemTitleSearchButton ?? isDetail}
            hideSearchField={config.hideItemSearchField}
            leadingAction={itemLeadingAction}
            extraActions={importButton}
            onTitleClick={itemTitleClick}
            onRowClick={itemRowClick}
        />
    );
}
