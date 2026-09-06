import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { TransactionLineItemsSection } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function TransactionAccountLineItemsSection({
    config,
    values,
    setValues,
    handlers = {},
    searchLabel = 'Cari akun',
    dialogTitle = 'Pilih Akun',
    queryParams = { exclude_type: 'Cash/Bank' },
}) {
    const lineItems = values?.lineItems ?? [];
    const detailTitle = lineItems.length
        ? `${lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    return (
        <TransactionLineItemsSection
            searchValue={values?.lineLookup ?? ''}
            onSearchChange={(event) =>
                setValues?.((current) => ({
                    ...current,
                    lineLookup: event?.target?.value ?? '',
                }))
            }
            searchReadOnly
            searchPlaceholder={config.lineSearchPlaceholder}
            searchInput={
                <AccountLookupTextInput
                    value={values?.lineLookup ?? ''}
                    placeholder={config.lineSearchPlaceholder}
                    searchLabel={searchLabel}
                    dialogTitle={dialogTitle}
                    queryParams={queryParams}
                    showType={true}
                    onSelectAccount={(record) => handlers.onSelectLineAccount?.(record)}
                />
            }
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            onRowClick={handlers.onEditLineItem}
            getRowClassName={
                handlers.onEditLineItem
                    ? () => 'cursor-pointer transition hover:bg-workspace-hover-bg'
                    : undefined
            }
        />
    );
}
