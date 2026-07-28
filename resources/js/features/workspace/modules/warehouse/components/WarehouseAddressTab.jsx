import TextareaField from '@/components/ui/TextareaField';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';
import { ClearableTextInput, WarehouseFieldRow } from './warehouseHelpers';

export default function WarehouseAddressTab({ config, values, onChange }) {
    const handleSelectCity = (item) => {
        onChange('city', item.city);
        onChange('province', item.province);
        onChange('postalCode', item.postalCode);
        onChange('country', item.country);
    };

    return (
        <div className="space-y-3 max-w-[980px]">
            <WarehouseFieldRow label="Jalan">
                <div className="lg:max-w-[50%] w-full">
                    <TextareaField
                        value={values.street}
                        onChange={(event) => onChange('street', event.target.value)}
                        rows={3}
                        className="rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[80px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label="Kota / K.Pos">
                <div className="lg:max-w-[50%] w-full grid gap-3 grid-cols-[1fr_120px]">
                    <CityAutocompleteInput
                        value={values.city}
                        onChange={(nextValue) => onChange('city', nextValue)}
                        onSelectCity={handleSelectCity}
                        prefix=""
                        placeholder="Cari Kota / Kabupaten..."
                    />
                    <ClearableTextInput
                        placeholder="K. Pos"
                        value={values.postalCode}
                        onChange={(event) => onChange('postalCode', event.target.value)}
                    />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label="Provinsi">
                <div className="lg:max-w-[50%] w-full">
                    <ClearableTextInput
                        value={values.province}
                        onChange={(event) => onChange('province', event.target.value)}
                    />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label="Negara">
                <div className="lg:max-w-[50%] w-full">
                    <ClearableTextInput
                        value={values.country}
                        onChange={(event) => onChange('country', event.target.value)}
                    />
                </div>
            </WarehouseFieldRow>
        </div>
    );
}
