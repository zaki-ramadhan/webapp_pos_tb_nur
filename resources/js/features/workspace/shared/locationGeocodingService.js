import { INDONESIAN_CITIES } from '@/features/workspace/shared/indonesianCities';

/**
 * Layanan Lokasi & Geocoding Presisi Tinggi TB Nur
 */

const GOOGLE_MAPS_STORAGE_KEY = 'pos_google_maps_api_key';

export function getGoogleMapsApiKey() {
    return (
        localStorage.getItem(GOOGLE_MAPS_STORAGE_KEY) ||
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
        ''
    ).trim();
}

/**
 * Menerjemahkan nama provinsi dan arah mata angin dari bahasa Inggris ke bahasa Indonesia.
 */
export function normalizeIndonesianProvince(rawProvince) {
    if (!rawProvince) return 'Jawa Barat';
    let p = String(rawProvince).trim();

    const provinceMap = {
        'west java': 'Jawa Barat',
        'central java': 'Jawa Tengah',
        'east java': 'Jawa Timur',
        'jakarta': 'DKI Jakarta',
        'special capital region of jakarta': 'DKI Jakarta',
        'yogyakarta': 'DI Yogyakarta',
        'special region of yogyakarta': 'DI Yogyakarta',
        'banten': 'Banten',
        'bali': 'Bali',
        'aceh': 'Aceh',
        'north sumatra': 'Sumatera Utara',
        'west sumatra': 'Sumatera Barat',
        'south sumatra': 'Sumatera Selatan',
        'riau': 'Riau',
        'riau islands': 'Kepulauan Riau',
        'jambi': 'Jambi',
        'bengkulu': 'Bengkulu',
        'lampung': 'Lampung',
        'bangka belitung islands': 'Kepulauan Bangka Belitung',
        'bangka belitung': 'Kepulauan Bangka Belitung',
        'west kalimantan': 'Kalimantan Barat',
        'central kalimantan': 'Kalimantan Tengah',
        'south kalimantan': 'Kalimantan Selatan',
        'east kalimantan': 'Kalimantan Timur',
        'north kalimantan': 'Kalimantan Utara',
        'north sulawesi': 'Sulawesi Utara',
        'central sulawesi': 'Sulawesi Tengah',
        'south sulawesi': 'Sulawesi Selatan',
        'southeast sulawesi': 'Sulawesi Tenggara',
        'west sulawesi': 'Sulawesi Barat',
        'gorontalo': 'Gorontalo',
        'maluku': 'Maluku',
        'north maluku': 'Maluku Utara',
        'papua': 'Papua',
        'west papua': 'Papua Barat',
        'south papua': 'Papua Selatan',
        'central papua': 'Papua Tengah',
        'highland papua': 'Papua Pegunungan',
        'southwest papua': 'Papua Barat Daya',
    };

    const lower = p.toLowerCase();
    if (provinceMap[lower]) {
        return provinceMap[lower];
    }

    p = p.replace(/\bwest\b/gi, 'Barat')
        .replace(/\beast\b/gi, 'Timur')
        .replace(/\bsouth\b/gi, 'Selatan')
        .replace(/\bnorth\b/gi, 'Utara')
        .replace(/\bcentral\b/gi, 'Tengah')
        .replace(/\bsoutheast\b/gi, 'Tenggara')
        .replace(/\bsouthwest\b/gi, 'Barat Daya')
        .replace(/\bnorthwest\b/gi, 'Barat Laut')
        .replace(/\bnortheast\b/gi, 'Timur Laut');

    return p;
}

/**
 * Mencocokkan nama kota/kabupaten dengan daftar resmi INDONESIAN_CITIES (CityAutocompleteInput).
 */
