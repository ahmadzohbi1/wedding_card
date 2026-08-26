<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>Ahmad & Layla — Wedding Invitation</title>
        @include('partials.seo', ['seoTitle' => 'Ahmad & Layla — Wedding Invitation'])
        @include('partials.favicon')

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@300;400;500;600&display=swap" rel="stylesheet">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    </head>
    <body>
        <div id="app" data-show-kids-message="{{ $showKidsMessage ? '1' : '0' }}"></div>
    </body>
</html>
