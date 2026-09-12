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
            className="h-[38px] rounded-[4px] border-ui-border"
            prefixClassName="min-w-[62px] bg-input-prefix-bg px-3 text-xs sm:text-sm text-table-row-text"
            inputClassName="text-xs sm:text-sm text-brand-dark"
        />
    );
}
