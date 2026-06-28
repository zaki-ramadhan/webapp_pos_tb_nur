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
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';

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

                    <FormFieldRow label={config.labels.code} required className="lg:grid-cols-[150px_minmax(0,1fr)]">
                        {isDetail ? (
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
                        ) : (
                            <div className="flex items-center gap-3">
                                <TransactionSwitch checked={values.autoCode} onChange={(nextValue) => onChange('autoCode', nextValue)} />
                                <div className="min-w-0 flex-1">
                                    <SelectField
                                        value={values.codeType}
                                        onChange={(event) => onChange('codeType', event.target.value)}
                                        className="h-[40px] rounded-[4px] border-ui-border"
                                        selectClassName="text-xs sm:text-sm text-brand-dark"
                                    >
                                        <option value={values.codeType}>{values.codeType}</option>
                                    </SelectField>
                                </div>
                            </div>
                        )}
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.category}>
                        <ChipLookupField
                            values={values.category}
                            placeholder={config.lookupPlaceholders.category}
                            onRemove={() => {}}
                            searchLabel="Cari kategori"
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
            <div className="mb-3 border-b border-ui-border-medium pb-3 flex items-center justify-between gap-3">
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
                        labelClassName="text-base"
                        inputClassName="mt-0 h-[18px] w-[18px]"
                        containerClassName="w-auto"
                    />

                    <AddressStack
                        prefixValue="Jalan"
                        values={{
                            street: values.shippingStreet,
                            city: values.shippingCity,
                            postalCode: values.shippingPostalCode,
                            province: values.shippingProvince,
                            country: values.shippingCountry,
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
                    <button type="button" className="inline-flex h-[34px] w-[56px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue">
                        <PlusIcon className="h-5 w-5" />
                    </button>
                    <button type="button" className="inline-flex h-[34px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-4 text-base text-brand-blue">
                        <span>Ambil</span>
                        <ChevronDownIcon className="h-4 w-4" />
                    </button>
                </div>
                <EmptyDataTable columns={config.shippingTable.columns} emptyLabel={config.shippingTable.emptyLabel} />
            </section>
        </div>
    );
}
