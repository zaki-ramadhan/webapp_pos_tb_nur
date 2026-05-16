import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { SearchableTableSection } from '@/features/workspace/modules/shared/sales-document/SalesDocumentPrimitives';

export function SalesDocumentAdditionalCostSection({ config, values, setValues }) {
    const costLeadingAction =
        config.costSectionLeadingActionDetailOnly && !values.documentNumber
            ? null
            : config.costSectionLeadingActionCreateOnly && values.documentNumber
              ? null
              : config.costSectionLeadingAction;

    return (
        <SearchableTableSection
            searchValue={values.costSearch}
            searchPlaceholder={config.costSearchPlaceholder}
            searchInput={
                <AccountLookupTextInput
                    value={values.costSearch}
                    placeholder={config.costSearchPlaceholder}
                    searchLabel={`Cari ${config.additionalCostsTitle}`}
                    dialogTitle={`Pilih ${config.additionalCostsTitle}`}
                    onSelectAccount={(_, label) =>
                        setValues?.((current) => ({
                            ...current,
                            costSearch: label,
                        }))
                    }
                />
            }
            title={config.additionalCostsTitle}
            columns={config.costTable.columns}
            rows={values.additionalCosts}
            emptyLabel={config.costTable.emptyLabel}
            hideSearchField={config.hideCostSearchField}
            leadingAction={costLeadingAction}
            showTitleSearchButton={config.showCostTitleSearchButton}
            minWidthClassName={config.costTable.minWidthClassName ?? 'min-w-[900px]'}
        />
    );
}

export function SalesDocumentAdvancePaymentsSection({ config, values }) {
    return (
        <SearchableTableSection
            searchValue={values.advancePaymentSearch ?? ''}
            searchPlaceholder={config.advancePaymentSearchPlaceholder ?? 'Cari/Pilih...'}
            title={config.advancePaymentTitle ?? 'Uang Muka'}
            columns={config.advancePaymentTable?.columns ?? []}
            rows={values.advancePayments ?? []}
            emptyLabel={config.advancePaymentTable?.emptyLabel ?? 'Belum ada data'}
            minWidthClassName={config.advancePaymentTable?.minWidthClassName ?? 'min-w-[760px]'}
        />
    );
}
