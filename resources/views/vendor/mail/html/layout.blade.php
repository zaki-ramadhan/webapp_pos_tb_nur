<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
<title>{{ config('app.name') }}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style>
@media only screen and (max-width: 600px) {
.inner-body {
width: 100% !important;
}

.footer {
width: 100% !important;
}

.banner-img {
border-top-left-radius: 0 !important;
border-top-right-radius: 0 !important;
}
}

@media only screen and (max-width: 500px) {
.button {
width: 100% !important;
}
}
</style>
{!! $head ?? '' !!}
</head>
<body>

<table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td align="center">
<table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
{!! $header ?? '' !!}

<!-- Email Body -->
<tr>
<td class="body" width="100%" cellpadding="0" cellspacing="0" style="border: hidden !important; padding: 25px 0 10px 0;">
<table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="overflow: hidden; border-radius: 8px; border-collapse: separate; border: 1px solid #e4e4e7; background-color: #ffffff; margin: 0 auto;">
@if (file_exists(public_path('assets/images/email-banner.png')))
<tr>
<td style="padding: 0; margin: 0; line-height: 0; font-size: 0; border-top-left-radius: 7px; border-top-right-radius: 7px; overflow: hidden; border-bottom: 1px solid #f0f0f2;">
<a href="https://tb-nur.shop" style="display: block; width: 100%; text-decoration: none; border: 0; margin: 0; padding: 0;">
<img class="banner-img" src="https://tb-nur.shop/assets/images/email-banner.png" alt="{{ config('app.name') }}" width="570" style="width: 100%; max-width: 570px; height: auto; display: block; margin: 0; padding: 0; border: 0; outline: none; border-top-left-radius: 7px; border-top-right-radius: 7px;" />
</a>
</td>
</tr>
@endif
<!-- Body content -->
<tr>
<td class="content-cell">
{!! Illuminate\Mail\Markdown::parse($slot) !!}

{!! $subcopy ?? '' !!}
</td>
</tr>
</table>
</td>
</tr>

{!! $footer ?? '' !!}
</table>
</td>
</tr>
</table>
</body>
</html>
