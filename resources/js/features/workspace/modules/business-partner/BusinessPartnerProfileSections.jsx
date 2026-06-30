import { useState, useRef } from 'react';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import CheckboxField from '@/components/ui/CheckboxField';
import {
    AddressStack,
    ChipLookupField,
    CloseIcon,
    EmptyDataTable,
    FormFieldRow,
    PlusIcon,
    SectionHeading,
    SelectField,
    TextInput,
    TransactionSwitch,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import { ChevronDownIcon, TrashIcon, InfoIcon } from '@/features/workspace/shared/Icons';
import ModalBase from '@/components/ui/ModalBase';
import PortalDropdown from '@/components/ui/PortalDropdown';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import TextareaField from '@/components/ui/TextareaField';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';
import { showSuccessToast } from '@/components/feedback/toast';
import { DataTable, DataTableBody, DataTableCell, DataTableHeader, DataTableHead } from '@/components/ui/DataTable';

export function GeneralTab({ config, values, isDetail, onChange }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section>
                <SectionHeading title={config.headingLabels.generalLeft} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={config.labels.name} required>
                        <TextInput
                            id="name"
                            name="name"
                            value={values.name}
                            onChange={(event) => onChange('name', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                            trailing={isDetail ? <CloseIcon className="h-4 w-4 text-text-darkest" /> : null}
                            trailingClassName={isDetail ? 'px-3' : ''}
                        />
                    </FormFieldRow>

                    {isDetail && (
                        <FormFieldRow label={config.labels.code} required>
                            <TextInput
                                id="code"
                                name="code"
                                value={values.code}
                                onChange={(event) => onChange('code', event.target.value)}
                                className="h-[40px] rounded-[4px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                trailing={<CloseIcon className="h-4 w-4 text-text-darkest" />}
                                trailingClassName="px-3"
                            />
                        </FormFieldRow>
                    )}

                    <FormFieldRow label={config.labels.category}>
                        <BackendLookupField
                            resource={config.type === 'customer' ? 'customer-categories' : 'supplier-categories'}
                            values={(values.category || []).map(name => typeof name === 'string' ? { name } : name)}
                            placeholder={config.lookupPlaceholders.category}
                            searchLabel="Cari kategori"
                            onSelect={(option) => {
                                onChange('categoryId', option.id);
                                onChange('category', [option.name]);
                            }}
                            onRemove={() => {
                                onChange('categoryId', null);
                                onChange('category', []);
                            }}
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.businessPhone}>
                        <TextInput
                            id="businessPhone"
                            name="businessPhone"
                            value={values.businessPhone}
                            onChange={(event) => onChange('businessPhone', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                            trailing={isDetail && values.businessPhone ? <CloseIcon className="h-4 w-4 text-text-darkest" /> : null}
                            trailingClassName="px-3"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.mobilePhone}>
                        <TextInput
                            id="mobilePhone"
                            name="mobilePhone"
                            value={values.mobilePhone}
                            onChange={(event) => onChange('mobilePhone', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.whatsapp}>
                        <TextInput
                            id="whatsapp"
                            name="whatsapp"
                            value={values.whatsapp}
                            onChange={(event) => onChange('whatsapp', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.email}>
                        <TextInput
                            id="email"
                            name="email"
                            value={values.email}
                            onChange={(event) => onChange('email', event.target.value)}
                            placeholder="Email"
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                            trailing={isDetail && values.email ? <CloseIcon className="h-4 w-4 text-text-darkest" /> : null}
                            trailingClassName="px-3"
                        />
                    </FormFieldRow>
                </div>
            </section>

            <section>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <SectionHeading title={config.headingLabels.generalRight} />
                    </div>
                    {isDetail && values.detailActionLabel ? (
                        <button
                            type="button"
                            className="shrink-0 rounded-[4px] border border-tab-inactive-border-l bg-tab-inactive-border-t px-4 py-2 text-base text-tab-primary-inactive-text"
                        >
                            {values.detailActionLabel}
                        </button>
                    ) : null}
                </div>

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={config.labels.billingAddress}>
                        <AddressStack
                            prefixValue="Jalan"
                            layout="vertical"
                            values={{
                                street: values.billingStreet,
                                city: values.billingCity,
                                postalCode: values.billingPostalCode,
                                province: values.billingProvince,
                                country: values.billingCountry,
                            }}
                            onChange={(field, nextValue) => {
                                const fieldMap = {
                                    street: 'billingStreet',
                                    city: 'billingCity',
                                    postalCode: 'billingPostalCode',
                                    province: 'billingProvince',
                                    country: 'billingCountry',
                                };
                                onChange(fieldMap[field], nextValue);
                            }}
                        />
                    </FormFieldRow>

                    <FormFieldRow label="Catatan">
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

export function ContactsTab({ config }) {
    return (
        <div>
            <div className="mb-3 border-b border-ui-border-medium pb-1.5 flex items-center gap-3">
                <h3 className="text-base sm:text-lg font-normal text-input-brand">{config.contactsTable.title}</h3>
                <button
                    type="button"
                    className="inline-flex h-[34px] w-[56px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition"
                >
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>
            <EmptyDataTable columns={config.contactsTable.columns} emptyLabel={config.contactsTable.emptyLabel} />
        </div>
    );
}

export function ShippingTab({ config, values, onChange }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section>
                <SectionHeading title={config.headingLabels.shippingLeft} />

                <div className="mt-4 space-y-3">
                    <CheckboxField
                        id="customer-shipping-same"
                        label="Sama dengan alamat penagihan"
                        checked={Boolean(values.shippingSameAsBilling)}
                        onChange={(event) => onChange('shippingSameAsBilling', event.target.checked)}
                        align="center"
                        labelClassName="text-xs sm:text-sm"
                        inputClassName="mt-0 h-4 w-4 sm:h-[18px] sm:w-[18px]"
                        containerClassName="w-auto"
                    />

                    <AddressStack
                        prefixValue="Jalan"
                        layout="grid"
                        readOnly={Boolean(values.shippingSameAsBilling)}
                        values={{
                            street: values.shippingSameAsBilling ? (values.billingStreet ?? '') : (values.shippingStreet ?? ''),
                            city: values.shippingSameAsBilling ? (values.billingCity ?? '') : (values.shippingCity ?? ''),
                            postalCode: values.shippingSameAsBilling ? (values.billingPostalCode ?? '') : (values.shippingPostalCode ?? ''),
                            province: values.shippingSameAsBilling ? (values.billingProvince ?? '') : (values.shippingProvince ?? ''),
                            country: values.shippingSameAsBilling ? (values.billingCountry ?? '') : (values.shippingCountry ?? ''),
                        }}
                        onChange={(field, nextValue) => {
                            const fieldMap = {
                                street: 'shippingStreet',
                                city: 'shippingCity',
                                postalCode: 'shippingPostalCode',
                                province: 'shippingProvince',
                                country: 'shippingCountry',
                            };
                            onChange(fieldMap[field], nextValue);
                        }}
                    />
                </div>
            </section>
            <div></div>
        </div>
    );
}
