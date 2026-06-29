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
                        <FormFieldRow label={config.labels.code} required className="lg:grid-cols-[150px_minmax(0,1fr)]">
                            <TextInput
                                id="code"
                                name="code"
                                value={values.code}
                                readOnly
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

                    <FormFieldRow label={config.labels.fax}>
                        <TextInput
                            id="fax"
                            name="fax"
                            value={values.fax}
                            onChange={(event) => onChange('fax', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                            trailing={isDetail && values.fax ? <CloseIcon className="h-4 w-4 text-text-darkest" /> : null}
                            trailingClassName="px-3"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.website}>
                        <TextInput
                            id="website"
                            name="website"
                            value={values.website}
                            onChange={(event) => onChange('website', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
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


                    {config.generalRightFields?.map((field) => (
                        <FormFieldRow key={field.id} label={field.label}>
                            {field.type === 'checkbox' ? (
                                <CheckboxField
                                    id={`business-partner-${field.id}`}
                                    label={field.checkboxLabel}
                                    checked={Boolean(values[field.id])}
                                    onChange={(event) => onChange(field.id, event.target.checked)}
                                    align="center"
                                    labelClassName="text-base"
                                    inputClassName="mt-0 h-[18px] w-[18px]"
                                    containerClassName="w-auto"
                                />
                            ) : (
                                <SelectField
                                    value={values[field.id]}
                                    onChange={(event) => onChange(field.id, event.target.value)}
                                    className="h-[40px] rounded-[4px] border-ui-border"
                                    selectClassName="text-xs sm:text-sm text-brand-dark"
                                >
                                    {field.options?.map((option) => (
                                        <option key={`${field.id}-${option}`} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </SelectField>
                            )}
                        </FormFieldRow>
                    ))}
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
    const [showModal, setShowModal] = useState(false);
    const initialModalValues = {
        name: '',
        phone: '',
        street: '',
        city: '',
        postalCode: '',
        province: '',
        country: '',
    };
    const [modalValues, setModalValues] = useState(initialModalValues);

    const [showAmbilDropdown, setShowAmbilDropdown] = useState(false);
    const ambilAnchorRef = useRef(null);

    const handleSelectModalCity = (item) => {
        setModalValues(prev => ({
            ...prev,
            city: item.city,
            province: item.province,
            postalCode: item.postalCode,
            country: item.country,
        }));
    };

    const handleModalSubmit = () => {
        if (!modalValues.name?.trim()) {
            alert('Nama wajib diisi.');
            return;
        }
        const updated = [...(values.additionalAddresses || []), modalValues];
        onChange('additionalAddresses', updated);
        setShowModal(false);
        setModalValues(initialModalValues);
    };

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
                        labelClassName="text-base"
                        inputClassName="mt-0 h-[18px] w-[18px]"
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

            <section>
                <SectionHeading title={config.headingLabels.shippingRight} />
                <div className="mb-3 mt-4 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="inline-flex h-[34px] w-[56px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                    <button
                        ref={ambilAnchorRef}
                        type="button"
                        onClick={() => setShowAmbilDropdown(!showAmbilDropdown)}
                        className="inline-flex h-[34px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-4 text-base text-brand-blue hover:bg-brand-blue-lightest transition"
                    >
                        <span>Ambil</span>
                        <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    <PortalDropdown
                        open={showAmbilDropdown}
                        onClose={() => setShowAmbilDropdown(false)}
                        anchorRef={ambilAnchorRef}
                        align="start"
                    >
                        <DropdownMenuItem
                            onClick={() => {
                                setShowAmbilDropdown(false);
                                showSuccessToast({
                                    title: 'Impor Excel',
                                    message: 'Fitur impor dari excel berhasil dipicu.',
                                });
                            }}
                        >
                            Impor dari excel
                        </DropdownMenuItem>
                    </PortalDropdown>
                </div>

                {values.additionalAddresses && values.additionalAddresses.length > 0 ? (
                    <div className="mt-3 overflow-x-auto">
                        <DataTable wrapperClassName="border-table-wrapper-border">
                            <DataTableHeader className="bg-table-header-bg">
                                <tr>
                                    <DataTableHead className="py-2 text-xs sm:text-sm font-semibold text-brand-dark w-[80%]">
                                        Alamat
                                    </DataTableHead>
                                    <DataTableHead className="py-2 text-xs sm:text-sm font-semibold text-brand-dark w-[20%] text-center">
                                        Aksi
                                    </DataTableHead>
                                </tr>
                            </DataTableHeader>
                            <DataTableBody>
                                {values.additionalAddresses.map((item, idx) => {
                                    const addressLine = `${item.name} (${item.phone})\n${item.street}, ${item.city}, ${item.province}, ${item.country} ${item.postalCode}`;
                                    return (
                                        <tr key={idx} className="border-b border-ui-border-medium hover:bg-slate-50 transition-colors">
                                            <DataTableCell className="py-2.5 text-xs sm:text-sm text-brand-dark whitespace-pre-line leading-relaxed">
                                                {addressLine}
                                            </DataTableCell>
                                            <DataTableCell className="py-2.5 text-xs sm:text-sm text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = values.additionalAddresses.filter((_, i) => i !== idx);
                                                        onChange('additionalAddresses', updated);
                                                    }}
                                                    className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-[3px] border border-red-200 bg-white text-red-600 hover:bg-red-50 transition"
                                                    title="Hapus Alamat"
                                                >
                                                    <TrashIcon className="h-4 w-4 text-red-600" />
                                                </button>
                                            </DataTableCell>
                                        </tr>
                                    );
                                })}
                            </DataTableBody>
                        </DataTable>
                    </div>
                ) : (
                    <EmptyDataTable columns={config.shippingTable.columns} emptyLabel={config.shippingTable.emptyLabel} />
                )}
            </section>

            {/* Modal Alamat Pengiriman */}
            <ModalBase open={showModal} onBackdropClick={() => setShowModal(false)} panelClassName="max-w-[500px]">
                <div className="flex items-center justify-between bg-brand-dark px-4 py-3 text-white">
                    <div className="flex items-center gap-2">
                        <InfoIcon className="h-5 w-5 text-white" />
                        <span className="text-sm font-semibold">Alamat Pengiriman</span>
                    </div>
                    <button type="button" onClick={() => setShowModal(false)} className="text-white hover:opacity-85">
                        <CloseIcon className="h-4 w-4 text-white" />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    <TextInput
                        placeholder="Nama"
                        value={modalValues.name}
                        onChange={(e) => setModalValues(prev => ({ ...prev, name: e.target.value }))}
                        className="h-[40px] rounded-[4px] border-slate-400"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />

                    <TextInput
                        prefix="Handphone"
                        value={modalValues.phone}
                        onChange={(e) => setModalValues(prev => ({ ...prev, phone: e.target.value }))}
                        className="h-[40px] rounded-[4px] border-slate-400"
                        prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />

                    <TextareaField
                        prefix="Jalan"
                        value={modalValues.street}
                        onChange={(e) => setModalValues(prev => ({ ...prev, street: e.target.value }))}
                        rows={4}
                        className="rounded-[4px] border-slate-400"
                        prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                        textareaClassName="min-h-[100px] text-xs sm:text-sm text-brand-dark"
                    />

                    <div className="grid gap-3 grid-cols-[minmax(0,1fr)_160px]">
                        <CityAutocompleteInput
                            value={modalValues.city}
                            onChange={(val) => setModalValues(prev => ({ ...prev, city: val }))}
                            onSelectCity={handleSelectModalCity}
                            prefix="Kota"
                            prefixClassName="min-w-[62px] border-slate-400 bg-input-prefix-bg px-3 text-xs sm:text-sm text-slate-600"
                            dropdownLeftOffsetClassName="left-[62px]"
                        />
                        <TextInput
                            value={modalValues.postalCode}
                            onChange={(e) => setModalValues(prev => ({ ...prev, postalCode: e.target.value }))}
                            prefix="K.Pos"
                            className="h-[40px] rounded-[4px] border-slate-400"
                            prefixClassName="min-w-[50px] bg-input-prefix-bg px-2.5 text-slate-600"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </div>

                    <TextInput
                        prefix="Provinsi"
                        value={modalValues.province}
                        onChange={(e) => setModalValues(prev => ({ ...prev, province: e.target.value }))}
                        className="h-[40px] rounded-[4px] border-slate-400"
                        prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />

                    <TextInput
                        prefix="Negara"
                        value={modalValues.country}
                        onChange={(e) => setModalValues(prev => ({ ...prev, country: e.target.value }))}
                        className="h-[40px] rounded-[4px] border-slate-400"
                        prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={handleModalSubmit}
                            className="rounded-[4px] bg-[#1e4e9f] hover:bg-[#1a4387] px-6 py-2 text-sm font-semibold text-white shadow transition-colors"
                        >
                            Lanjut
                        </button>
                    </div>
                </div>
            </ModalBase>
        </div>
    );
}
