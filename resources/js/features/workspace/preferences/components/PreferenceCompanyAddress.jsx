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

    if (!address || !cityField || !provinceField || !postalCodeField || !countryField) {
        return (
            <div className="p-4 text-sm text-chart-text">
                Pengaturan alamat perusahaan belum tersedia.
            </div>
        );
    }

    const handleSelectCity = (item) => {
        onChange?.(cityField.id, item.city);
        onChange?.(provinceField.id, item.province);
        onChange?.(postalCodeField.id, item.postalCode);
        onChange?.(countryField.id, item.country);
    };

    const handleClearCity = () => {
        onChange?.(cityField.id, '');
        onChange?.(provinceField.id, '');
        onChange?.(postalCodeField.id, '');
        onChange?.(countryField.id, '');
    };

    const cityValue = values[cityField.id] !== undefined ? values[cityField.id] : cityField.value;

    return (
        <div className="max-w-[980px]">
            <div className="grid gap-x-6 gap-y-2 lg:grid-cols-[160px_minmax(0,646px)] lg:items-start">
                <label className="pt-1.5 text-xs sm:text-sm text-brand-dark">{address.label}</label>

                <div className="space-y-1.5">
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
                        prefixClassName="min-w-[72px] border-ui-border-medium px-3 py-2 text-xs sm:text-sm text-text-light"
                        className="rounded-[3px] border-ui-border-medium shadow-inset-light"
                        textareaClassName="min-h-[80px] px-3 py-2 text-xs sm:text-sm leading-6 text-brand-dark"
                    />

                    {cityValue ? (
                        <PreferenceAddressTokenField
                            field={cityField}
                            tokens={[{ id: 'city', label: cityValue }]}
                            onClear={handleClearCity}
                        />
                    ) : (
                        <PreferenceCityAutocomplete
                            field={cityField}
                            value={cityValue}
                            onChange={onChange}
                            onSelectCity={handleSelectCity}
                        />
                    )}

                    <div className="grid gap-1.5 md:grid-cols-[minmax(0,1fr)_206px]">
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
