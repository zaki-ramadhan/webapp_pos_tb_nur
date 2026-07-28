import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { buildLookupLabel } from '@/features/workspace/shared/transactionFormatters';
import { TableActionIcon } from '@/features/workspace/shared/Icons';
import { TransactionLineItemsSection } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

const EMPTY_SELECTED_INVOICES = [];

export function PurchasePaymentDetailsSection({ config, values, isDetail, onOpenInvoice, handlers = {} }) {
    return (
        <TransactionLineItemsSection
            title={
                <span className="text-right text-2xl font-normal text-brand-dark">{values.invoiceTitle}</span>
            }
            titleRequired={true}
            searchInput={
                <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <BackendLookupField
                            resource="purchase-invoices"
                            values={EMPTY_SELECTED_INVOICES}
                            placeholder={config.invoiceSearchPlaceholder}
                            searchLabel="Cari faktur pembelian"
                            getOptionLabel={(record) => buildLookupLabel(record, 'document_number')}
                            getOptionSearchText={(record) =>
                                [
                                    record?.document_number,
                                    record?.reference_number,
                                    record?.supplier?.name,
                                    record?.notes,
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                            }
                            onSelect={handlers.onSelectInvoiceRecord}
                            emptyTitle="Faktur tidak ditemukan"
                            emptyDescription="Coba nomor faktur atau nama pemasok lain."
                        />
                    </div>

                    {isDetail ? (
                        <button
                            type="button"
                            className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white px-5 text-base text-brand-blue-accent shrink-0"
                            onClick={handlers.onSelectInvoice}
                        >
                            {config.takeButtonLabel}
                        </button>
                    ) : null}
                </div>
            }
            columns={config.invoiceTable.columns}
            rows={values.invoices}
            emptyLabel={config.invoiceTable.emptyLabel}
            minWidthClassName={config.invoiceTable.minWidthClassName ?? 'min-w-[1080px]'}
            emptyLeadingCellContent={
                <span className="inline-flex items-center justify-center">
                    <TableActionIcon className="h-4 w-4" />
                </span>
            }
            onRowClick={onOpenInvoice}
            getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
            spacerHeaderContent=""
            spacerCellContent={() => (
                <span className="inline-flex items-center justify-center text-text-workspace-inactive">
                    <TableActionIcon className="h-4 w-4" />
                </span>
            )}
            cellClassName="!py-1.5"
        />
    );
}
