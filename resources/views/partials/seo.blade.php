@php
    $seoTitle = $seoTitle ?? 'Layla & Ahmad — Wedding Invitation';
    $seoDescription = $seoDescription ?? 'Join us to celebrate Layla & Ahmad — September 24, 2026, Roche Doree.';
    $seoImage = $seoImage ?? asset('assets/og-image.png');
    $seoUrl = $seoUrl ?? url()->current();
@endphp
<meta name="description" content="{{ $seoDescription }}">
<link rel="canonical" href="{{ $seoUrl }}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Layla & Ahmad">
<meta property="og:title" content="{{ $seoTitle }}">
<meta property="og:description" content="{{ $seoDescription }}">
<meta property="og:url" content="{{ $seoUrl }}">
<meta property="og:image" content="{{ $seoImage }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ $seoTitle }}">
<meta name="twitter:description" content="{{ $seoDescription }}">
<meta name="twitter:image" content="{{ $seoImage }}">

<meta name="theme-color" content="#89618b">
