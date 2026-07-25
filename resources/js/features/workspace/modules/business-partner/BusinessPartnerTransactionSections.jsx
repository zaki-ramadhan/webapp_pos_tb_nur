import { useState } from 'react';
import CheckboxField from '@/components/ui/CheckboxField';
import ModalBase from '@/components/ui/ModalBase';
import { DataTable, DataTableBody, DataTableCell, DataTableHead, DataTableHeader, DataTableRow } from '@/components/ui/DataTable';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import {
    AddressStack,
    ChipLookupField,
    EmptyDataTable,
    FormFieldRow,
    PartnerInlineTableSection,
    PlusIcon,
    SectionHeading,
    SelectField,
    TextInput,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

export function SalesTab({ config, values, onChange }) {
    return (
        <div className="max-w-[500px] space-y-3">
            <SectionHeading title={config.headingLabels.salesLeft} />

            <FormFieldRow label="Batas Saldo Piutang">
                <TextInput
                    id="creditLimit"
                    name="creditLimit"
                    value={values.creditLimit}
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
    );
}

export function TaxTab({ config, values, onChange }) {
    const taxOptions = config.taxOptions ?? {};
    const headingLabels = config.headingLabels ?? {};

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section>
                <SectionHeading title={headingLabels.taxLeft ?? 'Pajak'} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={config.labels?.taxCheckbox ?? 'Pajak'}>
                        <CheckboxField
                            id="taxIncluded"
                            label={taxOptions.includedLabel ?? 'Default Faktur sudah termasuk Pajak'}
                            checked={Boolean(values.taxIncluded)}
                            onChange={(event) => onChange('taxIncluded', event.target.checked)}
                            align="center"
                            labelClassName="text-xs sm:text-sm"
                            inputClassName="mt-0 h-4 w-4 sm:h-[18px] sm:w-[18px]"
                            containerClassName="w-auto"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels?.taxIdType ?? 'Tipe ID Pajak'}>
                        <SelectField
                            id="taxIdType"
                            name="taxIdType"
                            value={values.taxIdType || 'NIK'}
                            onChange={(event) => onChange('taxIdType', event.target.value)}
                            options={['NIK', 'NPWP', 'Paspor', 'Lainnya']}
                            className="h-[40px] rounded-[4px] border-ui-border text-xs sm:text-sm"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels?.taxNumber ?? 'Nomor Wajib Pajak'}>
                        <TextInput
                            id="taxNumber"
                            name="taxNumber"
                            value={values.taxNumber || ''}
                            onChange={(event) => onChange('taxNumber', event.target.value.replace(/[^0-9]/g, ''))}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels?.taxName ?? 'Nama Wajib Pajak'}>
                        <TextInput
                            id="taxName"
                            name="taxName"
                            value={values.taxName || ''}
                            onChange={(event) => onChange('taxName', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels?.taxTkuId ?? 'NITKU'}>
                        <TextInput
                            id="taxTkuId"
                            name="taxTkuId"
                            value={values.taxTkuId || ''}
                            onChange={(event) => onChange('taxTkuId', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels?.taxTransactionType ?? 'Tipe Transaksi'}>
                        <SelectField
                            id="taxTransactionType"
                            name="taxTransactionType"
                            value={values.taxTransactionType || 'Digunggung'}
                            onChange={(event) => onChange('taxTransactionType', event.target.value)}
                            options={['Digunggung', 'Ditanggung', 'Pemungut', 'Non-Pemungut']}
                            className="h-[40px] rounded-[4px] border-ui-border text-xs sm:text-sm"
                        />
                    </FormFieldRow>
                </div>
            </section>

            <section>
                <SectionHeading title={headingLabels.taxRight ?? 'Alamat'} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label="Alamat Pajak">
                        <div className="space-y-3">
                            <CheckboxField
                                id="taxSameAsBilling"
                                label={taxOptions.addressSameLabel ?? 'Alamat pajak sama dengan alamat pembayaran'}
                                checked={Boolean(values.taxSameAsBilling)}
                                onChange={(event) => onChange('taxSameAsBilling', event.target.checked)}
                                align="center"
                                labelClassName="text-xs sm:text-sm"
                                inputClassName="mt-0 h-4 w-4 sm:h-[18px] sm:w-[18px]"
                                containerClassName="w-auto"
                            />

                            <AddressStack
                                prefixValue="Jalan"
                                layout="grid"
                                readOnly={Boolean(values.taxSameAsBilling)}
                                values={{
                                    street: values.taxSameAsBilling ? values.billingStreet : values.taxStreet,
                                    city: values.taxSameAsBilling ? values.billingCity : values.taxCity,
                                    postalCode: values.taxSameAsBilling ? values.billingPostalCode : values.taxPostalCode,
                                    province: values.taxSameAsBilling ? values.billingProvince : values.taxProvince,
                                    country: values.taxSameAsBilling ? values.billingCountry : values.taxCountryName,
                                }}
                                onChange={(field, nextValue) => {
                                    const fieldMap = {
                                        street: 'taxStreet',
                                        city: 'taxCity',
                                        postalCode: 'taxPostalCode',
                                        province: 'taxProvince',
                                        country: 'taxCountryName',
                                    };
                                    onChange(fieldMap[field], nextValue);
                                }}
                            />
                        </div>
                    </FormFieldRow>
                </div>
            </section>
        </div>
    );
}

import { showErrorToast } from '@/components/feedback/toast';

export function BalanceTab({ config, values, onChange }) {
    const rows = values?.openingBalanceRows ?? values?.receivableRows ?? [];

    return (
        <PartnerInlineTableSection
            title={config.balanceTable.title}
            addButtonTitle="Tambah Saldo Awal"
            modalTitle="Tambah Saldo Awal Baru"
            columns={[
                { id: 'date', label: 'Tanggal' },
                { id: 'amount', label: 'Jumlah', align: 'right', format: (val) => val ? Number(val).toLocaleString('id-ID') : '0' },
                { id: 'currency', label: 'Mata Uang' },
                { id: 'number', label: 'Nomor #' },
                { id: 'notes', label: 'Keterangan' },
            ]}
            items={rows}
            emptyLabel={config.balanceTable.emptyLabel}
            fields={[
                { id: 'date', label: 'Tanggal', type: 'date' },
                { id: 'amount', label: 'Jumlah (Rp)', required: true, sanitize: (val) => val.replace(/[^0-9.]/g, '') },
                { id: 'number', label: 'Nomor #' },
                { id: 'notes', label: 'Keterangan' },
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
            onAdd={(newItem) => onChange('openingBalanceRows', [...rows, { ...newItem, currency: 'Indonesian Rupiah' }])}
            onRemove={(index) => onChange('openingBalanceRows', rows.filter((_, i) => i !== index))}
        />
    );
}
