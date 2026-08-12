import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import {
    AddressStack,
    CloseIcon,
    FormFieldRow,
    SectionHeading,
    TextInput,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';

export default function GeneralTab({ config, values, isDetail, onChange }) {
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

                    {(config.type ?? config.partnerType) !== 'customer' && (
                        <FormFieldRow label={config.labels.category}>
                            <BackendLookupField
                                resource="supplier-categories"
                                values={(values.category || []).map(name => typeof name === 'string' ? { name } : name)}
                                placeholder={config.lookupPlaceholders?.category}
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
                    )}

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
                            layout="grid"
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
