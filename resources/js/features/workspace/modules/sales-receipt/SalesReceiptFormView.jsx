import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import SalesReceiptInvoiceModal from '@/features/workspace/modules/sales-receipt/SalesReceiptInvoiceModal';
import {
    SalesReceiptAdditionalInfoSection,
    SalesReceiptInvoicesSection,
} from '@/features/workspace/modules/sales-receipt/SalesReceiptFormSections';
import {
    ReceiptAmountActionButton,
    ReceiptAmountInput,
    ReceiptSummaryFooter,
} from '@/features/workspace/modules/sales-receipt/salesReceiptViewShared';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionRail,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import useSalesReceiptForm from './hooks/useSalesReceiptForm';

export default function SalesReceiptFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
    buildRecord,
}) {
    const {
        activeSectionId,
        setActiveSectionId,
        activeInvoiceModal,
        setActiveInvoiceModal,
        status,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        values,
        setValues,
        isDetail,
        dockActions,
        handlers,
        handleDelete,
    } = useSalesReceiptForm({
        pageId,
        config,
        activeLevel2Tab,
        onOpenContent,
        onOpenDetail,
        onCloseDetail,
        onRefresh,
        buildRecord,
    });

    return (
        <>
            <div className="flex min-h-full flex-col gap-3">
                <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                    <div className="min-w-0 flex-1 flex flex-col gap-3">
                        <div className="px-4 py-4 bg-white border border-ui-border rounded-[6px] shadow-card-light">
                            <div className={`grid gap-x-8 gap-y-2 ${isDetail ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]'}`.trim()}>
                                <div className="grid gap-y-2 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                    <TransactionFieldLabel label={config.labels.customer} required />
                                    <ChipLookupField
                                        values={values.customer}
                                        placeholder="Cari/Pilih Pelanggan..."
                                        onRemove={handlers.onRemoveCustomer}
                                        searchLabel="Cari pelanggan"
                                        onSearch={handlers.onSelectCustomer}
                                    />

                                    <TransactionFieldLabel label={config.labels.bank} required />
                                    <ChipLookupField
                                        values={values.bankAccounts}
                                        placeholder="Cari/Pilih..."
                                        onRemove={handlers.onRemoveBankAccount}
                                        searchLabel="Cari bank"
                                        onSearch={handlers.onSelectBankAccount}
                                        heightClassName="h-[40px]"
                                    />

                                    <TransactionFieldLabel label={config.labels.paymentAmount} />
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="min-w-0 max-w-[280px] flex-1">
                                            <ReceiptAmountInput value={values.paymentAmount} isDetail={isDetail} />
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {values.amountButtons.map((buttonType) => (
                                                <ReceiptAmountActionButton key={buttonType} type={buttonType} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-y-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                    <div className="flex items-center justify-start gap-4 sm:justify-end">
                                        <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                                    </div>

                                    {!isDetail && values.autoNumber ? (
                                        <SelectField
                                            value={values.numberingType}
                                            onChange={(event) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    numberingType: event.target.value,
                                                }))
                                            }
                                            className="h-[40px] rounded-[4px] border-ui-border"
                                            selectClassName="text-xs sm:text-sm text-brand-dark"
                                        >
                                            {config.numberingOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </SelectField>
                                    ) : (
                                        <TextInput
                                            value={values.documentNumber}
                                            onChange={(event) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    documentNumber: event.target.value,
                                                }))
                                            }
                                            onBlur={(event) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    documentNumber: event.target.value.trim(),
                                                }))
                                            }
                                            maxLength={120}
                                            className="h-[40px] rounded-[4px] border-ui-border"
                                            inputClassName="text-xs sm:text-sm text-brand-dark"
                                        />
                                    )}

                                    <TransactionFieldLabel label={config.labels.entryDate} required className="sm:text-right" />
                                    <div className="max-w-[236px] justify-self-end w-full">
                                        <TransactionDateInput
                                            value={values.entryDate}
                                            onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                                            className="max-w-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CrudStatusMessage status={status} className="mx-3" />

                        <div className="flex gap-0 px-2 sm:px-3">
                            <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                            <div className="min-w-0 flex-1 rounded-[6px] border border-ui-border bg-white px-3 py-3 shadow-card-light">
                                {activeSectionId === 'additional-info' ? (
                                    <SalesReceiptAdditionalInfoSection
                                        config={config}
                                        values={values}
                                        setValues={setValues}
                                        isDetail={isDetail}
                                        handlers={handlers}
                                    />
                                ) : (
                                    <SalesReceiptInvoicesSection
                                        config={config}
                                        values={values}
                                        setValues={setValues}
                                        isDetail={isDetail}
                                        onOpenInvoiceModal={setActiveInvoiceModal}
                                        handlers={handlers}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="px-3">
                            <ReceiptSummaryFooter paymentAmount={values.paymentAmount} />
                        </div>
                    </div>

                    <div className="shrink-0 lg:w-[96px] lg:pt-4">
                        <TransactionDock actions={dockActions} />
                    </div>
                </div>
            </div>

            <SalesReceiptInvoiceModal
                open={Boolean(activeInvoiceModal)}
                modal={activeInvoiceModal}
                onClose={() => setActiveInvoiceModal(null)}
            />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.documentNumber}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </>
    );
}
