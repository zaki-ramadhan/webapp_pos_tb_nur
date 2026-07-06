<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title inertia>{{ config('app.name', 'TB Nur POS') }}</title>
        <link rel="icon" type="image/png" href="/logo_icon.png" />
        <link rel="preload" as="image" href="/logo_icon.png" />
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
            href="https://fonts.bunny.net/css?family=montserrat:400,500,600,700,800"
            rel="stylesheet"
        />
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app/App.jsx'])
        <x-inertia::head />
    </head>
    <body class="bg-[var(--color-surface)] text-[var(--color-ink)] antialiased">
        <div id="initial-loader" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background-color: #f8f9fb; z-index: 99999; font-family: 'Montserrat', sans-serif; transition: opacity 0.3s ease-out;">
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top-color: #21539b; border-radius: 50%; animation: initial-loader-spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <div style="font-size: 16px; font-weight: 600; color: #1e293b; letter-spacing: 0.5px; animation: initial-loader-pulse 1.5s ease-in-out infinite;">Memuat...</div>
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
        <x-inertia::app />
    </body>
</html>
