import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { parseGooglePlaceAddress } from './locationAddressParser';

export default function GoogleMapsLocationPicker({ onLocationSelected, initialLocation = null }) {
    const mapContainerRef = useRef(null);
    const autocompleteInputRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const geocoderRef = useRef(null);

    const [apiKey, setApiKey] = useState(() => {
        return (
            import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
            localStorage.getItem('pos_google_maps_api_key') ||
            ''
        );
    });
    const [tempKeyInput, setTempKeyInput] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [geocoding, setGeocoding] = useState(false);
    const [currentCoord, setCurrentCoord] = useState(null);

    const defaultLat = initialLocation?.lat || -6.5971;
    const defaultLng = initialLocation?.lng || 106.8060;

    const reverseGeocode = useCallback((lat, lng) => {
        if (!geocoderRef.current) return;
        setGeocoding(true);
        geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
            setGeocoding(false);
            if (status === 'OK' && results?.[0]) {
                const parsed = parseGooglePlaceAddress(results[0]);
                if (parsed) {
                    onLocationSelected(parsed);
                }
            }
        });
    }, [onLocationSelected]);

    const initMap = useCallback(() => {
        if (!mapContainerRef.current || !window.google?.maps) return;

        const map = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: defaultLat, lng: defaultLng },
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        const marker = new window.google.maps.Marker({
            position: { lat: defaultLat, lng: defaultLng },
            map,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
        });

        geocoderRef.current = new window.google.maps.Geocoder();
        markerRef.current = marker;
        mapInstanceRef.current = map;
        setCurrentCoord({ lat: defaultLat, lng: defaultLng });

        // Marker dragend
        marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            const lat = pos.lat();
            const lng = pos.lng();
            setCurrentCoord({ lat, lng });
            reverseGeocode(lat, lng);
        });

        // Map click
        map.addListener('click', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            marker.setPosition({ lat, lng });
            setCurrentCoord({ lat, lng });
            reverseGeocode(lat, lng);
        });

        // Setup Autocomplete on input if available
        if (autocompleteInputRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
                componentRestrictions: { country: 'id' },
                fields: ['address_components', 'geometry', 'name', 'formatted_address'],
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.geometry?.location) return;

                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                map.setCenter({ lat, lng });
                map.setZoom(16);
                marker.setPosition({ lat, lng });
                setCurrentCoord({ lat, lng });

                const parsed = parseGooglePlaceAddress(place);
                if (parsed) {
                    onLocationSelected(parsed);
                }
            });
        }

        reverseGeocode(defaultLat, defaultLng);
    }, [defaultLat, defaultLng, reverseGeocode, onLocationSelected]);

    useEffect(() => {
        if (!apiKey) {
            setIsLoaded(false);
            return;
        }

        const loader = new Loader({
            apiKey,
            version: 'weekly',
            libraries: ['places'],
        });

        setLoadError('');
        loader
            .load()
            .then(() => {
                setIsLoaded(true);
                initMap();
            })
            .catch((err) => {
                setLoadError(err.message || 'Gagal memuat Google Maps. Periksa validitas API Key.');
                setIsLoaded(false);
            });
    }, [apiKey, initMap]);

    const handleSaveApiKey = (e) => {
        e.preventDefault();
        const trimmed = tempKeyInput.trim();
        if (trimmed) {
            localStorage.setItem('pos_google_maps_api_key', trimmed);
            setApiKey(trimmed);
        }
    };

    const handleResetApiKey = () => {
        localStorage.removeItem('pos_google_maps_api_key');
        setApiKey('');
        setTempKeyInput('');
        setIsLoaded(false);
    };

    if (!apiKey) {
        return (
            <div className="flex h-full flex-col items-center justify-center rounded-[4px] border border-slate-300 bg-slate-50 p-6 text-center">
                <div className="max-w-[460px] space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h4 className="text-base font-semibold text-slate-800">Aktifkan Google Maps Place Picker</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Google Maps memerlukan API Key aktif dengan layanan <strong>Maps JavaScript API</strong>, <strong>Places API</strong>, dan <strong>Geocoding API</strong>.
                    </p>

                    <form onSubmit={handleSaveApiKey} className="space-y-2 pt-2">
                        <input
                            type="text"
                            value={tempKeyInput}
                            onChange={(e) => setTempKeyInput(e.target.value)}
                            placeholder="Tempel Google Maps API Key di sini (AIza...)"
                            className="h-[38px] w-full rounded-[4px] border border-slate-300 bg-white px-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-blue focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!tempKeyInput.trim()}
                            className="inline-flex h-[36px] w-full items-center justify-center rounded-[4px] border border-brand-blue bg-brand-blue px-4 text-xs sm:text-sm font-medium text-white hover:bg-brand-blue-hover disabled:opacity-50 cursor-pointer transition"
                        >
                            Simpan & Muat Google Maps
                        </button>
                    </form>

                    <p className="text-[11px] text-slate-500 pt-1">
                        Atau pilih tab <strong>OpenStreetMap</strong> di atas untuk langsung menggunakan peta gratis tanpa API Key.
                    </p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex h-full flex-col items-center justify-center rounded-[4px] border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm font-semibold text-red-700">Terjadi Kesalahan Memuat Google Maps</p>
                <p className="mt-1 text-xs text-red-600 max-w-[400px]">{loadError}</p>
                <button
                    type="button"
                    onClick={handleResetApiKey}
                    className="mt-4 inline-flex h-[34px] items-center justify-center rounded-[4px] border border-slate-300 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                    Ganti API Key
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex h-full flex-col">
            {/* Search Box */}
            <div className="relative z-[500] mb-2 flex items-center gap-2">
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        ref={autocompleteInputRef}
                        type="text"
                        placeholder="Ketik nama tempat/toko di Google Places..."
                        className="h-[38px] w-full rounded-[4px] border border-slate-300 bg-white pl-9 pr-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-blue focus:outline-none shadow-2xs"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleResetApiKey}
                    className="inline-flex h-[38px] shrink-0 items-center justify-center rounded-[4px] border border-slate-300 bg-white px-3 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                    aria-label="Ganti Google Maps API Key"
                >
                    Ganti Key
                </button>
            </div>

            {/* Map Canvas */}
            <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-[4px] border border-slate-300">
                <div ref={mapContainerRef} className="h-full w-full min-h-[300px]" />

                {geocoding && (
                    <div className="absolute bottom-2 left-2 z-[500] flex items-center gap-1.5 rounded bg-white/90 px-2.5 py-1 text-xs text-slate-600 shadow-sm border border-slate-200">
                        <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
                        Mengambil detail alamat...
                    </div>
                )}

                {currentCoord && (
                    <div className="absolute bottom-2 right-2 z-[500] rounded bg-white/90 px-2 py-0.5 text-[10px] text-slate-500 shadow-sm border border-slate-200">
                        {currentCoord.lat.toFixed(5)}, {currentCoord.lng.toFixed(5)}
                    </div>
                )}
            </div>

            <p className="mt-1.5 text-[11px] text-slate-500">
                Tips: Geser pin merah atau ketik di kotak pencarian Google Places untuk menentukan alamat secara presisi.
            </p>
        </div>
    );
}
