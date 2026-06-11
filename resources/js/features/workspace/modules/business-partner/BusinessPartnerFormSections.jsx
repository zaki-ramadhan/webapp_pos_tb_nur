import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import {
    ChipLookupField,
    FormFieldRow,
    SectionHeading,
    TextInput,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import { BalanceTab, SalesTab, TaxTab } from '@/features/workspace/modules/business-partner/BusinessPartnerTransactionSections';
import { ContactsTab, GeneralTab, ShippingTab } from '@/features/workspace/modules/business-partner/BusinessPartnerProfileSections';

function CustomerOthersTab({ config, values, onChange }) {
    return (
        <div className="space-y-8">
            <section className="max-w-[880px]">
                <SectionHeading title={config.headingLabels.othersLimit} />

                <div className="mt-4 space-y-4">
                    <label className="inline-flex items-center gap-3 text-[17px] text-[#1f2436]">
                        <input
                            type="radio"
                            checked={values.receivableLimitMode === 'per-customer'}
                            onChange={() => onChange('receivableLimitMode', 'per-customer')}
                            className="h-[18px] w-[18px]"
                        />
                        <span>Per Pelanggan</span>
                    </label>

                    <div className="space-y-3 pl-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <CheckboxField
                                id="customer-receivable-age"
                                label="Jika ada faktur dengan umur lebih dari"
                                checked={Boolean(values.receivableAgeEnabled)}
                                onChange={(event) => onChange('receivableAgeEnabled', event.target.checked)}
                                align="center"
                                labelClassName="text-[17px]"
                                inputClassName="mt-0 h-[18px] w-[18px]"
                                containerClassName="w-auto"
                            />
                            <TextInput
                                value={values.receivableAgeDays}
                                onChange={(event) => onChange('receivableAgeDays', event.target.value)}
                                className="h-[40px] w-[130px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-right text-[15px] text-[#1f2436]"
                            />
                            <span className="text-[17px] text-[#1f2436]">Hari</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <CheckboxField
                                id="customer-receivable-amount"
                                label="Jika total piutang & pesanan melebihi"
                                checked={Boolean(values.receivableAmountEnabled)}
                                onChange={(event) => onChange('receivableAmountEnabled', event.target.checked)}
                                align="center"
                                labelClassName="text-[17px]"
                                inputClassName="mt-0 h-[18px] w-[18px]"
                                containerClassName="w-auto"
                            />
                            <TextInput
                                value={values.receivableAmount}
                                onChange={(event) => onChange('receivableAmount', event.target.value)}
                                className="h-[40px] w-[280px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-right text-[15px] text-[#8a8f98]"
                            />
                        </div>
                    </div>

                    <label className="inline-flex items-center gap-3 text-[17px] text-[#1f2436]">
                        <input
                            type="radio"
                            checked={values.receivableLimitMode === 'merge-parent'}
                            onChange={() => onChange('receivableLimitMode', 'merge-parent')}
                            className="h-[18px] w-[18px]"
                        />
                        <span>Tergabung ke Pelanggan Induk</span>
                    </label>
                </div>
            </section>

            <section className="max-w-[880px]">
                <SectionHeading title={config.headingLabels.othersOther} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={config.labels.defaultWarehouse}>
                        <ChipLookupField values={values.defaultWarehouse} placeholder={config.lookupPlaceholders.default} onRemove={() => {}} searchLabel="Cari gudang default" />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.notes}>
                        <TextareaField
                            value={values.notes}
                            onChange={(event) => onChange('notes', event.target.value)}
                            rows={4}
                            className="rounded-[4px] border-[#cfd6e2]"
                            textareaClassName="min-h-[98px] text-[15px] text-[#1f2436]"
                        />
                    </FormFieldRow>
                </div>
            </section>
        </div>
    );
}

