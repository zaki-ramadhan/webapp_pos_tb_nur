<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title inertia>{{ config('app.name', 'TB Nur POS') }}</title>
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
        <x-inertia::app />
    </body>
</html>
