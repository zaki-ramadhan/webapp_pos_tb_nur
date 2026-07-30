import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { SearchableTableSection } from '@/features/workspace/modules/shared/sales-document/SalesDocumentPrimitives';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
export { SalesDocumentFooter } from './SalesDocumentStatusSections';

export function SalesDocumentAdditionalCostSection({ config, values, setValues, handlers }) {
    const costLeadingAction =
        config.costSectionLeadingActionDetailOnly && !values.documentNumber
            ? null
            : config.costSectionLeadingActionCreateOnly && values.documentNumber
              ? null
              : config.costSectionLeadingAction;

    const isWithoutInvoiceMode = values.returnSource === 'Tanpa Faktur';
    const hideSearchField = isWithoutInvoiceMode ? false : (config.hideCostSearchField ?? false);

    return (
        <SearchableTableSection
            searchValue={values.costSearch}
            searchPlaceholder={config.costSearchPlaceholder}
            searchInput={
                <AccountLookupTextInput
                    resource="accounts"
                    queryParams={{ exclude_type: 'Cash/Bank' }}
                    placeholder={config.costSearchPlaceholder}
                    searchLabel={`Cari ${config.additionalCostsTitle}`}
                    dialogTitle={`Pilih ${config.additionalCostsTitle}`}
                    onSelectAccount={(record) => {
                        if (!record) return;
                        if (!values.__partnerId) {
                            const partnerLabel = config.labels?.customer || 'Pemasok/Pelanggan';
                            const msg = `${partnerLabel} harus diisi.`;
                            showSystemErrorModal({
                                title: 'Terjadi Permasalahan pada Pemrosesan',
                                description: 'Silakan perbaiki permasalahan berikut ini:',
                                message: msg,
                                confirmLabel: 'OK',
                            });
                            window.dispatchEvent(
                                new CustomEvent('form-validation-error', {
                                    detail: {
                                        customer: msg,
                                        __partnerId: msg,
                                    },
                                })
                            );
                            return;
                        }
                        handlers?.onSelectCostAccount?.(record);
                    }}
                />
            }
            title={config.additionalCostsTitle}
            columns={config.costTable.columns}
            rows={values.additionalCosts}
            emptyLabel={config.costTable.emptyLabel}
            hideSearchField={hideSearchField}
            leadingAction={costLeadingAction}
            showTitleSearchButton={config.showCostTitleSearchButton}
            titleRequired={false}
            minWidthClassName={config.costTable.minWidthClassName ?? 'min-w-[900px]'}
            onRowClick={handlers?.onEditCostItem}
        />
    );
}

export function SalesDocumentAdvancePaymentsSection({ config, values, handlers }) {
    const searchInput = config.advancePaymentSearchResource ? (
        <AccountLookupTextInput
            resource={config.advancePaymentSearchResource}
            placeholder={config.advancePaymentSearchPlaceholder ?? 'Cari/Pilih...'}
            searchLabel={`Cari ${config.advancePaymentTitle ?? 'Uang Muka'}`}
            dialogTitle={`Pilih ${config.advancePaymentTitle ?? 'Uang Muka'}`}
            queryParams={{ customer_id: values.__partnerId, only_available: 'true' }}
            onSelectAccount={(record) => handlers?.onSelectAdvancePayment?.(record)}
        />
    ) : null;

    return (
        <SearchableTableSection
            searchValue={values.advancePaymentSearch ?? ''}
            searchPlaceholder={config.advancePaymentSearchPlaceholder ?? 'Cari/Pilih...'}
            searchInput={searchInput}
            title={config.advancePaymentTitle ?? 'Uang Muka'}
            columns={config.advancePaymentTable?.columns ?? []}
            rows={values.advancePayments ?? []}
            emptyLabel={config.advancePaymentTable?.emptyLabel ?? 'Tidak ada data'}
            minWidthClassName={config.advancePaymentTable?.minWidthClassName ?? 'min-w-[760px]'}
            titleRequired={false}
            onRowClick={handlers?.onEditAdvancePayment}
        />
    );
}
