/**
 * Normalizes OpenStreetMap Nominatim address object to TB Nur Address schema.
 *
 * @param {object} osmData Raw result from Nominatim (search or reverse)
 * @returns {object} { street, city, province, postalCode, country, lat, lng, displayName }
 */
export function parseOsmAddress(osmData) {
    if (!osmData) return null;

    const address = osmData.address || {};
    const lat = parseFloat(osmData.lat) || null;
    const lng = parseFloat(osmData.lon) || null;

    // Construct street from available road/house/suburb components
    const road = address.road || address.pedestrian || address.neighbourhood || '';
    const houseNumber = address.house_number ? ` No. ${address.house_number}` : '';
    const subDistrict = address.suburb || address.village || address.hamlet || '';

    let streetParts = [];
    if (road) {
        streetParts.push(`${road}${houseNumber}`);
    }
    if (subDistrict && subDistrict !== road) {
        streetParts.push(subDistrict);
    }

    // Fallback street to display name prefix if road is empty
    let street = streetParts.join(', ').trim();
    if (!street && osmData.display_name) {
        const parts = osmData.display_name.split(',').map((p) => p.trim());
        street = parts.slice(0, 2).join(', ');
    }

    // Normalize city / regency
    const city =
        address.city ||
        address.county ||
        address.municipality ||
        address.town ||
        address.city_district ||
        '';

    // Normalize province
    const province =
        address.state ||
        address.state_district ||
        address.region ||
        '';

    // Normalize postal code
    const postalCode = (address.postcode || '').replace(/[^0-9]/g, '');

    // Normalize country
    const country = address.country || 'Indonesia';

    return {
        street,
        city,
        province,
        postalCode,
        country,
        lat,
        lng,
        displayName: osmData.display_name || '',
    };
}

/**
 * Normalizes Google Maps Place / Geocoder result to TB Nur Address schema.
 *
 * @param {object} googlePlace PlaceResult or GeocoderResult from Google Maps
 * @returns {object} { street, city, province, postalCode, country, lat, lng, displayName }
 */
export function parseGooglePlaceAddress(googlePlace) {
    if (!googlePlace) return null;

    const components = googlePlace.address_components || [];
    let streetNumber = '';
    let route = '';
    let sublocality = '';
    let city = '';
    let province = '';
    let postalCode = '';
    let country = 'Indonesia';

    for (const comp of components) {
        const types = comp.types || [];
        if (types.includes('street_number')) {
            streetNumber = comp.long_name || '';
        } else if (types.includes('route')) {
            route = comp.long_name || '';
        } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            sublocality = comp.long_name || '';
        } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            if (!city) city = comp.long_name || '';
        } else if (types.includes('administrative_area_level_1')) {
            province = comp.long_name || '';
        } else if (types.includes('postal_code')) {
            postalCode = (comp.long_name || '').replace(/[^0-9]/g, '');
        } else if (types.includes('country')) {
            country = comp.long_name || 'Indonesia';
        }
    }

    let streetParts = [];
    if (route) {
        streetParts.push(streetNumber ? `${route} No. ${streetNumber}` : route);
    }
    if (sublocality) {
        streetParts.push(sublocality);
    }

    let street = streetParts.join(', ').trim();
    if (!street && googlePlace.formatted_address) {
        const parts = googlePlace.formatted_address.split(',').map((p) => p.trim());
        street = parts.slice(0, 2).join(', ');
    }

    const lat = typeof googlePlace.geometry?.location?.lat === 'function'
        ? googlePlace.geometry.location.lat()
        : googlePlace.geometry?.location?.lat ?? null;

    const lng = typeof googlePlace.geometry?.location?.lng === 'function'
        ? googlePlace.geometry.location.lng()
        : googlePlace.geometry?.location?.lng ?? null;

    return {
        street,
        city,
        province,
        postalCode,
        country,
        lat,
        lng,
        displayName: googlePlace.formatted_address || googlePlace.name || '',
    };
}