export function matchIndonesianCity(rawCity, rawProvince) {
    const cleanCity = String(rawCity || '')
        .replace(/^(kabupaten|kab\.?|kota)\s+/i, '')
        .replace(/\s+(regency|city)$/i, '')
        .trim()
        .toLowerCase();

    const normalizedProvince = normalizeIndonesianProvince(rawProvince);

    // 1. Cocokkan nama kota + provinsi
    let matched = INDONESIAN_CITIES.find((item) => {
        const itemCityClean = item.city.replace(/^(kabupaten|kab\.?|kota)\s+/i, '').toLowerCase();
        return itemCityClean === cleanCity && item.province.toLowerCase() === normalizedProvince.toLowerCase();
    });

    // 2. Cocokkan hanya nama kota
    if (!matched) {
        matched = INDONESIAN_CITIES.find((item) => {
            const itemCityClean = item.city.replace(/^(kabupaten|kab\.?|kota)\s+/i, '').toLowerCase();
            return itemCityClean === cleanCity;
        });
    }

    // 3. Cocokkan parsial (substring)
    if (!matched && cleanCity.length >= 3) {
        matched = INDONESIAN_CITIES.find((item) => {
            const itemCityClean = item.city.replace(/^(kabupaten|kab\.?|kota)\s+/i, '').toLowerCase();
            return itemCityClean.includes(cleanCity) || cleanCity.includes(itemCityClean);
        });
    }

    if (matched) {
        return {
            city: matched.city,
            province: matched.province,
            postalCode: matched.postalCode,
            country: 'Indonesia',
        };
    }

    let fallbackCity = rawCity;
    if (fallbackCity && !fallbackCity.startsWith('Kab.') && !fallbackCity.startsWith('Kota')) {
        fallbackCity = `Kab. ${fallbackCity.replace(/^kabupaten\s+/i, '')}`;
    }

    return {
        city: fallbackCity || 'Kab. Cirebon',
        province: normalizedProvince,
        postalCode: '',
        country: 'Indonesia',
    };
}

/**
 * Mengambil koordinat GPS perangkat langsung via Geolocation API browser.
 */
export function getCurrentDeviceCoordinates() {
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
        return Promise.reject(new Error('Akses lokasi membutuhkan koneksi aman (HTTPS atau localhost).'));
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return Promise.reject(new Error('Browser tidak mendukung fitur geolokasi GPS.'));
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
            },
            (err) => {
                let message = 'Gagal mendeteksi lokasi GPS.';
                if (err.code === 1) { // PERMISSION_DENIED
                    message = 'Izin lokasi diblokir browser. Buka setelan situs di kiri URL untuk mengizinkan.';
                } else if (err.code === 2) { // POSITION_UNAVAILABLE
                    message = 'Sinyal GPS tidak tersedia pada perangkat.';
                } else if (err.code === 3) { // TIMEOUT
                    message = 'Waktu permintaan lokasi habis. Silakan coba kembali.';
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: Infinity,
                maximumAge: 60000,
            }
        );
    });
}

/**
 * Reverse geocoding via Google Maps Geocoding API jika API key tersedia.
 */
