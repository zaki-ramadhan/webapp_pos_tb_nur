import React, { useState, useEffect } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import { getGoogleMapsApiKey, setGoogleMapsApiKey } from '@/features/workspace/shared/locationGeocodingService';
import { showSuccessToast, showInfoToast } from '@/components/feedback/toast';

export default function GoogleApiKeyModal({ isOpen, onClose }) {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        if (isOpen) {
            setApiKey(getGoogleMapsApiKey());
        }
    }, [isOpen]);

    const handleSave = () => {
        const trimmed = apiKey.trim();
        setGoogleMapsApiKey(trimmed);
        if (trimmed) {
            showSuccessToast({
                title: 'Google Maps API Key Tersimpan',
                message: 'Pencarian geocoding berikutnya akan memanfaatkan Google Maps Geocoding resmi.',
            });
        } else {
            showInfoToast({
                title: 'Google Maps API Key Dikosongkan',
                message: 'Sistem akan otomatis menggunakan Smart Geocoder multi-sumber gratis bawaan.',
            });
        }
        onClose();
    };

    return (
        <WorkspaceDialog
            open={isOpen}
            onClose={onClose}
            title="Pengaturan Google Maps API Key"
            maxWidthClassName="max-w-md"
            footer={
                <div className="flex items-center justify-end gap-2 w-full">
                    <Button variant="secondary" onClick={onClose} size="sm">
                        Batal
                    </Button>
                    <Button variant="primary" onClick={handleSave} size="sm">
                        Simpan
                    </Button>
                </div>
            }
        >
            <div className="p-4 space-y-4 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed">
                    Google Maps Geocoding API memberikan data RT/RW, nama dusun/blok, dan jalan secara lebih detail.
                    Jika dikosongkan, TB Nur akan otomatis menggunakan Smart Geocoder multi-sumber (BigDataCloud, OSM, dan Database Kodepos resmi) tanpa biaya.
                </p>

                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                        Google Maps API Key
                    </label>
                    <TextInput
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full h-[40px] rounded-[4px] border-slate-400"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                    <p className="text-[11px] text-slate-500">
                        API Key disimpan secara aman di peramban lokal perangkat ini.
                    </p>
                </div>
            </div>
        </WorkspaceDialog>
    );
}
