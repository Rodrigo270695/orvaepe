<?php

namespace App\Http\Controllers\Seo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class RobotsController extends Controller
{
    public function __invoke(): Response
    {
        $base = rtrim((string) config('app.url'), '/');
        $sitemap = $base.'/sitemap.xml';

        $lines = [
            'User-agent: *',
            'Allow: /',
            '',
            '# Áreas privadas y flujos transaccionales',
            'Disallow: /dashboard',
            'Disallow: /panel/',
            'Disallow: /cliente/',
            'Disallow: /login',
            'Disallow: /register',
            'Disallow: /forgot-password',
            'Disallow: /reset-password',
            'Disallow: /email/verify',
            'Disallow: /settings/',
            'Disallow: /checkout/',
            'Disallow: /carrito',
            'Disallow: /two-factor-challenge',
            '',
            "Sitemap: {$sitemap}",
            '',
        ];

        return response(implode("\n", $lines), 200)
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
