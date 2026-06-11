import { useEffect, useMemo, useRef, useState } from 'react';
import TextInput from '@/components/ui/TextInput';
import { INDONESIAN_CITIES } from '@/features/workspace/shared/indonesianCities';

export default function CityAutocompleteInput({
    id,
    value = '',
    onChange,
    onSelectCity,
    prefix = 'Kota',
    placeholder = 'Cari Kota / Kabupaten...',
    disabled = false,
    error,
    message,
    className = 'h-[40px] rounded-[4px] border-[#cfd6e2]',
    prefixClassName = 'min-w-[62px] border-[#cfd6e2] bg-[#f3f3f4] px-3 text-[14px] text-[#8b94a7]',
    inputClassName = 'text-[15px] text-[#1f2436]',
    dropdownLeftOffsetClassName = 'left-[62px]',
}) {
    const [query, setQuery] = useState(value ?? '');
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setQuery(value ?? '');
    }, [value]);

    useEffect(() => {
        function handleOutsideClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery(value ?? '');
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [value]);

    const filteredOptions = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return INDONESIAN_CITIES.slice(0, 50);
        }
        return INDONESIAN_CITIES
            .filter(
                (item) =>
                    item.city.toLowerCase().includes(normalized) ||
                    item.province.toLowerCase().includes(normalized)
            )
            .slice(0, 50);
    }, [query]);

    const handleSelect = (item) => {
        onSelectCity(item);
        setOpen(false);
    };

    const highlightText = (text, highlight) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <mark key={i} className="bg-yellow-200 text-black p-0">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <TextInput
                id={id}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    onChange?.(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                error={error}
                message={message}
                prefix={prefix}
                prefixClassName={prefixClassName}
                className={className}
                inputClassName={inputClassName}
                autoComplete="off"
            />
            {open && (
                <div className={`absolute right-0 z-50 mt-1 max-h-[220px] overflow-y-auto rounded-md border border-[#cad1dd] bg-white shadow-lg ${dropdownLeftOffsetClassName}`}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="flex w-full flex-col px-4 py-2 text-left hover:bg-[#eef5ff] border-b border-[#f0f4f9] last:border-b-0"
                            >
                                <span className="text-[14px] md:text-[15px] font-medium text-[#131a28]">
                                    {highlightText(item.city, query)}
                                </span>
                                <span className="text-[12px] text-[#7b8597]">
                                    {highlightText(item.province, query)}
                                </span>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-4 text-center text-[14px] text-slate-400">
                            Tidak ada hasil yang cocok.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
