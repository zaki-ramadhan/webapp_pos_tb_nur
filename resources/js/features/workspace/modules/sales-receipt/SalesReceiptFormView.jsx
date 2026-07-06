import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import SalesReceiptInvoiceModal from '@/features/workspace/modules/sales-receipt/SalesReceiptInvoiceModal';
import {
    SalesReceiptAdditionalInfoSection,
    SalesReceiptInvoicesSection,
} from '@/features/workspace/modules/sales-receipt/SalesReceiptFormSections';
import {
    ReceiptAmountActionButton,
    ReceiptSummaryFooter,
} from '@/features/workspace/modules/sales-receipt/salesReceiptViewShared';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSwitch,
    TransactionFormLayout,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AccountLookupField, AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
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
        validationMessage,
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
            <TransactionFormLayout
            validationMessage={validationMessage}
                header={
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
                        {/* Left Column */}
                        <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                            <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                                <TransactionFieldLabel label={config.labels.customer} required />
                                <div className="max-w-[320px] w-full">
                                    <AccountLookupTextInput
                                        id="customer"
                                        resource="customers"
                                        value={values.customer?.[0] ?? ''}
                                        placeholder="Cari/Pilih Pelanggan..."
                                        searchLabel="Cari pelanggan"
                                        onSelectAccount={(record, label) => {
                                            setValues((current) => ({
                                                ...current,
                                                __customerId: record ? record.id : null,
                                                customer: label ? [label] : [],
                                            }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                                <TransactionFieldLabel label={config.labels.bank} required />
                                <div className="max-w-[320px] w-full">
                                    <AccountLookupField
                                        value={values.bankAccounts?.[0] ?? ''}
                                        placeholder="Cari/Pilih..."
                                        searchLabel="Cari bank"
                                        onRemove={() =>
                                            setValues((current) => ({
                                                ...current,
                                                __bankAccountId: null,
                                                bankAccounts: [],
                                            }))
                                        }
                                        onSelectAccount={(record, label) =>
                                            setValues((current) => ({
                                                ...current,
                                                __bankAccountId: record?.id ?? null,
                                                bankAccounts: record ? [label] : [],
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                                <TransactionFieldLabel label={config.labels.paymentAmount} />
                                <div className="flex max-w-[165px] w-full items-center gap-2">
                                    <div className="flex-1">
                                        <FormattedAmountInput
                                            id="paymentAmount"
                                            value={values.paymentAmount}
                                            onChange={(event) => {
                                                const nextVal = event.target.value;
                                                setValues((current) => ({
                                                    ...current,
                                                    paymentAmount: nextVal,
                                                    paymentAmountDisplay: nextVal,
                                                }));
                                            }}
                                            onBlur={(event) => {
                                                const val = event.target.value;
                                                setValues((current) => ({
                                                    ...current,
                                                    paymentAmountForSummary: val,
                                                }));
                                            }}
                                            maxLength={11}
                                            prefix="Rp"
                                            className="h-[40px] rounded-[4px] border-ui-border w-full"
                                            inputClassName="text-right text-xs sm:text-sm text-brand-dark"
                                        />
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        {(values.amountButtons ?? [])
                                            .filter((buttonType) => buttonType === 'refresh')
                                            .map((buttonType) => (
                                                <ReceiptAmountActionButton
                                                    key={buttonType}
                                                    type={buttonType}
                                                    onClick={
                                                        buttonType === 'refresh'
                                                            ? () => {
                                                                  setValues((current) => ({
                                                                      ...current,
                                                                      paymentAmount: '0',
                                                                      paymentAmountDisplay: '0',
                                                                      paymentAmountForSummary: '0',
                                                                  }));
                                                              }
                                                            : undefined
                                                    }
                                                />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px] md:pl-12 lg:pl-16 xl:pl-20 2xl:pl-28">
                            <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                                <div className="flex items-center justify-start gap-4">
                                    <TransactionFieldLabel label={config.labels.documentNumber} required />
                                </div>

                                <div className="max-w-[282px] w-full justify-self-end">
                                    {!isDetail && values.autoNumber ? (
                                        <SelectField
                                            value={values.numberingType}
                                            onChange={(event) =>
                                                setValues((current) => ({
                                                    ...current,
                                                    numberingType: event.target.value,
                                                }))
                                            }
                                            className="h-[40px] rounded-[4px] border-ui-border w-full"
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
                                            trailing={<span className="text-lg font-semibold text-brand-dark">×</span>}
                                            className="h-[40px] rounded-[4px] border-ui-border w-full"
                                            inputClassName="text-xs sm:text-sm text-brand-dark"
                                            trailingClassName="px-3"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                                <TransactionFieldLabel label={config.labels.entryDate} required />
                                <div className="max-w-[236px] w-full justify-self-end">
                                    <TransactionDateInput
                                        value={values.entryDate}
                                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                                        className="max-w-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                footer={
                    <ReceiptSummaryFooter
                        paymentAmount={values.paymentAmountForSummary ?? values.paymentAmount}
                        invoices={values.invoices}
                    />
                }
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                <div className="relative flex-1 flex flex-col min-h-0">
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
            </TransactionFormLayout>

            <SalesReceiptInvoiceModal
                open={Boolean(activeInvoiceModal)}
                modal={activeInvoiceModal}
                onClose={() => setActiveInvoiceModal(null)}
                onSave={(updatedModalValues) => {
                    setValues((current) => {
                        const updatedInvoices = (current.invoices ?? []).map((inv) => {
                            if (inv.id === activeInvoiceModal.id) {
                                const paymentAmountValue = updatedModalValues.payment;
                                return {
                                    ...inv,
                                    paid: paymentAmountValue,
                                    payment: paymentAmountValue,
                                    modal: {
                                        ...inv.modal,
                                        ...updatedModalValues,
                                    }
                                };
                            }
                            return inv;
                        });
                        return {
                            ...current,
                            invoices: updatedInvoices,
                        };
                    });
                    setActiveInvoiceModal(null);
                }}
                onDelete={() => {
                    setValues((current) => ({
                        ...current,
                        invoices: (current.invoices ?? []).filter((inv) => inv.id !== activeInvoiceModal.id),
                    }));
                    setActiveInvoiceModal(null);
                }}
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
