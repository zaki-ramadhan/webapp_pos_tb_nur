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
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
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
                onSectionChange={setActiveSectionId}
                footer={<ReceiptSummaryFooter paymentAmount={values.paymentAmount} />}
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
