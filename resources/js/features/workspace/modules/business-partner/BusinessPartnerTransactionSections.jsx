import CheckboxField from '@/components/ui/CheckboxField';
import {
    AddressStack,
    ChipLookupField,
    EmptyDataTable,
    FormFieldRow,
    PlusIcon,
    SectionHeading,
    SelectField,
    TextInput,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';

export function SalesTab({ config, values, onChange }) {
    const accountRows = [
        ['accountReceivable', config.labels.receivable],
        ['accountAdvance', config.labels.advance],
        ['accountSales', config.labels.sales],
        ['accountItemDiscount', config.labels.itemDiscount],
        ['accountCostOfSales', config.labels.costOfSales],
        ['accountSalesReturn', config.labels.salesReturn],
        ['accountSalesDiscount', config.labels.salesDiscount],
    ];

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section>
                <SectionHeading title={config.headingLabels.salesLeft} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={config.labels.priceCategory} required>
                        <ChipLookupField values={values.priceCategories} placeholder={config.lookupPlaceholders.default} onRemove={() => {}} searchLabel="Cari kategori harga" />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.discountCategory}>
                        <ChipLookupField values={values.discountCategory} placeholder={config.lookupPlaceholders.default} onRemove={() => {}} searchLabel="Cari kategori diskon" />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.defaultSalesPerson}>
                        <ChipLookupField values={values.defaultSalesPerson} placeholder={config.lookupPlaceholders.default} onRemove={() => {}} searchLabel="Cari penjual" />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.defaultDiscountPercent}>
                        <TextInput
                            value={values.defaultDiscountPercent}
                            onChange={(event) => onChange('defaultDiscountPercent', event.target.value)}
                            prefix="%"
                            className="h-[40px] max-w-[360px] rounded-[4px] border-ui-border"
                            prefixClassName="min-w-[34px] bg-input-prefix-bg-compact px-3 text-text-inactive"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.defaultDescription}>
                        <TextInput value={values.defaultDescription} onChange={(event) => onChange('defaultDescription', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border" inputClassName="text-xs sm:text-sm text-brand-dark" />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.consignment}>
                        <CheckboxField
                            id="customer-consignment"
                            label="Ya, Perusahaan menitipkan barang ke Pelanggan ini"
                            checked={Boolean(values.consignment)}
                            onChange={(event) => onChange('consignment', event.target.checked)}
                            align="center"
                            labelClassName="text-base"
                            inputClassName="mt-0 h-[18px] w-[18px]"
                            containerClassName="w-auto"
                        />
                    </FormFieldRow>
                </div>
            </section>

            <section>
                <SectionHeading title={config.headingLabels.salesRight} />
                <div className="mt-4 space-y-3">
                    {accountRows.map(([fieldKey, label]) => (
                        <FormFieldRow key={fieldKey} label={label}>
                            <ChipLookupField values={values[fieldKey]} placeholder={config.lookupPlaceholders.default} onRemove={() => {}} searchLabel={`Cari ${label}`} />
                        </FormFieldRow>
                    ))}
                </div>
                <p className="mt-4 max-w-[560px] text-sm italic leading-7 text-red-550">{config.helperText.salesAccountNote}</p>
            </section>
        </div>
    );
}

export function TaxTab({ config, values, onChange }) {
    const taxOptions = config.taxOptions ?? {};

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section>
                <SectionHeading title={config.headingLabels.taxLeft} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={config.labels.taxCheckbox}>
                        <CheckboxField
                            id="customer-tax-included"
                            label={taxOptions.includedLabel}
                            checked={Boolean(values.taxIncluded)}
                            onChange={(event) => onChange('taxIncluded', event.target.checked)}
                            align="center"
                            labelClassName="text-base"
                            inputClassName="mt-0 h-[18px] w-[18px]"
                            containerClassName="w-auto"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.taxIdType}>
                        <SelectField value={values.taxIdType} onChange={(event) => onChange('taxIdType', event.target.value)} className="h-[40px] max-w-[360px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
                            <option value="NIK">NIK</option>
                            <option value="NPWP">NPWP</option>
                        </SelectField>
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.taxNumber}>
                        <TextInput value={values.taxNumber} onChange={(event) => onChange('taxNumber', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border" inputClassName="text-xs sm:text-sm text-brand-dark" />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.taxName}>
                        <TextInput value={values.taxName} onChange={(event) => onChange('taxName', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border" inputClassName="text-xs sm:text-sm text-brand-dark" />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.taxTkuId}>
                        <TextInput value={values.taxTkuId} onChange={(event) => onChange('taxTkuId', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border" inputClassName="text-xs sm:text-sm text-brand-dark" />
                    </FormFieldRow>

                    {taxOptions.showCountryLookup ? (
                        <FormFieldRow label={config.labels.taxCountry}>
                            <ChipLookupField values={values.taxCountry} placeholder={config.lookupPlaceholders.default} onRemove={() => {}} searchLabel="Cari kode negara" />
                        </FormFieldRow>
                    ) : null}

                    <FormFieldRow label={config.labels.taxTransactionType}>
                        <SelectField value={values.taxTransactionType} onChange={(event) => onChange('taxTransactionType', event.target.value)} className="h-[40px] rounded-[4px] border-ui-border" selectClassName="text-xs sm:text-sm text-brand-dark">
                            <option value="Ditanggung">Ditanggung</option>
                            <option value="Dipungut">Dipungut</option>
                        </SelectField>
                    </FormFieldRow>
                </div>
            </section>

            <section>
                <SectionHeading title={config.headingLabels.taxRight} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label="Alamat Pajak">
                        <CheckboxField
                            id="customer-tax-same-address"
                            label={taxOptions.addressSameLabel}
                            checked={Boolean(values.taxSameAsBilling)}
                            onChange={(event) => onChange('taxSameAsBilling', event.target.checked)}
                            align="center"
                            labelClassName="text-base"
                            inputClassName="mt-0 h-[18px] w-[18px]"
                            containerClassName="w-auto"
                        />
                    </FormFieldRow>

                    <AddressStack
                        prefixValue="Jalan"
                        values={{
                            street: values.taxStreet,
                            city: values.taxCity,
                            postalCode: values.taxPostalCode,
                            province: values.taxProvince,
                            country: values.taxCountryName,
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
            </section>
        </div>
    );
}

export function BalanceTab({ config }) {
    return (
        <div>
            <div className="mb-3 flex items-center gap-3">
                <h3 className="text-2xl font-normal text-brand-dark">{config.balanceTable.title}</h3>
                <button type="button" className="inline-flex h-[34px] w-[56px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue">
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>
            <EmptyDataTable columns={config.balanceTable.columns} emptyLabel={config.balanceTable.emptyLabel} />
        </div>
    );
}