async function reverseGeocodeGoogle(lat, lng, apiKey) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=id`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Permintaan Google Geocoding gagal.');
    }
    const data = await response.json();
    if (data.status !== 'OK' || !Array.isArray(data.results) || data.results.length === 0) {
        throw new Error(`Google Geocoding status: ${data.status}`);
    }

    const result = data.results[0];
    const components = result.address_components || [];

    let streetNumber = '';
    let route = '';
    let subpremise = '';
    let hamlet = '';
    let village = '';
    let district = '';
    let regency = '';
    let province = '';
    let postalCode = '';
    let country = 'Indonesia';

    for (const comp of components) {
        const types = comp.types || [];
        if (types.includes('street_number')) {
            streetNumber = comp.long_name || '';
        } else if (types.includes('route')) {
            route = comp.long_name || '';
        } else if (types.includes('subpremise') || types.includes('premise')) {
            subpremise = comp.long_name || '';
        } else if (types.includes('sublocality_level_2') || types.includes('neighborhood')) {
            hamlet = comp.long_name || '';
        } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
            village = comp.long_name || '';
        } else if (types.includes('administrative_area_level_3')) {
            district = comp.long_name || '';
        } else if (types.includes('administrative_area_level_2') || types.includes('locality')) {
            regency = comp.long_name || '';
        } else if (types.includes('administrative_area_level_1')) {
            province = comp.long_name || '';
        } else if (types.includes('postal_code')) {
            postalCode = (comp.long_name || '').replace(/[^0-9]/g, '');
        } else if (types.includes('country')) {
            country = comp.long_name || 'Indonesia';
        }
    }

    const streetParts = [];
    if (route) {
        streetParts.push(streetNumber ? `${route} No. ${streetNumber}` : route);
    }
    if (subpremise) {
        streetParts.push(subpremise);
    }
    if (hamlet && hamlet !== village) {
        streetParts.push(hamlet);
    }
    if (village) {
        streetParts.push(`Desa ${village.replace(/^(desa|kelurahan)\s+/i, '')}`);
    }
    if (district) {
        streetParts.push(`Kec. ${district.replace(/^kecamatan\s+/i, '')}`);
    }

    let street = streetParts.join(', ').trim();
    if (!street && result.formatted_address) {
        const parts = result.formatted_address.split(',').map((p) => p.trim());
        street = parts.slice(0, 3).join(', ');
    }

    const cityMatch = matchIndonesianCity(regency, province);

    return {
        street: street || 'Guwa Kidul, Kec. Kaliwedi',
        city: cityMatch.city,
        province: cityMatch.province,
        postalCode: postalCode || cityMatch.postalCode || '45165',
        country,
        lat,
        lng,
    };
}

/**
 * Smart Hybrid Geocoding: Menggabungkan Nominatim level desa (zoom 16) + level jalan (zoom 18) + BigDataCloud + Kodepos Resmi
 */
async function reverseGeocodeSmart(lat, lng) {
    const headers = {
        'User-Agent': 'TBNurPOS/1.0',
        'Accept-Language': 'id-ID, id;q=0.9, en;q=0.8',
    };

    // Panggil zoom=16 (akurasi desa/wilayah) dan zoom=18 (nama jalan mikro jika ada) secara paralel
    const [osmVillageRes, osmRoadRes, bdcData] = await Promise.all([
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=16`, { headers })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`, { headers })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
    ]);

    const villageAddr = osmVillageRes?.address || {};
    const roadAddr = osmRoadRes?.address || {};

    // Deteksi jalan & nomor rumah
    const road = roadAddr.road || villageAddr.road || roadAddr.pedestrian || villageAddr.pedestrian || '';
    const houseNumber = roadAddr.house_number ? ` No. ${roadAddr.house_number}` : '';
    const hamlet = villageAddr.hamlet || roadAddr.hamlet || villageAddr.isolated_dwelling || '';

    // Prioritaskan nama desa level 16 agar tidak terpental ke batas desa tetangga
    let village = villageAddr.village || roadAddr.village || villageAddr.suburb || roadAddr.suburb || villageAddr.hamlet || '';

    // Cari kecamatan dari BigDataCloud
    let kecamatan = '';
    if (Array.isArray(bdcData?.localityInfo?.informative)) {
        const k = bdcData.localityInfo.informative.find((i) =>
            (i.description || '').toLowerCase().includes('kecamatan')
        );
        if (k) kecamatan = k.name;
    }
    if (!kecamatan && bdcData?.city && !bdcData.city.toLowerCase().includes('cirebon')) {
        kecamatan = bdcData.city;
    }

    // Cari kabupaten/kota dari BigDataCloud / OSM
    let regency = '';
    if (Array.isArray(bdcData?.localityInfo?.administrative)) {
        const r = bdcData.localityInfo.administrative.find(
            (a) => a.adminLevel === 5 || /(kabupaten|kota)/i.test(a.description || '')
        );
        if (r) regency = r.name;
    }
    if (!regency) {
        regency = villageAddr.county || roadAddr.county || villageAddr.city || 'Cirebon';
    }

    let rawProvince = villageAddr.state || roadAddr.state || bdcData?.principalSubdivision || 'Jawa Barat';
    let province = normalizeIndonesianProvince(rawProvince);

    // Verifikasi kode pos & nama desa resmi via database kodepos
    let postalCode = '';
    const query = village || kecamatan;
    if (query) {
        try {
            const kpRes = await fetch(`https://kodepos.vercel.app/search/?q=${encodeURIComponent(query)}`);
            if (kpRes.ok) {
                const kpData = await kpRes.json();
                if (Array.isArray(kpData.data) && kpData.data.length > 0) {
                    // Cari kecocokan nama desa terlebih dahulu
                    let match = village
                        ? kpData.data.find((d) => (d.village || '').toLowerCase() === village.toLowerCase())
                        : null;

                    if (!match && village) {
                        match = kpData.data.find((d) =>
                            (d.village || '').toLowerCase().includes(village.toLowerCase()) ||
                            village.toLowerCase().includes((d.village || '').toLowerCase())
                        );
                    }

                    if (!match && kecamatan) {
                        match = kpData.data.find((d) =>
                            (d.district || '').toLowerCase().includes(kecamatan.toLowerCase())
                        );
                    }

                    if (match) {
                        postalCode = String(match.code || '');
                        if (match.district) kecamatan = match.district;
                        if (match.regency) regency = match.regency;
                        if (match.province) province = normalizeIndonesianProvince(match.province);
                        if (match.village && !village) village = match.village;
                    }
                }
            }
        } catch {
            // Fallback
        }
    }

    // Koreksi kode pos jika OSM mengembalikan 45274 untuk Kaliwedi / Cirebon
    if (!postalCode || postalCode === '45274') {
        if (village.toLowerCase().includes('guwa') || kecamatan.toLowerCase().includes('kaliwedi')) {
            postalCode = '45165';
        } else {
            postalCode = (villageAddr.postcode || roadAddr.postcode || '').replace(/[^0-9]/g, '');
        }
    }

    // Normalisasi kota dan provinsi agar selaras dengan data lookup INDONESIAN_CITIES
    const cityMatch = matchIndonesianCity(regency, province);

    // Susun format jalan
    const streetParts = [];
    if (road) {
        streetParts.push(`${road}${houseNumber}`);
    }
    if (hamlet && hamlet !== village && hamlet !== road) {
        streetParts.push(hamlet.startsWith('Dusun') || hamlet.startsWith('Blok') ? hamlet : `Dusun ${hamlet}`);
    }
    if (village) {
        const cleanVillage = village.replace(/^(desa|kelurahan)\s+/i, '');
        streetParts.push(`Desa ${cleanVillage}`);
    }
    if (kecamatan) {
        const cleanKec = kecamatan.replace(/^kecamatan\s+/i, '');
        streetParts.push(`Kec. ${cleanKec}`);
    }

    let street = streetParts.join(', ').trim();
    if (!street && osmVillageRes?.display_name) {
        const parts = osmVillageRes.display_name.split(',').map((p) => p.trim());
        street = parts.slice(0, 3).join(', ');
    }

    return {
        street: street || 'Desa Guwa Kidul, Kec. Kaliwedi',
        city: cityMatch.city,
        province: cityMatch.province,
        postalCode: postalCode || cityMatch.postalCode || '45165',
        country: 'Indonesia',
        lat,
        lng,
    };
}

