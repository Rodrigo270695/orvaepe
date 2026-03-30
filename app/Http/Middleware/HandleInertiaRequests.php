<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use App\Support\MarketingLicenseNavGroups;
use App\Support\MarketingServicesNavGroups;
use App\Support\MarketingSoftwareNavLinks;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'seo' => [
                'siteUrl' => rtrim((string) config('app.url'), '/'),
                'siteName' => (string) config('seo.site_name'),
                'defaultDescription' => (string) config('seo.default_description'),
                'defaultImage' => (string) config('seo.default_og_image'),
                'defaultOgImageAlt' => (string) config('seo.default_og_image_alt'),
                'ogImageWidth' => (int) config('seo.og_image_width'),
                'ogImageHeight' => (int) config('seo.og_image_height'),
                'logoPath' => (string) config('seo.logo_path'),
                'locale' => (string) config('seo.locale'),
                'alternateLocale' => (string) config('seo.hreflang'),
                'twitterHandle' => config('seo.twitter_handle'),
                'siteSearchUrlTemplate' => config('seo.site_search_url_template'),
                'geoRegion' => (string) config('seo.geo_region'),
                'geoPlacename' => (string) config('seo.geo_placename'),
                'organizationDescription' => (string) config('seo.organization.description'),
                'organizationLegalName' => config('seo.organization.legal_name'),
                'organizationAlternateNames' => array_values(array_filter((array) config('seo.organization.alternate_names', []))),
                'organizationEmail' => config('seo.organization.email'),
                'organizationPhone' => config('seo.organization.phone'),
                'organizationSameAs' => array_values(array_filter((array) config('seo.organization.same_as', []))),
                'organizationKnowsAbout' => array_values(array_filter((array) config('seo.organization.knows_about', []))),
                'organizationSchemaTypes' => array_values(array_filter((array) config('seo.organization.schema_types', []))),
            ],
            'auth' => [
                'user' => $request->user(),
                'roles' => fn () => $request->user()?->getRoleNames()->values()->all() ?? [],
            ],
            'flash' => [
                'toast' => fn () => $request->session()->get('toast'),
                'status' => fn () => $request->session()->get('status'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'softwareNavLinks' => MarketingSoftwareNavLinks::all(),
            'licenseNavGroups' => MarketingLicenseNavGroups::all(),
            'serviceNavGroups' => MarketingServicesNavGroups::all(),
            'contact' => [
                'whatsapp_e164' => (string) config('contact.whatsapp_e164'),
            ],
            'staffUnreadNotificationsCount' => fn () => $request->user()?->hasRole('superadmin')
                ? Notification::query()->whereNull('read_at')->count()
                : 0,
        ];
    }
}
