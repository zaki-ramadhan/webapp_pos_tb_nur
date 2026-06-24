import { useMemo, useState } from 'react';
import TextInput from '@/components/ui/TextInput';
import { CloseIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { LookupDropdownSurface } from '@/features/workspace/shared/LookupPrimitives';

export default function PreferenceLookupAutocomplete({ field, value, onChange, options = [] }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);

    const filteredOptions = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return options;
        }
        return options.filter(option => option.toLowerCase().includes(normalized));
    }, [query, options]);

    const handleSelect = (option) => {
        onChange?.(field.id, option);
        setQuery('');
        setOpen(false);
    };

    const handleClear = () => {
        onChange?.(field.id, '');
        setQuery('');
        setOpen(false);
    };

    if (value) {
        return (
            <div className="flex h-[36px] w-full max-w-[480px] items-center gap-2 rounded-[3px] border border-ui-border-medium bg-ui-bg-panel-lighter px-2.5 shadow-inset-light">
                <span className="inline-flex items-center gap-2 rounded-[4px] border border-border-chip-blue bg-bg-chip-blue px-2.5 py-1 text-sm font-medium text-text-chip-blue-dark">
                    <span>{value}</span>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="inline-flex h-4 w-4 items-center justify-center text-text-chip-blue-dark hover:text-blue-133663"
                        aria-label={`Hapus ${value}`}
                    >
                        <CloseIcon className="h-3 w-3" />
                    </button>
                </span>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-[480px]">
            <TextInput
                id={field.id}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={field.placeholder ?? `Cari/Pilih ${field.label}...`}
                disabled={field.disabled}
                error={field.error}
                message={field.message}
                trailing={<SearchIcon className="h-5 w-5 text-text-trailing-label" />}
                className="h-[34px] rounded-[3px] border-ui-border"
                inputClassName="text-xs sm:text-sm"
            />
            {open && (
                <LookupDropdownSurface
                    onClose={() => setOpen(false)}
                    maxHeightLimit={220}
                    className="border-tab-view-active-border-x shadow-lg rounded-[4px]"
                >
                    <div className="overflow-y-auto w-full flex-1 min-h-0">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className="flex w-full items-start px-3 py-2 text-left text-xs sm:text-sm text-text-workspace-dark hover:bg-info-bg border-b border-border-row-subtle last:border-b-0"
                                >
                                    {option}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-4 text-center text-sm text-slate-400">
                                Tidak ada hasil yang cocok.
                            </div>
                        )}
                    </div>
                </LookupDropdownSurface>
            )}
        </div>
    );
}
