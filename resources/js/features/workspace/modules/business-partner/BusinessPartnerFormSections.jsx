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
import RadioField from '@/components/ui/RadioField';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';

function CustomerOthersTab({ config, values, onChange }) {
    return (
        <div className="space-y-6">
            <section className="max-w-[880px]">
                <SectionHeading title={config.headingLabels.othersLimit} />

                <div className="mt-4 space-y-3">
                    <RadioField
                        id="limit-per-customer"
                        name="receivableLimitMode"
                        label="Per Pelanggan"
                        checked={values.receivableLimitMode === 'per-customer'}
                        onChange={() => onChange('receivableLimitMode', 'per-customer')}
                        inputClassName="h-[18px] w-[18px]"
                        containerClassName="w-auto inline-flex items-center"
                    />

                    <div className="space-y-3 pl-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <CheckboxField
                                id="customer-receivable-age"
                                label="Jika ada faktur dengan umur lebih dari"
                                checked={Boolean(values.receivableAgeEnabled)}
                                onChange={(event) => onChange('receivableAgeEnabled', event.target.checked)}
                                align="center"
                                labelClassName="text-base"
                                inputClassName="mt-0 h-[18px] w-[18px]"
                                containerClassName="w-auto"
                            />
                            <TextInput
                                id="receivableAgeDays"
                                name="receivableAgeDays"
                                value={values.receivableAgeDays}
                                onChange={(event) => {
                                    const sanitized = event.target.value.replace(/[^0-9]/g, '');
                                    onChange('receivableAgeDays', sanitized);
                                }}
                                className="h-[40px] w-[130px] rounded-[4px] border-ui-border"
                                inputClassName="text-right text-xs sm:text-sm text-brand-dark"
                            />
                            <span className="text-xs sm:text-sm text-brand-dark">Hari</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <CheckboxField
                                id="customer-receivable-amount"
                                label="Jika total piutang & pesanan melebihi"
                                checked={Boolean(values.receivableAmountEnabled)}
                                onChange={(event) => onChange('receivableAmountEnabled', event.target.checked)}
                                align="center"
                                labelClassName="text-base"
                                inputClassName="mt-0 h-[18px] w-[18px]"
                                containerClassName="w-auto"
                            />
                            <TextInput
                                id="receivableAmount"
                                name="receivableAmount"
                                value={values.receivableAmount}
                                onChange={(event) => {
                                    const sanitized = event.target.value.replace(/[^0-9.]/g, '');
                                    onChange('receivableAmount', sanitized);
                                }}
                                className="h-[40px] w-[280px] rounded-[4px] border-ui-border"
                                inputClassName="text-right text-xs sm:text-sm text-text-light"
                            />
                        </div>
                    </div>

                    <RadioField
                        id="limit-merge-parent"
                        name="receivableLimitMode"
                        label="Tergabung ke Pelanggan Induk"
                        checked={values.receivableLimitMode === 'merge-parent'}
                        onChange={() => onChange('receivableLimitMode', 'merge-parent')}
                        inputClassName="h-[18px] w-[18px]"
                        containerClassName="w-auto inline-flex items-center"
                    />
                </div>
            </section>

            <section className="max-w-[880px]">
                <SectionHeading title={config.headingLabels.othersOther} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={config.labels.defaultWarehouse}>
                        <BackendLookupField
                            resource="warehouses"
                            values={(values.defaultWarehouse || []).map(item => typeof item === 'string' ? { name: item } : item)}
                            placeholder={config.lookupPlaceholders.default}
                            searchLabel="Cari gudang default"
                            onSelect={(option) => {
                                const current = values.defaultWarehouse || [];
                                if (!current.includes(option.name)) {
                                    onChange('defaultWarehouse', [...current, option.name]);
                                }
                            }}
                            onRemove={(option) => {
                                const current = values.defaultWarehouse || [];
                                onChange('defaultWarehouse', current.filter(x => x !== option.name));
                            }}
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.notes}>
                        <TextareaField
                            value={values.notes}
                            onChange={(event) => onChange('notes', event.target.value)}
                            rows={4}
                            className="rounded-[4px] border-ui-border"
                            textareaClassName="min-h-[98px] text-xs sm:text-sm text-brand-dark"
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
        <div className="grid gap-8 lg:grid-cols-2">
            <section>
                <SectionHeading title={purchaseConfig.titleLeft} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={purchaseConfig.discountLabel}>
                        <TextInput
                            id="defaultDiscountPercent"
                            name="defaultDiscountPercent"
                            value={values.defaultDiscountPercent}
                            onChange={(event) => {
                                const sanitized = event.target.value.replace(/[^0-9.]/g, '');
                                onChange('defaultDiscountPercent', sanitized);
                            }}
                            prefix="%"
                            className="h-[40px] max-w-[360px] rounded-[4px] border-ui-border"
                            prefixClassName="min-w-[34px] bg-input-prefix-bg-compact px-3 text-text-inactive"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={purchaseConfig.descriptionLabel}>
                        <TextareaField
                            value={values.defaultDescription}
                            onChange={(event) => onChange('defaultDescription', event.target.value)}
                            rows={3}
                            className="rounded-[4px] border-ui-border"
                            textareaClassName="min-h-[72px] text-xs sm:text-sm text-brand-dark"
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

                    <p className="mt-4 max-w-[620px] border-l-[4px] border-text-light pl-3 text-sm italic leading-7 text-red-550">
                        {purchaseConfig.accountNote}
                    </p>
                </div>
            </section>

            <section>
                <div className="mb-3 border-b border-ui-border-medium pb-1.5 flex items-center justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-normal text-input-brand">{purchaseConfig.titleRight}</h3>
                    <button
                        type="button"
                        aria-label={purchaseConfig.bankAddLabel}
                        className="inline-flex h-[34px] w-[56px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4">
                    <EmptyDataTable columns={config.bankTable.columns} emptyLabel={config.bankTable.emptyLabel} />
                </div>
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
                        labelClassName="text-base"
                        inputClassName="mt-0 h-[18px] w-[18px]"
                        containerClassName="w-auto"
                    />
                </FormFieldRow>

                <FormFieldRow label={othersConfig.notesLabel}>
                    <TextareaField
                        value={values.notes}
                        onChange={(event) => onChange('notes', event.target.value)}
                        rows={4}
                        className="rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[98px] text-xs sm:text-sm text-brand-dark"
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
