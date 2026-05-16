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
            onTitleClick={itemTitleClick}
            onRowClick={itemRowClick}
        />
    );
}