/**
 * Reverse geocode koordinat lat, lng menjadi objek alamat TB Nur.
 * Memprioritaskan backend Google Geocoding (aman via .env server).
 */
export async function reverseGeocodeCoordinates(lat, lng) {
    // 1. Coba reverse geocode via backend Laravel (Google Maps API Key di .env server)
    try {
        const response = await fetch(`/api/backend/geo/reverse?lat=${lat}&lng=${lng}`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                const cityMatch = matchIndonesianCity(result.data.city, result.data.province);
                return {
                    street: result.data.street || '',
                    city: cityMatch.city,
                    province: cityMatch.province,
                    postalCode: result.data.postalCode || cityMatch.postalCode || '45165',
                    country: result.data.country || 'Indonesia',
                    lat,
                    lng,
                };
            }
        }
    } catch {
        // Backend geocode gagal / offline, lanjutkan ke fallback
    }

    // 2. Coba via Google Maps client-side jika API key disetel di browser/Vite
    const googleKey = getGoogleMapsApiKey();
    if (googleKey) {
        try {
            return await reverseGeocodeGoogle(lat, lng, googleKey);
        } catch {
            // Fallback ke Smart Geocoder
        }
    }

    // 3. Fallback Smart Hybrid Geocoding (OSM + BigDataCloud + Kodepos Resmi)
    return await reverseGeocodeSmart(lat, lng);
}
