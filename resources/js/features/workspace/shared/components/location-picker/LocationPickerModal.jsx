import React, { useState } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import LeafletLocationPicker from './LeafletLocationPicker';

function MapPinHeaderIcon({ className = 'h-4 w-4 shrink-0 text-white' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

export default function LocationPickerModal({
    isOpen = false,
    onClose,
    onConfirm,
    initialLocation = null,
}) {
    const [selectedAddress, setSelectedAddress] = useState(null);

    const handleConfirm = () => {
        if (!selectedAddress) return;
        onConfirm?.(selectedAddress);
        onClose?.();
    };

    return (
        <WorkspaceDialog
            open={isOpen}
            onClose={onClose}
            title="Pilih Lokasi Alamat"
            headerIcon={MapPinHeaderIcon}
            maxWidthClassName="max-w-[760px]"
            contentClassName="p-4 bg-slate-50 flex flex-col min-h-[360px] overflow-y-auto"
            footerClassName="border-t border-slate-200 bg-white px-4 py-3"
            footer={(
                <div className="flex items-center justify-between w-full">
                    <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                        className="min-w-[70px] rounded-[4px] border-slate-300 text-slate-700 hover:bg-slate-50 shadow-none text-xs sm:text-sm font-medium"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleConfirm}
                        disabled={!selectedAddress}
                        className="min-w-[140px] rounded-[4px] shadow-none text-xs sm:text-sm font-medium"
                    >
                        Gunakan Alamat Ini
                    </Button>
                </div>
            )}
        >
            <div className="flex-1 min-h-[320px]">
                <LeafletLocationPicker
                    onLocationSelected={setSelectedAddress}
                    initialLocation={initialLocation}
                />
            </div>

            {/* Selected Address Preview Card */}
            {selectedAddress && (
                <div className="mt-3 rounded-[4px] border border-slate-300 bg-white p-3.5 shadow-2xs">
                    <div className="border-b border-slate-200 pb-2 mb-2.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">
                            Ringkasan Alamat Terpilih
                        </span>
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
        </WorkspaceDialog>
    );
}
