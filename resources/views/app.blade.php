<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title inertia>{{ config('app.name', 'Toko Bangunan & Material TB Nur') }}</title>

        <!-- Google Search Console Verification -->
        <meta name="google-site-verification" content="Hs028BUYs6Ay-vu6NwlfYy5XElxuDJIqRocvUjpq9GY" />

        <!-- Primary SEO Meta Tags -->
        <meta name="description" content="Toko Bangunan &amp; Material TB Nur Cirebon. Menyediakan aneka bahan bangunan berkualitas, semen, pasir, bata, besi beton, cat, pipa, dan perlengkapan material proyek lengkap di Kaliwedi, Cirebon." />
        <meta name="keywords" content="TB Nur, Toko Bangunan TB Nur, Toko Bangunan Cirebon, Toko Material Kaliwedi, Toko Bangunan Guwa Kidul, Bahan Bangunan Murah, Semen, Besi Beton, Pasir, Bata, Cat Tembok, TB Nur POS" />
        <meta name="author" content="Toko Bangunan &amp; Material TB Nur" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="{{ url()->current() }}" />

        <!-- Geo & Local SEO Tags -->
        <meta name="geo.region" content="ID-JB" />
        <meta name="geo.placename" content="Kabupaten Cirebon" />
        <meta name="geo.position" content="-6.6115;108.4114" />
        <meta name="ICBM" content="-6.6115, 108.4114" />

        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:url" content="{{ url('/') }}" />
        <meta property="og:site_name" content="TB Nur - Toko Bangunan &amp; Material" />
        <meta property="og:title" content="Toko Bangunan &amp; Material TB Nur Cirebon" />
        <meta property="og:description" content="Pusat penjualan bahan bangunan dan material berkualitas di Kaliwedi, Cirebon. Semen, besi, pasir, bata, dan alat bangunan lengkap." />
        <meta property="og:image" content="{{ asset('assets/images/logo%20tb%20nur%20new.svg') }}" />
        <meta property="og:image:alt" content="Logo Toko Bangunan &amp; Material TB Nur" />

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="{{ url('/') }}" />
        <meta name="twitter:title" content="Toko Bangunan &amp; Material TB Nur Cirebon" />
        <meta name="twitter:description" content="Pusat penjualan bahan bangunan dan material berkualitas di Kaliwedi, Cirebon. Semen, besi, pasir, bata, dan alat bangunan lengkap." />
        <meta name="twitter:image" content="{{ asset('assets/images/logo%20tb%20nur%20new.svg') }}" />

        <!-- Favicon -->
        <link rel="icon" type="image/svg+xml" href="/assets/images/logo%20tb%20nur%20new.svg?v=1" />
        <link rel="apple-touch-icon" href="/assets/images/logo%20tb%20nur%20new.svg?v=1" />
        <link rel="shortcut icon" href="/assets/images/logo%20tb%20nur%20new.svg?v=1" />

        <!-- Structured Data (JSON-LD): WebSite (for Google Site Name) & HardwareStore (for Business Profile) -->
        <script type="application/ld+json">
        {!! json_encode([
            chr(64) . 'context' => 'https://schema.org',
            chr(64) . 'graph' => [
                [
                    chr(64) . 'type' => 'WebSite',
                    chr(64) . 'id' => url('/') . '#website',
                    'url' => url('/'),
                    'name' => 'TB Nur',
                    'alternateName' => ['Toko Bangunan TB Nur', 'Toko Bangunan & Material TB Nur'],
                    'publisher' => [
                        chr(64) . 'id' => url('/') . '#store',
                    ],
                ],
                [
                    chr(64) . 'type' => 'HardwareStore',
                    chr(64) . 'id' => url('/') . '#store',
                    'name' => 'Toko Bangunan & Material TB Nur',
                    'alternateName' => ['TB Nur', 'Toko Bangunan TB Nur', 'Toko Bangunan Nur Guwa Kidul'],
                    'url' => url('/'),
                    'logo' => asset('assets/images/logo%20tb%20nur%20new.svg'),
                    'image' => asset('assets/images/logo%20tb%20nur%20new.svg'),
                    'description' => 'Toko Bangunan & Material TB Nur Cirebon. Menyediakan aneka bahan bangunan berkualitas, semen, pasir, bata, besi beton, cat, dan perlengkapan material proyek lengkap di Kaliwedi, Cirebon.',
                    'telephone' => '+62-877-2498-5885',
                    'priceRange' => '$$',
                    'hasMap' => 'https://maps.google.com/?q=Toko+Bangunan+Nur+Guwa+Kidul+Kaliwedi+Cirebon',
                    'address' => [
                        chr(64) . 'type' => 'PostalAddress',
                        'streetAddress' => 'Jl. P. Anggabaya No.22, Guwa Kidul',
                        'addressLocality' => 'Kecamatan Kaliwedi',
                        'addressRegion' => 'Jawa Barat',
                        'postalCode' => '45165',
                        'addressCountry' => 'ID',
                    ],
                    'geo' => [
                        chr(64) . 'type' => 'GeoCoordinates',
                        'latitude' => -6.6115,
                        'longitude' => 108.4114,
                    ],
                    'openingHoursSpecification' => [
                        [
                            chr(64) . 'type' => 'OpeningHoursSpecification',
                            'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                            'opens' => '07:30',
                            'closes' => '17:00',
                        ],
                    ],
                ],
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
        </script>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
            href="https://fonts.bunny.net/css?family=montserrat:400,500,600,700,800"
            rel="stylesheet"
        />
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app/App.jsx'])
        <script>
            window.__REVERB_KEY__ = "{{ config('broadcasting.connections.reverb.key') ?? env('REVERB_APP_KEY', 'pos_tb_nur_reverb_key') }}";
        </script>
        <x-inertia::head />
    <body class="bg-[var(--color-surface)] text-[var(--color-ink)] antialiased">
        <noscript>
            <div style="padding: 24px; font-family: sans-serif; max-width: 800px; margin: 0 auto;">
                <h1 style="color: #1e3a8a; font-size: 24px; font-weight: bold;">Toko Bangunan &amp; Material TB Nur Cirebon</h1>
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                    Menyediakan aneka bahan bangunan berkualitas, semen, pasir, bata, besi beton, cat tembok, pipa, dan perlengkapan material konstruksi serta renovasi lengkap di Kaliwedi, Cirebon.
                </p>
                <div style="margin-top: 16px; font-size: 14px; color: #475569;">
                    <p><strong>Alamat:</strong> Jl. P. Anggabaya No.22, Guwa Kidul, Kec. Kaliwedi, Kabupaten Cirebon, Jawa Barat 45165</p>
                    <p><strong>WhatsApp / Telepon:</strong> 0877-2498-5885</p>
                </div>
            </div>
        </noscript>
        <div id="initial-loader" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background-color: #f8f9fb; z-index: 99999; font-family: 'Montserrat', sans-serif; transition: opacity 0.3s ease-out;">
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top-color: #21539b; border-radius: 50%; animation: initial-loader-spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <div style="font-size: 16px; font-weight: 500; color: #1e293b; animation: initial-loader-pulse 1.5s ease-in-out infinite;">Sedang memuat...</div>
            </div>
        </div>
        <style>
            @keyframes initial-loader-spin {
                to { transform: rotate(360deg); }
            }
            @keyframes initial-loader-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
        <script>
            (function() {
                function removeLoader() {
                    var loader = document.getElementById('initial-loader');
                    if (loader) {
                        loader.style.opacity = '0';
                        setTimeout(function() { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }, 300);
                    }
                }
                if (document.readyState === 'complete') {
                    setTimeout(removeLoader, 200);
                } else {
                    window.addEventListener('load', function() { setTimeout(removeLoader, 200); });
                }
                setTimeout(removeLoader, 2500);
            })();
        </script>
        <x-inertia::app />
    </body>
</html>
