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
            <div className="p-5 text-[16px] text-[#65708a]">
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

    return (
        <div className="max-w-[980px]">
            <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[190px_minmax(0,646px)] lg:items-start">
                <label className="pt-3 text-[16px] text-[#1f2436]">{address.label}</label>

                <div className="space-y-3">
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
                        prefixClassName="min-w-[72px] border-[#d8dde7] px-3 py-3 text-[15px] text-[#7b8597]"
                        className="rounded-[3px] border-[#d8dde7] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                        textareaClassName="min-h-[96px] px-3 py-2.5 text-[15px] leading-6 text-[#1f2436]"
                    />

                    <PreferenceAddressTokenField tokens={address.tokens} />

                    <PreferenceCityAutocomplete
                        field={cityField}
                        value={values[cityField.id]}
                        onChange={onChange}
                        onSelectCity={handleSelectCity}
                    />

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_206px]">
                        <PreferenceAddressTextField
                            field={provinceField}
                            value={values[provinceField.id]}
                            onChange={onChange}
                            readOnly
                        />
                        <PreferenceAddressTextField
                            field={postalCodeField}
                            value={values[postalCodeField.id]}
                            onChange={onChange}
                            readOnly
                        />
                    </div>

                    <PreferenceAddressTextField
                        field={countryField}
                        value={values[countryField.id]}
                        onChange={onChange}
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
}
