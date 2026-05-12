<?php

namespace App\Support\Auth;

final class PhoneNumber
{
    public static function normalize(?string $value): ?string
    {
        $trimmed = trim((string) $value);

        if ($trimmed === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $trimmed) ?? '';

        if ($digits === '') {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        if (str_starts_with($digits, '62')) {
            return $digits;
        }

        if (str_starts_with($digits, '8')) {
            return '62'.$digits;
        }

        return $digits;
    }

    public static function candidates(?string $value): array
    {
        $normalized = self::normalize($value);

        if ($normalized === null) {
            return [];
        }

        $candidates = [$normalized, '+'.$normalized];

        if (str_starts_with($normalized, '62')) {
            $national = substr($normalized, 2);

            if ($national !== false && $national !== '') {
                $candidates[] = '0'.$national;
                $candidates[] = $national;
            }
        }

        return array_values(array_unique(array_filter($candidates)));
    }

    public static function isValidIndonesianMobile(?string $value): bool
    {
        $normalized = self::normalize($value);

        if ($normalized === null) {
            return false;
        }

        return (bool) preg_match('/^628\d{7,11}$/', $normalized);
    }
}