function SupplierPurchaseTab({ config, values, onChange }) {
    const purchaseConfig = config.purchaseConfig ?? {};

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section>
                <SectionHeading title={purchaseConfig.titleLeft} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={purchaseConfig.paymentTermsLabel}>
                        <ChipLookupField values={values.paymentTerms} placeholder={config.lookupPlaceholders.default} onRemove={() => {}} searchLabel="Cari syarat pembayaran" />
                    </FormFieldRow>

                    <FormFieldRow label={purchaseConfig.discountLabel}>
                        <TextInput
                            value={values.defaultDiscountPercent}
                            onChange={(event) => onChange('defaultDiscountPercent', event.target.value)}
                            prefix="%"
                            className="h-[40px] max-w-[360px] rounded-[4px] border-[#cfd6e2]"
                            prefixClassName="min-w-[34px] bg-[#f5f6f8] px-3 text-[#9aa3b1]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={purchaseConfig.descriptionLabel}>
                        <TextareaField
                            value={values.defaultDescription}
                            onChange={(event) => onChange('defaultDescription', event.target.value)}
                            rows={3}
                            className="rounded-[4px] border-[#cfd6e2]"
                            textareaClassName="min-h-[72px] text-[15px] text-[#1f2436]"
                        />
                    </FormFieldRow>
                </div>

                <div className="mt-8">
                    <SectionHeading title="Akun Pembelian" />
                    <div className="mt-4 space-y-3">
                        <FormFieldRow label={purchaseConfig.payableLabel}>
                            <AccountLookupField
                                values={values.payableAccount}
                                placeholder={config.lookupPlaceholders.default}
                                onRemove={() => onChange('payableAccount', [])}
                                searchLabel="Cari akun utang"
                                dialogTitle="Pilih Akun Utang"
                                onSelectAccount={(_, label) => onChange('payableAccount', label ? [label] : [])}
                            />
                        </FormFieldRow>

                        <FormFieldRow label={purchaseConfig.advanceLabel}>
                            <AccountLookupField
                                values={values.advanceAccount}
                                placeholder={config.lookupPlaceholders.default}
                                onRemove={() => onChange('advanceAccount', [])}
                                searchLabel="Cari akun uang muka"
                                dialogTitle="Pilih Akun Uang Muka"
                                onSelectAccount={(_, label) => onChange('advanceAccount', label ? [label] : [])}
                            />
                        </FormFieldRow>
                    </div>

                    <p className="mt-4 max-w-[620px] border-l-[4px] border-[#8e8f91] pl-3 text-[14px] italic leading-7 text-[#ef513f]">
                        {purchaseConfig.accountNote}
                    </p>
                </div>
            </section>

            <section>
                <SectionHeading title={purchaseConfig.titleRight} />

                <div className="mb-3 mt-4 flex items-center gap-3">
                    <button
                        type="button"
                        aria-label={purchaseConfig.bankAddLabel}
                        className="inline-flex h-[34px] w-[56px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>

                <EmptyDataTable columns={config.bankTable.columns} emptyLabel={config.bankTable.emptyLabel} />
            </section>
        </div>
    );
}

function SupplierOthersTab({ config, values, onChange }) {
    const othersConfig = config.othersConfig ?? {};

    return (
        <section className="max-w-[900px]">
            <SectionHeading title={othersConfig.title} />

            <div className="mt-4 space-y-3">
                <FormFieldRow label={othersConfig.invoiceNumberLabel}>
                    <CheckboxField
                        id="supplier-invoice-number"
                        label={othersConfig.invoiceNumberCheckboxLabel}
                        checked={Boolean(values.invoiceNumberOnBill)}
                        onChange={(event) => onChange('invoiceNumberOnBill', event.target.checked)}
                        align="center"
                        labelClassName="text-[17px]"
                        inputClassName="mt-0 h-[18px] w-[18px]"
                        containerClassName="w-auto"
                    />
                </FormFieldRow>

                <FormFieldRow label={othersConfig.notesLabel}>
                    <TextareaField
                        value={values.notes}
                        onChange={(event) => onChange('notes', event.target.value)}
                        rows={4}
                        className="rounded-[4px] border-[#cfd6e2]"
                        textareaClassName="min-h-[98px] text-[15px] text-[#1f2436]"
                    />
                </FormFieldRow>
            </div>
        </section>
    );
}

export function renderPartnerTab({ config, values, isDetail, activeTabId, onChange }) {
    if (activeTabId === 'contacts') {
        return <ContactsTab config={config} />;
    }

    if (activeTabId === 'shipping') {
        return <ShippingTab config={config} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'sales') {
        return <SalesTab config={config} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'purchase') {
        return <SupplierPurchaseTab config={config} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'tax') {
        return <TaxTab config={config} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'receivable' || activeTabId === 'payable') {
        return <BalanceTab config={config} />;
    }

    if (activeTabId === 'others') {
        return config.partnerType === 'supplier' ? (
            <SupplierOthersTab config={config} values={values} onChange={onChange} />
        ) : (
            <CustomerOthersTab config={config} values={values} onChange={onChange} />
        );
    }

    return <GeneralTab config={config} values={values} isDetail={isDetail} onChange={onChange} />;
}
