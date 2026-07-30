import { useState } from 'react';
import TextareaField from '@/components/ui/TextareaField';
import PreferenceAddressTokenField from './PreferenceAddressTokenField';
import PreferenceCityAutocomplete from './PreferenceCityAutocomplete';
import PreferenceAddressTextField from './PreferenceAddressTextField';

export default function PreferenceCompanyAddress({ address, values, onChange }) {
    const addressFields = address?.fields?.reduce((result, field) => {
        result[field.id] = field;
        return result;
    }, {});
    const cityField = addressFields?.city;
    const provinceField = addressFields?.province;
    const postalCodeField = addressFields?.['postal-code'];
    const countryField = addressFields?.country;

    const cityValue = values[cityField?.id] !== undefined ? values[cityField?.id] : cityField?.value;
    const [isEditingCity, setIsEditingCity] = useState(() => !cityValue);

    if (!address || !cityField || !provinceField || !postalCodeField || !countryField) {
        return (
            <div className="p-4 text-sm text-chart-text">
                Pengaturan alamat toko belum tersedia.
            </div>
        );
    }

    const handleSelectCity = (item) => {
        onChange?.(cityField.id, item.city);
        onChange?.(provinceField.id, item.province);
        onChange?.(postalCodeField.id, item.postalCode);
        onChange?.(countryField.id, item.country);
        setIsEditingCity(false);
    };

    const handleClearCity = () => {
        onChange?.(cityField.id, '');
        onChange?.(provinceField.id, '');
        onChange?.(postalCodeField.id, '');
        onChange?.(countryField.id, '');
        setIsEditingCity(true);
    };

    return (
        <div className="max-w-[580px]">
            <div className="grid gap-x-6 gap-y-3 grid-cols-[130px_minmax(0,1fr)] items-start">
                <label className="pt-2 text-xs sm:text-sm text-brand-dark">{address.label}</label>

                <div className="space-y-2.5">
                    <TextareaField
                        id={address.street?.id}
                        value={values[address.street?.id] ?? address.street?.value}
                        onChange={(e) => onChange?.(address.street?.id, e.target.value)}
                        placeholder={address.street?.placeholder}
                        disabled={address.street?.disabled}
                        error={address.street?.error}
                        message={address.street?.message}
                        prefix={address.street?.label}
                        rows={3}
                        prefixClassName="min-w-[62px] border-ui-border bg-input-prefix-bg px-3 py-2 text-xs sm:text-sm text-input-prefix-text"
                        className="rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[80px] px-3 py-2 text-xs sm:text-sm leading-6 text-brand-dark"
                    />

                    {!isEditingCity && cityValue ? (
                        <PreferenceAddressTokenField
                            field={cityField}
                            tokens={[{ id: 'city', label: cityValue }]}
                            onClear={handleClearCity}
                        />
                    ) : (
                        <PreferenceCityAutocomplete
                            field={cityField}
                            value={cityValue}
                            onChange={(nextVal) => onChange?.(cityField.id, nextVal)}
                            onSelectCity={handleSelectCity}
                        />
                    )}

                    <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-[minmax(0,1fr)_160px]">
                        <PreferenceAddressTextField
                            field={provinceField}
                            value={values[provinceField.id]}
                            onChange={onChange}
                        />
                        <PreferenceAddressTextField
                            field={postalCodeField}
                            value={values[postalCodeField.id]}
                            onChange={onChange}
                        />
                    </div>

                    <PreferenceAddressTextField
                        field={countryField}
                        value={values[countryField.id]}
                        onChange={onChange}
                    />
                </div>
            </div>
        </div>
    );
}
