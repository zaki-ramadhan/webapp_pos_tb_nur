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
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

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

    const getFormattedValues = (fieldKey) => {
        const raw = values[fieldKey] || [];
        return raw.map(item => typeof item === 'string' ? { name: item } : item);
    };

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section>
                <SectionHeading title={config.headingLabels.salesLeft} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={config.labels.priceCategory} required>
                        <BackendLookupField
                            resource="sales-categories"
                            values={getFormattedValues('priceCategories')}
                            placeholder={config.lookupPlaceholders.default}
                            searchLabel="Cari kategori harga"
                            onSelect={(option) => {
                                const current = values.priceCategories || [];
                                if (!current.includes(option.name)) {
                                    onChange('priceCategories', [...current, option.name]);
                                }
                            }}
                            onRemove={(option) => {
                                const current = values.priceCategories || [];
                                onChange('priceCategories', current.filter(x => x !== option.name));
                            }}
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.discountCategory}>
                        <BackendLookupField
                            resource="sales-categories"
                            values={getFormattedValues('discountCategory')}
                            placeholder={config.lookupPlaceholders.default}
                            searchLabel="Cari kategori diskon"
                            onSelect={(option) => {
                                const current = values.discountCategory || [];
                                if (!current.includes(option.name)) {
                                    onChange('discountCategory', [...current, option.name]);
                                }
                            }}
                            onRemove={(option) => {
                                const current = values.discountCategory || [];
                                onChange('discountCategory', current.filter(x => x !== option.name));
                            }}
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.paymentTerms}>
                        <AccountLookupTextInput
                            id="paymentTerms"
                            resource="payment-terms"
                            value={(values.paymentTerms || [])[0] || ''}
                            placeholder="Cari/Pilih Syarat Pembayaran..."
                            searchLabel="Cari syarat pembayaran"
                            onSelectAccount={(record, label) => {
                                onChange('paymentTerms', label ? [label] : []);
                            }}
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.defaultSalesPerson}>
                        <BackendLookupField
                            resource="employees"
                            values={(values.defaultSalesPerson || []).map(item => typeof item === 'string' ? { fullName: item } : item)}
                            placeholder={config.lookupPlaceholders.default}
                            searchLabel="Cari penjual"
                            getOptionLabel={(option) => typeof option === 'string' ? option : (option?.fullName ?? option?.name ?? '')}
                            onSelect={(option) => {
                                const current = values.defaultSalesPerson || [];
                                const name = option.fullName ?? option.name;
                                if (!current.includes(name)) {
                                    onChange('defaultSalesPerson', [...current, name]);
                                }
                            }}
                            onRemove={(option) => {
                                const current = values.defaultSalesPerson || [];
                                const name = typeof option === 'string' ? option : (option?.fullName ?? option?.name);
                                onChange('defaultSalesPerson', current.filter(x => x !== name));
                            }}
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.defaultDiscountPercent}>
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

                    <FormFieldRow label={config.labels.defaultDescription}>
                        <TextInput
                            id="defaultDescription"
                            name="defaultDescription"
                            value={values.defaultDescription}
                            onChange={(event) => onChange('defaultDescription', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
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
                            <BackendLookupField
                                resource="accounts"
                                values={(values[fieldKey] || []).map(item => {
                                    if (typeof item === 'string') {
                                        const idx = item.indexOf(' - ');
                                        if (idx !== -1) {
                                            return { code: item.substring(0, idx), name: item.substring(idx + 3) };
                                        }
                                        return { name: item };
                                    }
                                    return item;
                                })}
                                placeholder={config.lookupPlaceholders.default}
                                searchLabel={`Cari ${label}`}
                                getOptionLabel={(option) => option ? (option.code ? `${option.code} - ${option.name}` : option.name) : ''}
                                onSelect={(option) => {
                                    const current = values[fieldKey] || [];
                                    const formatted = option.code ? `${option.code} - ${option.name}` : option.name;
                                    if (!current.includes(formatted)) {
                                        onChange(fieldKey, [...current, formatted]);
                                    }
                                }}
                                onRemove={(option) => {
                                    const current = values[fieldKey] || [];
                                    const formatted = option.code ? `${option.code} - ${option.name}` : option.name;
                                    onChange(fieldKey, current.filter(x => x !== formatted));
                                }}
                            />
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
        <div className="grid gap-8 lg:grid-cols-2">
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
                        <TextInput
                            id="taxNumber"
                            name="taxNumber"
                            value={values.taxNumber}
                            onChange={(event) => onChange('taxNumber', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.taxName}>
                        <TextInput
                            id="taxName"
                            name="taxName"
                            value={values.taxName}
                            onChange={(event) => onChange('taxName', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.taxTkuId}>
                        <TextInput
                            id="taxTkuId"
                            name="taxTkuId"
                            value={values.taxTkuId}
                            onChange={(event) => onChange('taxTkuId', event.target.value)}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
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
            <div className="mb-3 border-b border-ui-border-medium pb-1.5 flex items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-normal text-input-brand">{config.balanceTable.title}</h3>
                <button
                    type="button"
                    className="inline-flex h-[34px] w-[56px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition"
                >
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>
            <EmptyDataTable columns={config.balanceTable.columns} emptyLabel={config.balanceTable.emptyLabel} />
        </div>
    );
}
