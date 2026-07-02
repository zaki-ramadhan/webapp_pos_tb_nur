import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { TransactionLineItemsSection } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function TransferFeeSection({ config, values, handlers = {} }) {
    const detailTitle = values.feeRows.length
        ? `${values.feeRows.length} ${config.feeTitle}`
        : config.feeTitle;

    const renderCell = ({ row, column }) => {
        if (column.id === 'chargedTo') {
            if (row.chargedTo === 'Dari Kas/Bank' || row.chargedTo === 'Bank Pengirim') {
                return 'Bank Pengirim';
            }
            if (row.chargedTo === 'Ke Kas/Bank' || row.chargedTo === 'Bank Penerima' || row.chargedTo === 'Bank Tujuan') {
                return 'Bank Penerima';
            }
            return row.chargedTo || '-';
        }
        if (column.id === 'amount') {
            return row.amount;
        }
        return row[column.id] !== undefined && row[column.id] !== null ? String(row[column.id]) : '';
    };

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
                titleRequired={false}
                columns={config.feeTable.columns}
                rows={values.feeRows}
                emptyLabel={config.feeTable.emptyLabel}
                renderCell={renderCell}
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
