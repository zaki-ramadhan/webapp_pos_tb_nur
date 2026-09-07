import React, { useState } from 'react';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';
import LocationPickerModal from './location-picker/LocationPickerModal';

export default function AddressStack({ prefixValue = 'Jalan', values = {}, readOnly = false, layout = 'grid', onChange = null }) {
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const handleSelectCity = (item) => {
        onChange?.('city', item.city);
        onChange?.('province', item.province);
        onChange?.('postalCode', item.postalCode);
        onChange?.('country', item.country);
    };

    const handleLocationConfirm = (selectedAddress) => {
        if (!selectedAddress) return;
        if (selectedAddress.street !== undefined) onChange?.('street', selectedAddress.street);
        if (selectedAddress.city !== undefined) onChange?.('city', selectedAddress.city);
        if (selectedAddress.province !== undefined) onChange?.('province', selectedAddress.province);
        if (selectedAddress.postalCode !== undefined) onChange?.('postalCode', selectedAddress.postalCode);
        if (selectedAddress.country !== undefined) onChange?.('country', selectedAddress.country);
    };

    const initialLocation = values?.lat && values?.lng ? { lat: values.lat, lng: values.lng } : null;

    return (
        <div className="relative">
            <div className="flex items-start gap-2">
                {!readOnly && (
                    <button
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        aria-label="Pilih lokasi di peta digital"
                        className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-slate-400 bg-white text-brand-blue hover:bg-brand-blue/5 hover:border-brand-blue active:bg-slate-100 transition cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    >
                        <svg className="h-5 w-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                )}

                <div className="flex-1 min-w-0 space-y-3">
                    <TextareaField
                        value={values?.street ?? ''}
                        onChange={(event) => onChange?.('street', event.target.value)}
                        readOnly={readOnly}
                        rows={4}
                        prefix={prefixValue}
                        className="rounded-[4px] border-slate-400"
                        prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                        textareaClassName="min-h-[112px] text-xs sm:text-sm text-brand-dark"
                    />

                    <CityAutocompleteInput
                        value={values?.city ?? ''}
                        onChange={(nextValue) => onChange?.('city', nextValue)}
                        onSelectCity={handleSelectCity}
                        prefix="Kota"
                        disabled={readOnly}
                        prefixClassName="min-w-[92px] border-slate-400 bg-input-prefix-bg px-3 text-xs sm:text-sm text-slate-600"
                        dropdownLeftOffsetClassName="left-[92px]"
                    />

                    <TextInput
                        value={values?.postalCode ?? ''}
                        onChange={(event) => onChange?.('postalCode', event.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={10}
                        readOnly={readOnly}
                        prefix="Kode Pos"
                        className="h-[40px] rounded-[4px] border-slate-400 w-full"
                        prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />

                    <TextInput
                        value={values?.province ?? ''}
                        onChange={(event) => onChange?.('province', event.target.value)}
                        readOnly={readOnly}
                        prefix="Provinsi"
                        className="h-[40px] rounded-[4px] border-slate-400"
                        prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />

                    <TextInput
                        value={values?.country ?? ''}
                        onChange={(event) => onChange?.('country', event.target.value)}
                        readOnly={readOnly}
                        prefix="Negara"
                        className="h-[40px] rounded-[4px] border-slate-400"
                        prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-slate-600"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </div>

            {isMapModalOpen && (
                <LocationPickerModal
                    isOpen={isMapModalOpen}
                    onClose={() => setIsMapModalOpen(false)}
                    onConfirm={handleLocationConfirm}
                    initialLocation={initialLocation}
                />
            )}
        </div>
    );
}
