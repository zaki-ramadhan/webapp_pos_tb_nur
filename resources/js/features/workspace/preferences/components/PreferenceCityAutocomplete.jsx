import { useEffect, useMemo, useRef, useState } from 'react';
import TextInput from '@/components/ui/TextInput';

const INDONESIAN_CITIES = [
    { city: 'Kab. Badung', province: 'Bali', postalCode: '80361', country: 'Indonesia' },
    { city: 'Kab. Bangli', province: 'Bali', postalCode: '80611', country: 'Indonesia' },
    { city: 'Kab. Tabanan', province: 'Bali', postalCode: '82111', country: 'Indonesia' },
    { city: 'Kab. Bangka', province: 'Bangka Belitung', postalCode: '33211', country: 'Indonesia' },
    { city: 'Kab. Bandung', province: 'Jawa Barat', postalCode: '40391', country: 'Indonesia' },
    { city: 'Kota Bandung', province: 'Jawa Barat', postalCode: '40111', country: 'Indonesia' },
    { city: 'Kota Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12110', country: 'Indonesia' },
    { city: 'Kota Surabaya', province: 'Jawa Timur', postalCode: '60111', country: 'Indonesia' },
    { city: 'Kota Denpasar', province: 'Bali', postalCode: '80111', country: 'Indonesia' },
];

export default function PreferenceCityAutocomplete({ field, value, onChange, onSelectCity }) {
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
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const filteredOptions = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return INDONESIAN_CITIES;
        }
        return INDONESIAN_CITIES.filter(
            item =>
                item.city.toLowerCase().includes(normalized) ||
                item.province.toLowerCase().includes(normalized)
        );
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
                        <mark key={i} className="bg-yellow-200 text-black p-0">{part}</mark>
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
                id={field.id}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    onChange?.(field.id, e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={field.placeholder ?? "Cari Kota / Kabupaten..."}
                disabled={field.disabled}
                error={field.error}
                message={field.message}
                prefix={field.label}
                prefixClassName="min-w-[62px] border-[#d8dde7] px-3 text-[15px] text-[#7b8597]"
                className="h-[34px] rounded-[3px] border-[#d8dde7] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                inputClassName="text-[15px] text-[#1f2436]"
            />
            {open && (
                <div className="absolute left-[62px] right-0 z-50 mt-1 max-h-[220px] overflow-y-auto rounded-md border border-[#cad1dd] bg-white shadow-lg">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-[#eef5ff] border-b border-[#f0f4f9] last:border-b-0"
                            >
                                <span className="text-[15px] font-medium text-[#131a28]">
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
