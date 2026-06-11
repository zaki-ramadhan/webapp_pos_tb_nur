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
            className="h-[34px] rounded-[3px] border-[#d8dde7] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
            prefixClassName="min-w-[62px] border-[#d8dde7] px-3 text-[14px] md:text-[15px] text-[#7b8597]"
            inputClassName="text-[14px] md:text-[15px] text-[#1f2436]"
        />
    );
}
