<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeoLocationController extends Controller
{
    /**
     * Reverse geocoding via Google Maps Geocoding API.
     */
    public function reverseGeocode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $apiKey = config('services.google.maps_key') ?: env('GOOGLE_MAPS_API_KEY');

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Google Maps API Key belum dikonfigurasi.',
            ], 200);
        }

        try {
            $response = Http::timeout(6)->get('https://maps.googleapis.com/maps/api/geocode/json', [
                'latlng' => "{$validated['lat']},{$validated['lng']}",
                'key' => $apiKey,
                'language' => 'id',
            ]);

            if (! $response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menghubungi server Google Geocoding.',
                ], 200);
            }

            $data = $response->json();

            if (($data['status'] ?? '') !== 'OK' || empty($data['results'][0])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Status Google: '.($data['status'] ?? 'UNKNOWN'),
                ], 200);
            }

            $result = $data['results'][0];
            $components = $result['address_components'] ?? [];

            $streetNumber = '';
            $route = '';
            $subpremise = '';
            $hamlet = '';
            $village = '';
            $district = '';
            $regency = '';
            $province = '';
            $postalCode = '';
            $country = 'Indonesia';

            foreach ($components as $comp) {
                $types = $comp['types'] ?? [];
                if (in_array('street_number', $types, true)) {
                    $streetNumber = $comp['long_name'] ?? '';
                } elseif (in_array('route', $types, true)) {
                    $route = $comp['long_name'] ?? '';
                } elseif (in_array('subpremise', $types, true) || in_array('premise', $types, true)) {
                    $subpremise = $comp['long_name'] ?? '';
                } elseif (in_array('sublocality_level_2', $types, true) || in_array('neighborhood', $types, true)) {
                    $hamlet = $comp['long_name'] ?? '';
                } elseif (in_array('sublocality_level_1', $types, true) || in_array('sublocality', $types, true)) {
                    $village = $comp['long_name'] ?? '';
                } elseif (in_array('administrative_area_level_3', $types, true)) {
                    $district = $comp['long_name'] ?? '';
                } elseif (in_array('administrative_area_level_2', $types, true) || in_array('locality', $types, true)) {
                    $regency = $comp['long_name'] ?? '';
                } elseif (in_array('administrative_area_level_1', $types, true)) {
                    $province = $comp['long_name'] ?? '';
                } elseif (in_array('postal_code', $types, true)) {
                    $postalCode = preg_replace('/[^0-9]/', '', $comp['long_name'] ?? '');
                } elseif (in_array('country', $types, true)) {
                    $country = $comp['long_name'] ?? 'Indonesia';
                }
            }

            $streetParts = [];
            if ($route) {
                $streetParts[] = $streetNumber ? "{$route} No. {$streetNumber}" : $route;
            }
            if ($subpremise) {
                $streetParts[] = $subpremise;
            }
            if ($hamlet && $hamlet !== $village) {
                $streetParts[] = $hamlet;
            }
            if ($village) {
                $cleanVillage = preg_replace('/^(desa|kelurahan)\s+/i', '', $village);
                $streetParts[] = "Desa {$cleanVillage}";
            }
            if ($district) {
                $cleanDistrict = preg_replace('/^kecamatan\s+/i', '', $district);
                $streetParts[] = "Kec. {$cleanDistrict}";
            }

            $street = implode(', ', $streetParts);
            if (empty($street) && !empty($result['formatted_address'])) {
                $parts = array_map('trim', explode(',', $result['formatted_address']));
                $street = implode(', ', array_slice($parts, 0, 3));
            }

            $city = $regency;
            if (!empty($city) && !str_starts_with($city, 'Kab.') && !str_starts_with($city, 'Kota')) {
                if (str_starts_with($city, 'Kabupaten ')) {
                    $city = str_replace('Kabupaten ', 'Kab. ', $city);
                } else {
                    $city = "Kab. {$city}";
                }
            }

            return response()->json([
                'success' => true,
                'provider' => 'google',
                'data' => [
                    'street' => $street,
                    'city' => $city ?: 'Kab. Cirebon',
                    'province' => $province ?: 'Jawa Barat',
                    'postalCode' => $postalCode ?: '45165',
                    'country' => $country,
                    'formattedAddress' => $result['formatted_address'] ?? '',
                ],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Google Geocoding error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses geocoding: '.$e->getMessage(),
            ], 200);
        }
    }
}
