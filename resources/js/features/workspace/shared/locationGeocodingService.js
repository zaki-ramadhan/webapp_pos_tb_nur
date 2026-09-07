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
                timeout: 30000,
                maximumAge: 0,
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

    let formattedCity = regency;
    if (formattedCity && !formattedCity.startsWith('Kab.') && !formattedCity.startsWith('Kota')) {
        if (formattedCity.startsWith('Kabupaten ')) {
            formattedCity = formattedCity.replace('Kabupaten ', 'Kab. ');
        } else {
            formattedCity = `Kab. ${formattedCity}`;
        }
    }

    return {
        street: street || 'Guwa Kidul, Kec. Kaliwedi',
        city: formattedCity || 'Kab. Cirebon',
        province: province || 'Jawa Barat',
        postalCode: postalCode || '45165',
        country,
        lat,
        lng,
    };
}

/**
 * Smart Hybrid Geocoding: Nominatim (zoom 18) + BigDataCloud + Kodepos Resmi
 */
async function reverseGeocodeSmart(lat, lng) {
    const osmPromise = fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
        { headers: { 'User-Agent': 'TBNurPOS/1.0' } }
    )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

    const bdcPromise = fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`
    )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

    const [osmData, bdcData] = await Promise.all([osmPromise, bdcPromise]);

    const osmAddr = osmData?.address || {};

    const road = osmAddr.road || osmAddr.pedestrian || '';
    const houseNumber = osmAddr.house_number ? ` No. ${osmAddr.house_number}` : '';
    const hamlet = osmAddr.hamlet || osmAddr.isolated_dwelling || osmAddr.neighbourhood || '';
    let village = osmAddr.village || osmAddr.suburb || osmAddr.hamlet || '';

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

    let regency = '';
    if (Array.isArray(bdcData?.localityInfo?.administrative)) {
        const r = bdcData.localityInfo.administrative.find(
            (a) => a.adminLevel === 5 || /(kabupaten|kota)/i.test(a.description || '')
        );
        if (r) regency = r.name;
    }
    if (!regency) {
        regency = osmAddr.county || osmAddr.city || 'Cirebon';
    }

    let province = osmAddr.state || bdcData?.principalSubdivision || 'Jawa Barat';

    let postalCode = '';
    const query = village || kecamatan;
    if (query) {
        try {
            const kpRes = await fetch(`https://kodepos.vercel.app/search/?q=${encodeURIComponent(query)}`);
            if (kpRes.ok) {
                const kpData = await kpRes.json();
                if (Array.isArray(kpData.data) && kpData.data.length > 0) {
                    const match = kpData.data.find(
                        (d) =>
                            (village && (d.village || '').toLowerCase().includes(village.toLowerCase())) ||
                            (kecamatan && (d.district || '').toLowerCase().includes(kecamatan.toLowerCase()))
                    );
                    if (match) {
                        postalCode = String(match.code || '');
                        if (!kecamatan && match.district) kecamatan = match.district;
                        if (!regency && match.regency) regency = match.regency;
                        if (!province && match.province) province = match.province;
                        if (!village && match.village) village = match.village;
                    }
                }
            }
        } catch {
            // Fallback
        }
    }

    if (!postalCode) {
        if (village.toLowerCase().includes('guwa') || kecamatan.toLowerCase().includes('kaliwedi')) {
            postalCode = '45165';
        } else {
            postalCode = (osmAddr.postcode || '').replace(/[^0-9]/g, '');
        }
    } else if (
        postalCode === '45274' &&
        (village.toLowerCase().includes('guwa') || kecamatan.toLowerCase().includes('kaliwedi'))
    ) {
        postalCode = '45165';
    }

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
    if (!street && osmData?.display_name) {
        const parts = osmData.display_name.split(',').map((p) => p.trim());
        street = parts.slice(0, 3).join(', ');
    }

    let formattedCity = regency;
    if (formattedCity && !formattedCity.startsWith('Kab.') && !formattedCity.startsWith('Kota')) {
        if (formattedCity.startsWith('Kabupaten ')) {
            formattedCity = formattedCity.replace('Kabupaten ', 'Kab. ');
        } else {
            formattedCity = `Kab. ${formattedCity}`;
        }
    }

    return {
        street: street || 'Desa Guwa Kidul, Kec. Kaliwedi',
        city: formattedCity || 'Kab. Cirebon',
        province: province || 'Jawa Barat',
        postalCode: postalCode || '45165',
        country: 'Indonesia',
        lat,
        lng,
    };
}

/**
 * Reverse geocode koordinat lat, lng menjadi objek alamat TB Nur.
 */
export async function reverseGeocodeCoordinates(lat, lng) {
    const googleKey = getGoogleMapsApiKey();
    if (googleKey) {
        try {
            return await reverseGeocodeGoogle(lat, lng, googleKey);
        } catch {
            // Fallback ke Smart Geocoder
        }
    }
    return await reverseGeocodeSmart(lat, lng);
}
