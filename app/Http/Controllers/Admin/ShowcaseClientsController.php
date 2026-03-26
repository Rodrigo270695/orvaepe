<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ShowcaseClientRequest;
use App\Models\ShowcaseClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ShowcaseClientsController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $sortBy = trim((string) $request->query('sort_by', ''));
        $sortDir = strtolower((string) $request->query('sort_dir', 'asc'));
        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'asc';
        }

        $perPage = (int) $request->query('per_page', 15);
        $allowedPerPage = [10, 15, 20, 25, 30, 40, 50];
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 15;
        }

        $query = ShowcaseClient::query();

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($sub) use ($like): void {
                $sub->where('legal_name', 'ILIKE', $like)
                    ->orWhere('display_name', 'ILIKE', $like)
                    ->orWhere('sector', 'ILIKE', $like)
                    ->orWhere('slug', 'ILIKE', $like);
            });
        }

        $allowedSortBy = [
            'is_published',
            'sort_order',
            'legal_name',
            'sector',
            'website_url',
            'authorized_at',
        ];
        if (! in_array($sortBy, $allowedSortBy, true)) {
            $sortBy = 'sort_order';
            $sortDir = 'asc';
        }

        $query->orderBy($sortBy, $sortDir)->orderBy('legal_name');

        $append = ['per_page' => $perPage];
        if ($q !== '') {
            $append['q'] = $q;
        }
        $append['sort_by'] = $sortBy;
        $append['sort_dir'] = $sortDir;

        $clients = $query
            ->paginate($perPage)
            ->appends($append);

        $maxOrder = (int) ShowcaseClient::query()->max('sort_order');
        $nextSortOrder = $maxOrder + 1;

        return Inertia::render('admin/marketing-vitrina/index', [
            'showcaseClients' => $clients,
            'next_sort_order' => $nextSortOrder,
            'filters' => [
                'q' => $q,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    public function store(ShowcaseClientRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['logo', 'logo_clear', 'sort_order']);
        $maxOrder = (int) ShowcaseClient::query()->max('sort_order');
        $data['sort_order'] = $maxOrder + 1;

        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('showcase-logos', 'public');
        }

        ShowcaseClient::create($data);

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Cliente de vitrina creado',
            ]);
    }

    public function update(ShowcaseClientRequest $request, ShowcaseClient $showcaseClient): RedirectResponse
    {
        $data = $request->safe()->except(['logo', 'logo_clear']);

        if ($request->boolean('logo_clear')) {
            if ($showcaseClient->logo_path) {
                Storage::disk('public')->delete($showcaseClient->logo_path);
            }
            $data['logo_path'] = null;
        }

        if ($request->hasFile('logo')) {
            $newPath = $request->file('logo')->store('showcase-logos', 'public');
            if ($showcaseClient->logo_path && $showcaseClient->logo_path !== $newPath) {
                Storage::disk('public')->delete($showcaseClient->logo_path);
            }
            $data['logo_path'] = $newPath;
        }

        $showcaseClient->update($data);

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Cliente de vitrina actualizado',
            ]);
    }

    public function destroy(ShowcaseClient $showcaseClient): RedirectResponse
    {
        if ($showcaseClient->logo_path) {
            Storage::disk('public')->delete($showcaseClient->logo_path);
        }

        $showcaseClient->delete();

        return redirect()
            ->to(url()->previous())
            ->with('toast', [
                'id' => (string) microtime(true),
                'type' => 'success',
                'title' => 'Registro eliminado',
            ]);
    }
}
