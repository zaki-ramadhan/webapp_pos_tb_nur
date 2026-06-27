import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { TransactionLineItemsSection } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function TransferFeeSection({ config, values, handlers = {} }) {
    const detailTitle = values.feeRows.length
        ? `${values.feeRows.length} ${config.feeTitle}`
        : config.feeTitle;

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <TransactionLineItemsSection
                searchValue={values.feeLookup}
                onSearchChange={() => {}}
                searchReadOnly
                searchPlaceholder={config.feeLookupPlaceholder}
                searchInput={
                    <AccountLookupTextInput
                        value={values.feeLookup}
                        placeholder={config.feeLookupPlaceholder}
                        searchLabel="Cari akun perkiraan"
                        dialogTitle="Pilih Akun Perkiraan"
                        queryParams={{ exclude_type: 'Cash/Bank' }}
                        showType={true}
                        onSelectAccount={(record) => {
                            if (record) {
                                handlers.onSelectFeeAccount?.(record);
                            }
                        }}
                    />
                }
                title={detailTitle}
                columns={config.feeTable.columns}
                rows={values.feeRows}
                emptyLabel={config.feeTable.emptyLabel}
                onRowClick={handlers.onEditFeeItem}
                getRowClassName={
                    handlers.onEditFeeItem
                        ? () => 'cursor-pointer transition hover:bg-workspace-hover-bg'
                        : undefined
                }
            />
        </div>
    );
}
