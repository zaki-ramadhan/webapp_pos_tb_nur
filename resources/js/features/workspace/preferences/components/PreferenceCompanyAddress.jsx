import AddressStack from '@/features/workspace/shared/components/AddressStack';

export default function PreferenceCompanyAddress({ address, values, onChange }) {
    const addressFields = address?.fields?.reduce((result, field) => {
        result[field.id] = field;
        return result;
    }, {});
    const cityField = addressFields?.city;
    const provinceField = addressFields?.province;
    const postalCodeField = addressFields?.['postal-code'];
    const countryField = addressFields?.country;

    if (!address || !cityField || !provinceField || !postalCodeField || !countryField) {
        return (
            <div className="p-4 text-sm text-chart-text">
                Pengaturan alamat toko belum tersedia.
            </div>
        );
    }

    const handleAddressChange = (field, nextValue) => {
        const fieldMap = {
            street: address.street?.id ?? 'street',
            city: cityField.id,
            postalCode: postalCodeField.id,
            province: provinceField.id,
            country: countryField.id,
        };
        const targetId = fieldMap[field];
        if (targetId) {
            onChange?.(targetId, nextValue);
        }
    };

    return (
        <div className="max-w-[580px]">
            <div className="grid gap-x-6 gap-y-3 grid-cols-[130px_minmax(0,1fr)] items-start">
                <label className="pt-2 text-xs sm:text-sm text-brand-dark">{address.label}</label>

                <div className="w-full max-w-[430px]">
                    <AddressStack
                        prefixValue={address.street?.label ?? 'Jalan'}
                        layout="grid"
                        values={{
                            street: values[address.street?.id] ?? address.street?.value ?? '',
                            city: values[cityField.id] ?? cityField.value ?? '',
                            postalCode: values[postalCodeField.id] ?? postalCodeField.value ?? '',
                            province: values[provinceField.id] ?? provinceField.value ?? '',
                            country: values[countryField.id] ?? countryField.value ?? '',
                        }}
                        onChange={handleAddressChange}
                    />
                </div>
            </div>
        </div>
    );
}
