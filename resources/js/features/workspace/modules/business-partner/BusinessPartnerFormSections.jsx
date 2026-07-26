import { useState } from 'react';
import { showErrorToast } from '@/components/feedback/toast';
import CheckboxField from '@/components/ui/CheckboxField';
import ModalBase from '@/components/ui/ModalBase';
import { DataTable, DataTableBody, DataTableCell, DataTableHead, DataTableHeader, DataTableRow } from '@/components/ui/DataTable';
import TextareaField from '@/components/ui/TextareaField';
import { AccountLookupField, AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import {
    ChipLookupField,
    EmptyDataTable,
    FormFieldRow,
    PartnerInlineTableSection,
    PlusIcon,
    SectionHeading,
    TextInput,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import { BalanceTab, SalesTab, TaxTab } from '@/features/workspace/modules/business-partner/BusinessPartnerTransactionSections';
import { ContactsTab, GeneralTab, ShippingTab } from '@/features/workspace/modules/business-partner/BusinessPartnerProfileSections';
import RadioField from '@/components/ui/RadioField';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { TrashIcon } from '@/features/workspace/shared/Icons';

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
                                labelClassName="text-xs sm:text-sm"
                                inputClassName="mt-0 h-4 w-4 sm:h-[18px] sm:w-[18px]"
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
                                labelClassName="text-xs sm:text-sm"
                                inputClassName="mt-0 h-4 w-4 sm:h-[18px] sm:w-[18px]"
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
            <section className="space-y-6">
                <div>
                    <SectionHeading title={purchaseConfig.titleLeft ?? 'Pembelian'} />

                    <div className="mt-4 space-y-3">
                        <FormFieldRow label={purchaseConfig.discountLabel ?? 'Default Diskon (%)'}>
                            <TextInput
                                id="defaultDiscountPercent"
                                name="defaultDiscountPercent"
                                value={values.defaultDiscountPercent || ''}
                                onChange={(event) => {
                                    const sanitized = event.target.value.replace(/[^0-9.]/g, '');
                                    onChange('defaultDiscountPercent', sanitized);
                                }}
                                suffix="%"
                                className="h-[40px] max-w-[200px] rounded-[4px] border-ui-border"
                                suffixClassName="bg-input-prefix-bg-compact px-3 text-text-inactive text-xs sm:text-sm"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                            />
                        </FormFieldRow>

                        <FormFieldRow label={purchaseConfig.descriptionLabel ?? 'Default Deskripsi'}>
                            <TextareaField
                                value={values.defaultDescription || ''}
                                onChange={(event) => onChange('defaultDescription', event.target.value)}
                                rows={3}
                                className="rounded-[4px] border-ui-border"
                                textareaClassName="min-h-[80px] text-xs sm:text-sm text-brand-dark"
                            />
                        </FormFieldRow>

                        <FormFieldRow label="Batas Saldo Utang">
                            <TextInput
                                id="creditLimit"
                                name="creditLimit"
                                value={values.creditLimit || ''}
                                onChange={(event) => {
                                    const sanitized = event.target.value.replace(/[^0-9]/g, '');
                                    onChange('creditLimit', sanitized);
                                }}
                                prefix="Rp"
                                className="h-[40px] rounded-[4px] border-ui-border"
                                prefixClassName="min-w-[34px] bg-input-prefix-bg-compact px-3 text-text-inactive"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                            />
                        </FormFieldRow>
                    </div>
                </div>

                <div>
                    <SectionHeading title="Akun Pembelian" />

                    <div className="mt-4 space-y-3">
                        <FormFieldRow label={purchaseConfig.payableLabel ?? 'Akun Utang'}>
                            <AccountLookupField
                                id="payableAccount"
                                name="payableAccount"
                                values={values.payableAccount || []}
                                placeholder="Cari/Pilih..."
                                onSelectAccount={(acc) => {
                                    if (acc && acc.name) {
                                        const current = values.payableAccount || [];
                                        if (!current.includes(acc.name)) {
                                            onChange('payableAccount', [...current, acc.name]);
                                        }
                                    }
                                }}
                                onRemove={(val) => {
                                    const current = values.payableAccount || [];
                                    const targetName = typeof val === 'string' ? val : (val?.name ?? val);
                                    onChange('payableAccount', current.filter(x => x !== targetName));
                                }}
                            />
                        </FormFieldRow>

                        <FormFieldRow label={purchaseConfig.advanceLabel ?? 'Akun Uang muka'}>
                            <AccountLookupField
                                id="advanceAccount"
                                name="advanceAccount"
                                values={values.advanceAccount || []}
                                placeholder="Cari/Pilih..."
                                onSelectAccount={(acc) => {
                                    if (acc && acc.name) {
                                        const current = values.advanceAccount || [];
                                        if (!current.includes(acc.name)) {
                                            onChange('advanceAccount', [...current, acc.name]);
                                        }
                                    }
                                }}
                                onRemove={(val) => {
                                    const current = values.advanceAccount || [];
                                    const targetName = typeof val === 'string' ? val : (val?.name ?? val);
                                    onChange('advanceAccount', current.filter(x => x !== targetName));
                                }}
                            />
                        </FormFieldRow>

                        {purchaseConfig.accountNote && (
                            <p className="text-xs text-red-500 italic leading-relaxed pt-1">
                                {purchaseConfig.accountNote}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <PartnerInlineTableSection
                title={purchaseConfig.titleRight ?? 'Rekening Bank'}
                addButtonTitle={purchaseConfig.bankAddLabel ?? 'Tambah rekening bank'}
                modalTitle="Tambah Rekening Bank Baru"
                columns={[
                    { id: 'bankNumber', label: 'No Rekening' },
                    { id: 'accountName', label: 'Atas Nama' },
                    { id: 'bankName', label: 'Nama Bank' },
                ]}
                items={values?.bankAccounts ?? []}
                emptyLabel={config.bankTable.emptyLabel}
                fields={[
                    { id: 'bankNumber', label: 'No Rekening', required: true, placeholder: 'Contoh: 1234567890' },
                    { id: 'accountName', label: 'Atas Nama', placeholder: 'Contoh: PT Bangunan Jaya' },
                    { id: 'bankName', label: 'Nama Bank', placeholder: 'Contoh: BCA, Mandiri, BRI' },
                ]}
                onValidateBeforeOpen={() => {
                    if (!values?.name?.trim()) {
                        showErrorToast({
                            title: 'Perhatian',
                            message: 'Nama wajib diisi terlebih dahulu di Tab Umum.',
                        });
                        return false;
                    }
                    return true;
                }}
                onAdd={(newItem) => onChange('bankAccounts', [...(values?.bankAccounts ?? []), newItem])}
                onRemove={(index) => onChange('bankAccounts', (values?.bankAccounts ?? []).filter((_, i) => i !== index))}
            />
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
                        labelClassName="text-xs sm:text-sm"
                        inputClassName="mt-0 h-4 w-4 sm:h-[18px] sm:w-[18px]"
                        containerClassName="w-auto"
                    />
                </FormFieldRow>

                <FormFieldRow label={othersConfig.notesLabel}>
                    <TextareaField
                        value={values.notes}
                        onChange={(event) => onChange('notes', event.target.value)}
                        rows={4}
                        className="max-w-full sm:max-w-[50%] rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[98px] text-xs sm:text-sm text-brand-dark"
                    />
                </FormFieldRow>
            </div>
        </section>
    );
}

export function renderPartnerTab({ config, values, isDetail, activeTabId, onChange }) {
    if (activeTabId === 'contacts') {
        return <ContactsTab config={config} values={values} onChange={onChange} />;
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
        return <BalanceTab config={config} values={values} onChange={onChange} />;
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
