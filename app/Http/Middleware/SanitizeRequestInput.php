<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeRequestInput
{
    /**
     * Kunci input yang tidak boleh disanitasi (misal password).
     *
     * @var array<int, string>
     */
    protected array $except = [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();

        if (!empty($input)) {
            $cleaned = $this->cleanArray($input);
            $request->merge($cleaned);
        }

        return $next($request);
    }

    /**
     * Bersihkan data input secara rekursif.
     */
    protected function cleanArray(array $data, string $parentKey = ''): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $fullKey = $parentKey !== '' ? "{$parentKey}.{$key}" : (string) $key;

            if ($this->isExcluded($fullKey, (string) $key)) {
                $result[$key] = $value;
                continue;
            }

            if (is_array($value)) {
                $result[$key] = $this->cleanArray($value, $fullKey);
            } elseif (is_string($value)) {
                $result[$key] = $this->cleanString($value);
            } else {
                $result[$key] = $value;
            }
        }

        return $result;
    }

    /**
     * Cek apakah key input dikecualikan.
     */
    protected function isExcluded(string $fullKey, string $key): bool
    {
        foreach ($this->except as $exceptKey) {
            if ($key === $exceptKey || str_ends_with($fullKey, ".{$exceptKey}")) {
                return true;
            }
        }

        return false;
    }

    /**
     * Bersihkan string dari emoji, tag mencurigakan, null byte, dan script berbahaya.
     */
    public static function cleanString(string $value): string
    {
        // 1. Hapus null byte
        $clean = str_replace("\0", '', $value);

        // 2. Hapus seluruh blok tag script dan style berserta isinya
        $clean = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $clean);
        $clean = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $clean);

        // 3. Strip seluruh tag HTML/XML
        $clean = strip_tags($clean);

        // 4. Hapus pseudo-protokol javascript:
        $clean = preg_replace('/javascript\s*:/i', '', $clean);

        // 5. Hapus semua karakter 4-byte UTF-8 (mencakup mayoritas Unicode emoji modern)
        $clean = preg_replace('/[\x{10000}-\x{10FFFF}]/u', '', $clean);

        // 6. Hapus emoji & simbol khusus BMP (Emoticon, Dingbats, Misc Symbols, Flags, ZWJ, Variasi)
        $emojiPattern = '/['
            . '\x{1F600}-\x{1F64F}' // Emoticons
            . '\x{1F300}-\x{1F5FF}' // Misc Symbols and Pictographs
            . '\x{1F680}-\x{1F6FF}' // Transport and Map
            . '\x{1F700}-\x{1F77F}' // Alchemical Symbols
            . '\x{1F780}-\x{1F7FF}' // Geometric Shapes Extended
            . '\x{1F800}-\x{1F8FF}' // Supplemental Arrows-C
            . '\x{1F900}-\x{1F9FF}' // Supplemental Symbols and Pictographs
            . '\x{1FA00}-\x{1FA6F}' // Chess Symbols
            . '\x{1FA70}-\x{1FAFF}' // Symbols and Pictographs Extended-A
            . '\x{2300}-\x{23FF}'   // Misc Technical (clock, timers, etc.)
            . '\x{2600}-\x{26FF}'   // Misc symbols (weather, stars, etc.)
            . '\x{2700}-\x{27BF}'   // Dingbats
            . '\x{2B00}-\x{2BFF}'   // Misc Symbols and Arrows (stars, etc.)
            . '\x{1F1E6}-\x{1F1FF}' // Flags
            . '\x{FE00}-\x{FE0F}'   // Variation Selectors
            . '\x{200B}-\x{200D}'   // Zero-width space, non-joiner, joiner
            . '\x{20D0}-\x{20FF}'   // Combining Diacritical Marks for Symbols
            . ']/u';
        $clean = preg_replace($emojiPattern, '', $clean);

        // 7. Hapus karakter kontrol non-printable berbahaya (tetap izinkan \n, \r, \t untuk format catatan/alamat)
        $clean = preg_replace('/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $clean);

        return $clean;
    }
}
