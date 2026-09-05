import CheckboxField from '@/components/ui/CheckboxField';
import { AddressStack } from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';

export default function ShippingTab({ config, values, onChange }) {
    return (
        <div className="max-w-[900px]">
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
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[135px_minmax(0,1fr)] lg:items-start">
                <label className="pt-2 text-xs sm:text-sm text-brand-dark">Alamat pengiriman</label>
                <div className="w-full max-w-[430px]">
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
            </div>
        </div>
    );
}
