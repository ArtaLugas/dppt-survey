<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased">
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5F5] via-[#80C7E3]/10 to-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full">
                <!-- Logo/Brand Section -->
                <div class="text-center mb-8">
                    <a href="https://equatorgroup.id" class="inline-block">
                        <div class="mx-auto h-16 w-16 bg-gradient-to-br from-[#263592] to-[#006CCD] rounded-2xl flex items-center justify-center shadow-lg shadow-[#263592]/30 hover:shadow-xl hover:shadow-[#006CCD]/40 transition duration-300">
                            <x-application-logo class="w-10 h-10 fill-current text-white" />
                        </div>
                    </a>
                    <h2 class="mt-6 text-3xl font-bold text-[#333333]">Welcome back</h2>
                    <p class="mt-2 text-sm text-[#333333]/70">Please sign in to your account</p>
                </div>

                <!-- Card Container -->
                <div class="bg-white rounded-2xl shadow-xl shadow-[#263592]/10 p-8 border border-[#80C7E3]/20">
                    {{ $slot }}
                </div>

                <!-- Footer -->
                <p class="mt-8 text-center text-xs text-[#333333]/60">
                    Protected by enterprise-grade security
                </p>
            </div>
        </div>
    </body>
</html>
