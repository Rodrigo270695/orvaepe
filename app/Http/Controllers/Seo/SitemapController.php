<?php

namespace App\Http\Controllers\Seo;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Support\MarketingSoftwareCatalogPresenter;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $xml = Cache::remember('seo.sitemap_xml', 3600, function (): string {
            $base = rtrim((string) config('app.url'), '/');

            $urls = [];

            foreach (config('seo.sitemap_static', []) as $path => $meta) {
                $urls[] = [
                    'loc' => $base.$path,
                    'priority' => $meta['priority'] ?? '0.8',
                    'changefreq' => $meta['changefreq'] ?? 'monthly',
                    'lastmod' => null,
                ];
            }

            $saleModels = MarketingSoftwareCatalogPresenter::OWN_SOFTWARE_SALE_MODELS;

            $productSlugs = collect();
            try {
                $productSlugs = CatalogProduct::query()
                    ->where('is_active', true)
                    ->whereHas('category', function ($q): void {
                        $q->where('is_active', true)
                            ->where('revenue_line', 'software_system');
                    })
                    ->whereHas('skus', function ($sq) use ($saleModels): void {
                        $sq->where('is_active', true)
                            ->whereIn('sale_model', $saleModels);
                    })
                    ->orderBy('updated_at', 'desc')
                    ->get(['slug', 'updated_at']);
            } catch (\Throwable $e) {
                report($e);
            }

            foreach ($productSlugs as $product) {
                $urls[] = [
                    'loc' => $base.'/software/'.$product->slug,
                    'priority' => '0.85',
                    'changefreq' => 'weekly',
                    'lastmod' => $product->updated_at?->toAtomString(),
                ];
            }

            return view('seo.sitemap-xml', [
                'urls' => $urls,
            ])->render();
        });

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
