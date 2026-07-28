import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { TransactionLineItemsSection } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function PaymentLineItemsSection({ config, values, setValues, handlers = {} }) {
    const detailTitle = values.lineItems.length
        ? `${values.lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    return (
        <TransactionLineItemsSection
            searchValue={values.lineLookup}
            onSearchChange={() => {}}
            searchReadOnly
            searchPlaceholder={config.lineSearchPlaceholder}
            searchInput={
                <AccountLookupTextInput
                    value={values.lineLookup}
                    placeholder={config.lineSearchPlaceholder}
                    searchLabel="Cari akun pembayaran"
                    dialogTitle="Pilih Akun Pembayaran"
                    queryParams={{ exclude_type: 'Cash/Bank' }}
                    showType={true}
                    onSelectAccount={(record) => handlers.onSelectLineAccount?.(record)}
                />
            }
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
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
