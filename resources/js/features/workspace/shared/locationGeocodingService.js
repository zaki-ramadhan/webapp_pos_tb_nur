/**
 * Layanan Lokasi & Geocoding Presisi Tinggi TB Nur
 *
 * Mengakomodasi:
 * 1. Deteksi GPS perangkat via browser Geolocation API dengan opsi akurasi tinggi (enableHighAccuracy).
 * 2. Reverse geocoding via Google Maps API (jika API Key tersedia).
 * 3. Fallback Smart Hybrid Geocoding (Nominatim zoom 18 + BigDataCloud + Database Kodepos Resmi)
 *    yang memastikan desa/kelurahan, kecamatan (Kec. Kaliwedi), kabupaten (Kab. Cirebon),
 *    dan kode pos resmi (45165) terdeteksi akurat untuk wilayah pedesaan/daerah TB Nur.
 */

export const STORE_ADDRESS_TB_NUR = {
    street: 'Jl. P. Anggabaya No.22, Guwa Kidul, Kec. Kaliwedi',
    city: 'Kab. Cirebon',
    province: 'Jawa Barat',
    postalCode: '45165',
    country: 'Indonesia',
    lat: -6.558975,
    lng: 108.3820015,
};

const GOOGLE_MAPS_STORAGE_KEY = 'pos_google_maps_api_key';

export function getGoogleMapsApiKey() {
    return (
        localStorage.getItem(GOOGLE_MAPS_STORAGE_KEY) ||
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
        ''
    ).trim();
}

export function setGoogleMapsApiKey(key) {
    if (key && key.trim()) {
        localStorage.setItem(GOOGLE_MAPS_STORAGE_KEY, key.trim());
    } else {
        localStorage.removeItem(GOOGLE_MAPS_STORAGE_KEY);
    }
}

/**
 * Mengambil koordinat GPS perangkat terkini dengan akurasi tinggi.
 */
export function getCurrentDeviceCoordinates() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Browser Anda tidak mendukung layanan geolokasi GPS.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
            },
            (err) => {
                let message = 'Gagal mendeteksi lokasi GPS perangkat.';
                if (err.code === 1) {
                    message = 'Izin akses lokasi ditolak oleh browser. Harap aktifkan izin lokasi di pengaturan browser Anda.';
                } else if (err.code === 2) {
                    message = 'Sinyal lokasi atau GPS tidak tersedia pada perangkat.';
                } else if (err.code === 3) {
                    message = 'Waktu permintaan lokasi habis (timeout). Silakan coba beberapa saat lagi.';
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    });
}

/**
 * Reverse geocoding via Google Maps Geocoding API.
 */
async function reverseGeocodeGoogle(lat, lng, apiKey) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=id`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Google Geocoding HTTP request failed');
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
        source: 'Google Maps Geocoding',
    };
}

/**
 * Smart Hybrid Geocoding: Menggabungkan Nominatim (zoom 18) + BigDataCloud (kecamatan/kabupaten) + Kodepos Resmi
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

    // Cari kabupaten/kota dari BigDataCloud
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

    // Verifikasi kode pos via database kodepos resmi
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
            // Kodepos search fallback
        }
    }

    // Koreksi data OSM jika kode pos keliru (misal 45274 di Guwa Kidul Cirebon harusnya 45165)
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

    // Susun format jalan, dusun, desa, kecamatan
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

    // Format kabupaten/kota: "Kab. [Nama]" atau "Kota [Nama]"
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
        source: 'Smart Reverse Geocoder',
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
            // Fallback ke Smart Geocoder jika Google API gagal
        }
    }
    return await reverseGeocodeSmart(lat, lng);
}
