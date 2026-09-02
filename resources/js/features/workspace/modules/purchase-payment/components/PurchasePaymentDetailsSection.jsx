import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { TransactionLineItemsSection } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { showCrudValidationToast } from '@/features/workspace/shared/crudFeedback';

export function PurchasePaymentDetailsSection({ config, values, isDetail, onOpenInvoice, handlers = {} }) {
    const hasSupplier = Boolean(values.__supplierId || (Array.isArray(values.payee) && values.payee.length > 0));

    const handleTakeClick = () => {
        const hasBank = Boolean(values.__bankAccountId || (Array.isArray(values.bankAccounts) && values.bankAccounts.length > 0));
        if (!hasBank) {
            const msg = 'Bank harus diisi.';
            showCrudValidationToast(msg);
            window.dispatchEvent(
                new CustomEvent('form-validation-error', {
                    detail: {
                        bankAccounts: msg,
                        __bankAccountId: msg,
                    },
                })
            );
            return;
        }
        handlers?.onOpenUnpaidInvoicesModal?.();
    };

    return (
        <TransactionLineItemsSection
            title={
                <span className="text-right text-2xl font-normal text-brand-dark">{values.invoiceTitle}</span>
            }
            titleRequired={true}
            searchInput={
                <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <AccountLookupTextInput
                            id="invoiceSearch"
                            resource="purchase-invoices"
                            value={values.invoiceSearch ?? ''}
                            placeholder={config.invoiceSearchPlaceholder}
                            searchLabel="Cari faktur pembelian"
                            queryParams={values.__supplierId ? { supplier_id: values.__supplierId, partner_id: values.__supplierId } : {}}
                            onSelectAccount={(record) => {
                                if (!record) return;
                                handlers?.onSelectInvoiceRecord?.(record);
                            }}
                        />
                    </div>

                    {hasSupplier ? (
                        <button
                            type="button"
                            className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white px-5 text-base text-brand-blue-accent shrink-0 cursor-pointer hover:bg-brand-blue-lightest transition"
                            onClick={handleTakeClick}
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
            onRowClick={onOpenInvoice}
            getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
            cellClassName="!py-1.5"
        />
    );
}
