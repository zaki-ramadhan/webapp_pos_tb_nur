<?php

namespace App\Support\Backend;

use Illuminate\Support\Str;

class BackendResourcePayloadSanitizer
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function sanitize(array $payload): array
    {
        $sanitized = $this->sanitizeValue($payload);

        if (array_key_exists('password', $sanitized) && blank($sanitized['password'])) {
            unset($sanitized['password']);
        }

        return $sanitized;
    }

    protected function sanitizeValue(mixed $value, ?string $key = null): mixed
    {
        if (is_array($value)) {
            $sanitized = [];

            foreach ($value as $childKey => $childValue) {
                $sanitized[$childKey] = $this->sanitizeValue(
                    $childValue,
                    is_string($childKey) ? $childKey : null,
                );
            }

            return $sanitized;
        }

        if (! is_string($value)) {
            return $value;
        }

        $trimmed = trim($value);

        if ($trimmed === '') {
            return null;
        }

      // Strip HTML/PHP tags to prevent XSS / HTML Injection

        $cleaned = strip_tags($trimmed);

        if ($key !== null && Str::endsWith($key, 'email')) {
            return Str::lower($cleaned);
        }

        return $cleaned;
    }
}
