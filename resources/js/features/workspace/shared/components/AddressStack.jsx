import React, { useState, useRef } from 'react';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDownIcon } from '@/features/workspace/shared/Icons';
import {
    getCurrentDeviceCoordinates,
    reverseGeocodeCoordinates,
} from '@/features/workspace/shared/locationGeocodingService';
import {
    showLoadingToast,
    updateToastToSuccess,
    updateToastToError,
    showErrorToast,
    dismissToast,
} from '@/components/feedback/toast';

export default function AddressStack({
    prefixValue = 'Jalan',
    values = {},
    readOnly = false,
    layout = 'grid',
    onChange = null,
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const buttonRef = useRef(null);

    const handleSelectCity = (item) => {
        onChange?.('city', item.city);
        onChange?.('province', item.province);
        onChange?.('postalCode', item.postalCode);
        onChange?.('country', item.country);
    };

    const handleGetCurrentLocation = async () => {
        setIsDropdownOpen(false);
        setIsLocating(true);
        let toastId = null;

        try {
            toastId = showLoadingToast({
                title: 'Mendeteksi Lokasi',
                message: 'Meminta koordinat GPS perangkat...',
            });

            const coords = await getCurrentDeviceCoordinates();

            updateToastToSuccess(toastId, {
                title: 'Mencari Alamat',
                message: 'Mengidentifikasi detail alamat...',
            });

            const address = await reverseGeocodeCoordinates(coords.lat, coords.lng);

            if (address) {
                if (address.street) onChange?.('street', address.street);
                if (address.city) onChange?.('city', address.city);
                if (address.province) onChange?.('province', address.province);
                if (address.postalCode) onChange?.('postalCode', address.postalCode);
                if (address.country) onChange?.('country', address.country);

                updateToastToSuccess(toastId, {
                    title: 'Lokasi Diterapkan',
                    message: `${address.street}, ${address.city} (${address.postalCode})`,
                });
            } else {
                dismissToast(toastId);
            }
        } catch (err) {
            if (toastId) {
                updateToastToError(toastId, {
                    title: 'Akses Lokasi Gagal',
                    message: err.message || 'Tidak dapat mendeteksi lokasi GPS.',
                });
            } else {
                showErrorToast({
                    title: 'Akses Lokasi Gagal',
                    message: err.message || 'Tidak dapat mendeteksi lokasi GPS.',
                });
            }
        } finally {
            setIsLocating(false);
        }
    };

    return (
        <div className="relative">
            <div className="flex items-start gap-2">
                {!readOnly && (
                    <button
                        ref={buttonRef}
                        type="button"
                        disabled={isLocating}
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        aria-label="Pilihan Alamat & Lokasi"
                        className="inline-flex h-[40px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-2 text-brand-blue-accent transition hover:bg-brand-blue-lightest active:bg-brand-blue-light disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    >
                        {isLocating ? (
                            <svg className="h-[18px] w-[18px] animate-spin text-brand-blue-accent" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="h-[18px] w-[18px] text-brand-blue-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                        <ChevronDownIcon
                            className={`h-3.5 w-3.5 text-brand-blue-accent transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
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

            <DropdownMenu
                open={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                anchorRef={buttonRef}
                align="start"
                side="bottom"
                widthClassName="w-[170px]"
            >
                <DropdownMenuItem onClick={handleGetCurrentLocation}>
                    Alamat lokasi saya
                </DropdownMenuItem>
            </DropdownMenu>
        </div>
    );
}
