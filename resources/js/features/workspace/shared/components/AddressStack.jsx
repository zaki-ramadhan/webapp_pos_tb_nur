import React, { useState, useRef } from 'react';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import GoogleApiKeyModal from './GoogleApiKeyModal';
import {
    STORE_ADDRESS_TB_NUR,
    getCurrentDeviceCoordinates,
    reverseGeocodeCoordinates,
} from '@/features/workspace/shared/locationGeocodingService';
import {
    showLoadingToast,
    updateToastToSuccess,
    updateToastToError,
    showSuccessToast,
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
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
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
        const toastId = showLoadingToast({
            title: 'Mendeteksi Lokasi GPS',
            message: 'Mengambil koordinat GPS presisi tinggi dari perangkat Anda...',
        });

        try {
            const coords = await getCurrentDeviceCoordinates();
            const address = await reverseGeocodeCoordinates(coords.lat, coords.lng);

            if (address) {
                if (address.street) onChange?.('street', address.street);
                if (address.city) onChange?.('city', address.city);
                if (address.province) onChange?.('province', address.province);
                if (address.postalCode) onChange?.('postalCode', address.postalCode);
                if (address.country) onChange?.('country', address.country);

                updateToastToSuccess(toastId, {
                    title: 'Lokasi Berhasil Diterapkan',
                    message: `${address.street}, ${address.city} (${address.postalCode})`,
                });
            } else {
                dismissToast(toastId);
            }
        } catch (err) {
            updateToastToError(toastId, {
                title: 'Deteksi Lokasi Gagal',
                message: err.message || 'Tidak dapat mendeteksi alamat lokasi perangkat.',
            });
        } finally {
            setIsLocating(false);
        }
    };

    const handleUseStoreAddress = () => {
        setIsDropdownOpen(false);
        onChange?.('street', STORE_ADDRESS_TB_NUR.street);
        onChange?.('city', STORE_ADDRESS_TB_NUR.city);
        onChange?.('province', STORE_ADDRESS_TB_NUR.province);
        onChange?.('postalCode', STORE_ADDRESS_TB_NUR.postalCode);
        onChange?.('country', STORE_ADDRESS_TB_NUR.country);

        showSuccessToast({
            title: 'Alamat Toko Diterapkan',
            message: 'Alamat resmi TB Nur berhasil diisikan ke form.',
        });
    };

    const handleClearAddress = () => {
        setIsDropdownOpen(false);
        onChange?.('street', '');
        onChange?.('city', '');
        onChange?.('province', '');
        onChange?.('postalCode', '');
        onChange?.('country', '');
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
                        className="inline-flex h-[40px] shrink-0 items-center justify-center rounded-[4px] border border-slate-400 bg-white text-brand-blue hover:bg-brand-blue/5 hover:border-brand-blue active:bg-slate-100 transition cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 overflow-hidden"
                    >
                        <span className="inline-flex items-center justify-center px-2">
                            {isLocating ? (
                                <svg className="h-5 w-5 animate-spin text-brand-blue" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </span>
                        <span className="inline-flex items-center justify-center border-l border-slate-300 px-1 text-slate-500">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
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
                widthClassName="w-[280px]"
            >
                <div className="flex flex-col py-1">
                    <DropdownMenuItem
                        icon={
                            <svg className="h-4 w-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        onClick={handleGetCurrentLocation}
                    >
                        <div className="flex flex-col text-left">
                            <span className="font-medium text-slate-800">Alamat Lokasi Saya</span>
                            <span className="text-[11px] text-slate-500">Deteksi GPS perangkat & isi otomatis</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        icon={
                            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        }
                        onClick={handleUseStoreAddress}
                    >
                        <div className="flex flex-col text-left">
                            <span className="font-medium text-slate-800">Alamat Toko TB Nur</span>
                            <span className="text-[11px] text-slate-500">Guwa Kidul, Kaliwedi, Cirebon</span>
                        </div>
                    </DropdownMenuItem>

                    <div className="my-1 border-t border-slate-150" />

                    <DropdownMenuItem
                        icon={
                            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        }
                        onClick={() => {
                            setIsDropdownOpen(false);
                            setIsApiKeyModalOpen(true);
                        }}
                    >
                        <div className="flex flex-col text-left">
                            <span className="text-slate-700">Atur Google Maps API Key</span>
                            <span className="text-[11px] text-slate-400">Untuk deteksi dusun & RT/RW resmi</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        icon={
                            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        }
                        onClick={handleClearAddress}
                    >
                        <div className="flex flex-col text-left">
                            <span className="text-red-600">Kosongkan Alamat</span>
                            <span className="text-[11px] text-slate-400">Hapus isian seluruh kolom alamat</span>
                        </div>
                    </DropdownMenuItem>
                </div>
            </DropdownMenu>

            {isApiKeyModalOpen && (
                <GoogleApiKeyModal
                    isOpen={isApiKeyModalOpen}
                    onClose={() => setIsApiKeyModalOpen(false)}
                />
            )}
        </div>
    );
}
