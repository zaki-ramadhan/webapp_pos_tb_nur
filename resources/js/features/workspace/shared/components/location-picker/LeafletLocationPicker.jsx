import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parseOsmAddress } from './locationAddressParser';
import { showWarningToast, showSuccessToast, showInfoToast } from '@/components/feedback/toast';

const customPinIcon = L.divIcon({
    className: 'custom-map-pin',
    html: `
        <div style="transform: translate(-50%, -100%); filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
            <svg width="34" height="44" viewBox="0 0 24 24" fill="#ef4444" stroke="#991b1b" stroke-width="1.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="3" fill="#ffffff" stroke="none"/>
            </svg>
        </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
});

export default function LeafletLocationPicker({ onLocationSelected, initialLocation = null }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [locating, setLocating] = useState(false);
    const [currentCoord, setCurrentCoord] = useState(null);

    // Default coordinates: Bogor area (TB Nur) or default to Jabodetabek (-6.5971, 106.8060)
    const defaultLat = initialLocation?.lat || -6.5971;
    const defaultLng = initialLocation?.lng || 106.8060;

    const reverseGeocode = useCallback(async (lat, lng) => {
        setGeocoding(true);
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
            const response = await fetch(url, {
                headers: {
                    'Accept-Language': 'id-ID, id;q=0.9, en;q=0.8',
                },
            });
            if (response.ok) {
                const data = await response.json();
                const parsed = parseOsmAddress(data);
                if (parsed) {
                    onLocationSelected(parsed);
                }
            }
        } catch {
            // Silently fallback without crashing
        } finally {
            setGeocoding(false);
        }
    }, [onLocationSelected]);

    const updateMarkerPosition = useCallback((lat, lng, fetchAddress = true) => {
        setCurrentCoord({ lat, lng });
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        }
        if (fetchAddress) {
            reverseGeocode(lat, lng);
        }
    }, [reverseGeocode]);

    const detectDeviceLocation = useCallback((isUserTriggered = false) => {
        if (!navigator.geolocation) {
            if (isUserTriggered) {
                showWarningToast({
                    title: 'Geolokasi Tidak Didukung',
                    message: 'Browser Anda tidak mendukung geolokasi GPS.',
                });
            }
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocating(false);
                const { latitude, longitude, accuracy } = pos.coords;
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([latitude, longitude], 17);
                }
                updateMarkerPosition(latitude, longitude, true);
                if (isUserTriggered) {
                    showSuccessToast({
                        title: 'Lokasi Ditemukan',
                        message: `Titik peta disesuaikan ke posisi GPS Anda (akurasi ~${Math.round(accuracy || 10)}m).`,
                    });
                }
            },
            (err) => {
                setLocating(false);
                if (isUserTriggered) {
                    let msg = 'Gagal mendeteksi lokasi GPS perangkat.';
                    if (err?.code === 1) {
                        msg = 'Izin akses lokasi ditolak pada browser. Silakan klik ikon gembok di address bar browser untuk mengizinkan akses lokasi.';
                    } else if (err?.code === 2) {
                        msg = 'Sinyal GPS fisik tidak terdeteksi pada perangkat ini. Silakan ketik nama tempat (misal: Guwa Kidul atau Kaliwedi) di kolom pencarian.';
                    } else if (err?.code === 3) {
                        msg = 'Waktu pencarian sinyal GPS habis. Silakan gunakan kolom pencarian alamat atau geser pin langsung.';
                    }
                    showWarningToast({
                        title: 'Deteksi Lokasi GPS',
                        message: msg,
                    });
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, [updateMarkerPosition]);

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Initialize map with zoomControl false to relocate to bottom-right
        const map = L.map(mapContainerRef.current, {
            center: [defaultLat, defaultLng],
            zoom: 14,
            zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        // Move zoom control to bottom-right to prevent overlap with search suggestions
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const marker = L.marker([defaultLat, defaultLng], {
            icon: customPinIcon,
            draggable: true,
        }).addTo(map);

        markerRef.current = marker;
        mapInstanceRef.current = map;
        setCurrentCoord({ lat: defaultLat, lng: defaultLng });

        // Event: Marker dragged
        marker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            updateMarkerPosition(lat, lng, true);
        });

        // Event: Map clicked
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            updateMarkerPosition(lat, lng, true);
        });

        // Auto-detect current device GPS location if no initial location is provided
        if (!initialLocation) {
            detectDeviceLocation(false);
        } else {
            reverseGeocode(defaultLat, defaultLng);
        }

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [defaultLat, defaultLng, detectDeviceLocation, initialLocation, reverseGeocode, updateMarkerPosition]);

    const handleSearchSubmit = async (e) => {
        e?.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        setSearching(true);
        setSuggestions([]);

        const fetchQuery = async (q) => {
            const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
                q
            )}&countrycodes=id&addressdetails=1&limit=5`;
            const response = await fetch(url, {
                headers: {
                    'Accept-Language': 'id-ID, id;q=0.9, en;q=0.8',
                },
            });
            if (response.ok) {
                return await response.json();
            }
            return [];
        };

        try {
            let results = await fetchQuery(trimmed);

            // If empty, check for common Indonesian geographical spelling variants (e.g. Goa <-> Guwa)
            if ((!results || results.length === 0) && /\bgoa\b/i.test(trimmed)) {
                const aliasQuery = trimmed.replace(/\bgoa\b/gi, 'Guwa');
                results = await fetchQuery(aliasQuery);
            } else if ((!results || results.length === 0) && /\bguwa\b/i.test(trimmed)) {
                const aliasQuery = trimmed.replace(/\bguwa\b/gi, 'Goa');
                results = await fetchQuery(aliasQuery);
            }

            setSuggestions(results || []);
            if (!results || results.length === 0) {
                showWarningToast({
                    title: 'Pencarian Alamat',
                    message: `Lokasi "${trimmed}" tidak ditemukan. Coba ketik nama desa atau kecamatan terdekat (misal: Guwa Kidul atau Kaliwedi).`,
                });
            }
        } catch {
            setSuggestions([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectSuggestion = (item) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        if (!isNaN(lat) && !isNaN(lng)) {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([lat, lng], 16);
            }
            updateMarkerPosition(lat, lng, false);
            const parsed = parseOsmAddress(item);
            if (parsed) {
                onLocationSelected(parsed);
            }
            setSuggestions([]);
            setSearchQuery(item.display_name);
        }
    };

    return (
        <div className="relative flex h-full flex-col">
            {/* Search bar & GPS button */}
            <div className="relative z-[1000] mb-2 space-y-1">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari jalan, tempat, atau nama gedung..."
                            className="h-[38px] w-full rounded-[4px] border border-slate-300 bg-white pl-9 pr-8 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-blue focus:outline-none shadow-2xs"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSuggestions([]);
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                                aria-label="Hapus teks pencarian"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={searching || !searchQuery.trim()}
                        className="inline-flex h-[38px] items-center justify-center gap-1.5 rounded-[4px] border border-brand-blue bg-brand-blue px-3.5 text-xs sm:text-sm font-medium text-white hover:bg-brand-blue-hover disabled:opacity-50 cursor-pointer transition"
                    >
                        {searching ? 'Mencari...' : 'Cari'}
                    </button>

                    <button
                        type="button"
                        disabled={locating}
                        onClick={() => detectDeviceLocation(true)}
                        className="inline-flex h-[38px] items-center justify-center gap-1.5 rounded-[4px] border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition shrink-0"
                        aria-label="Gunakan lokasi GPS saat ini"
                    >
                        <svg className={`h-4 w-4 text-blue-600 shrink-0 ${locating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="hidden sm:inline">{locating ? 'Mendeteksi...' : 'Lokasi Saya'}</span>
                    </button>
                </form>

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[42px] z-[1100] max-h-[220px] overflow-y-auto rounded-[4px] border border-slate-300 bg-white shadow-xl">
                        {suggestions.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSuggestion(item)}
                                className="flex w-full flex-col px-3.5 py-2 text-left text-xs hover:bg-slate-50 border-b border-slate-100 last:border-b-0 cursor-pointer transition"
                            >
                                <span className="font-semibold text-slate-800 line-clamp-1">{item.name || item.display_name.split(',')[0]}</span>
                                <span className="text-[11px] text-slate-500 line-clamp-1">{item.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
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

            </div>
        </div>
    );
}
