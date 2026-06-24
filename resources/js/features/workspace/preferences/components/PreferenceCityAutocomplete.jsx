import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';

export default function PreferenceCityAutocomplete({ field, value, onChange, onSelectCity }) {
    return (
        <CityAutocompleteInput
            id={field.id}
            value={value}
            onChange={(nextValue) => onChange?.(field.id, nextValue)}
            onSelectCity={onSelectCity}
            prefix={field.label}
            placeholder={field.placeholder ?? 'Cari Kota / Kabupaten...'}
            disabled={field.disabled}
            error={field.error}
            message={field.message}
            className="h-[34px] rounded-[3px] border-ui-border-medium shadow-inset-light"
            prefixClassName="min-w-[62px] border-ui-border-medium px-3 text-xs sm:text-sm text-blue-7c839b"
            inputClassName="text-xs sm:text-sm text-brand-dark"
        />
    );
}
