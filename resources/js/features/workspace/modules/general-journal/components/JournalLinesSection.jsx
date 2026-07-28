import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { TransactionLineItemsSection } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function JournalLinesSection({ config, values, setValues, handlers = {} }) {
    const detailTitle = values.lineItems.length
        ? `${values.lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    const isManual = values.transactionTypeValue === 'general-journal';

    return (
        <TransactionLineItemsSection
            searchValue={values.lineLookup}
            onSearchChange={(event) =>
                setValues((current) => ({
                    ...current,
                    lineLookup: event.target.value,
                }))
            }
            searchPlaceholder={config.lineSearchPlaceholder}
            searchInput={
                isManual ? (
                    <AccountLookupTextInput
                        value={values.lineLookup}
                        placeholder={config.lineSearchPlaceholder}
                        searchLabel="Cari akun jurnal"
                        dialogTitle="Pilih Akun Jurnal"
                        onSelectAccount={(record) => handlers.onSelectLineAccount?.(record)}
                        showType={true}
                    />
                ) : null
            }
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            minWidthClassName="min-w-[820px]"
            onRowClick={isManual ? handlers.onEditLineItem : undefined}
            getRowClassName={
                isManual && handlers.onEditLineItem
                    ? () => 'cursor-pointer transition hover:bg-workspace-hover-bg'
                    : undefined
            }
        />
    );
}
