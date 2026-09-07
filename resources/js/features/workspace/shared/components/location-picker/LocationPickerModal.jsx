import React, { useState } from 'react';
import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon } from '@/features/workspace/shared/Icons';
import LeafletLocationPicker from './LeafletLocationPicker';
import GoogleMapsLocationPicker from './GoogleMapsLocationPicker';

export default function LocationPickerModal({
    isOpen = false,
    onClose,
    onConfirm,
    initialLocation = null,
}) {
    const [provider, setProvider] = useState('osm'); // 'osm' | 'google'
    const [selectedAddress, setSelectedAddress] = useState(null);

    const handleConfirm = () => {
        if (!selectedAddress) return;
        onConfirm?.(selectedAddress);
        onClose?.();
    };

    return (
        <ModalBase
            open={isOpen}
            isOpen={isOpen}
            onBackdropClick={onClose}
            className="bg-black/50 backdrop-blur-xs"
            panelClassName="max-w-[760px] w-full p-0 overflow-hidden rounded-[6px] shadow-2xl flex flex-col max-h-[90vh]"
        >
            {/* Header */}
            <div className="bg-[#0A2A55] px-4 py-2.5 text-white shrink-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                            <h2 className="text-sm font-semibold text-white">Tentukan Lokasi Alamat di Peta</h2>
                            <p className="text-[11px] text-slate-300">Pilih titik lokasi atau cari nama tempat untuk mengisi otomatis form alamat</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-white hover:text-[#A20025] hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Tutup"
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Provider Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-1.5 shrink-0 text-xs">
                <span className="font-medium text-slate-600">Pilih Layanan Peta:</span>
                <div className="flex rounded-[4px] border border-slate-300 bg-white p-0.5 shadow-2xs">
                    <button
                        type="button"
                        onClick={() => setProvider('osm')}
                        className={`px-3 py-1 rounded-[3px] font-medium transition cursor-pointer ${
                            provider === 'osm'
                                ? 'bg-brand-blue text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        OpenStreetMap (Gratis)
                    </button>
                    <button
                        type="button"
                        onClick={() => setProvider('google')}
                        className={`px-3 py-1 rounded-[3px] font-medium transition cursor-pointer ${
                            provider === 'google'
                                ? 'bg-brand-blue text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        Google Maps (Official)
                    </button>
                </div>
            </div>

            {/* Modal Body: Map & Search */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-[360px] bg-slate-50">
                <div className="flex-1 min-h-[320px]">
                    {provider === 'osm' ? (
                        <LeafletLocationPicker
                            onLocationSelected={setSelectedAddress}
                            initialLocation={initialLocation}
                        />
                    ) : (
                        <GoogleMapsLocationPicker
                            onLocationSelected={setSelectedAddress}
                            initialLocation={initialLocation}
                        />
                    )}
                </div>

                {/* Selected Address Preview Card */}
                {selectedAddress && (
                    <div className="mt-3 rounded-[4px] border border-slate-300 bg-white p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2.5">
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                                Ringkasan Alamat Terpilih
                            </span>
                            {selectedAddress.lat && selectedAddress.lng ? (
                                <span className="text-xs text-slate-500 font-mono">
                                    {selectedAddress.lat.toFixed(5)}, {selectedAddress.lng.toFixed(5)}
                                </span>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Jalan</span>
                                <span className="text-slate-900 font-medium">{selectedAddress.street || '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Kota / Kabupaten</span>
                                <span className="text-slate-900 font-medium">{selectedAddress.city || '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Provinsi</span>
                                <span className="text-slate-900 font-medium">{selectedAddress.province || '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Kode Pos</span>
                                <span className="text-slate-900 font-medium">{selectedAddress.postalCode || '-'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-3 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-9 items-center justify-center rounded-[4px] border border-slate-300 bg-white px-4 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                >
                    Batal
                </button>
                <button
                    type="button"
                    disabled={!selectedAddress}
                    onClick={handleConfirm}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-brand-blue bg-brand-blue px-4 text-xs sm:text-sm font-medium text-white hover:bg-brand-blue-hover disabled:opacity-50 cursor-pointer shadow-button-primary transition"
                >
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Gunakan Alamat Ini
                </button>
            </div>
        </ModalBase>
    );
}
