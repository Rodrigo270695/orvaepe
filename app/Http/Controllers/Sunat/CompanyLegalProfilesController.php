<?php

namespace App\Http\Controllers\Sunat;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sunat\CompanyLegalProfileUpsertRequest;
use App\Models\CompanyLegalProfile;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CompanyLegalProfilesController extends Controller
{
    public function index(Request $request): Response
    {
        $profile = CompanyLegalProfile::query()
            ->with([
                'digitalCertificates' => fn ($q) => $q
                    ->orderBy('label'),
                'sunatEmitterSetting',
                'invoiceDocumentSequences' => fn ($q) => $q
                    ->orderBy('document_type_code')
                    ->orderBy('serie'),
            ])
            ->orderByDesc('is_default_issuer')
            ->orderBy('created_at')
            ->first();

        return Inertia::render('admin/emisor/index', [
            'profile' => $profile,
        ]);
    }

    public function store(CompanyLegalProfileUpsertRequest $request): RedirectResponse
    {
        $data = $request->validated();

        /** @var CompanyLegalProfile $profile */
        $profile = CompanyLegalProfile::create($data);

        if (!empty($data['is_default_issuer'])) {
            CompanyLegalProfile::query()
                ->where('id', '!=', $profile->id)
                ->update(['is_default_issuer' => false]);
        }

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Perfil legal registrado'),
        );
    }

    /**
     * Singleton: PATCH /panel/sunat-emisor (sin {id})
     * Crea si no existe; si existe actualiza.
     */
    public function upsert(CompanyLegalProfileUpsertRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_default_issuer'] = true;

        $profile = CompanyLegalProfile::query()
            ->orderByDesc('is_default_issuer')
            ->orderBy('created_at')
            ->first();

        if ($request->hasFile('logo')) {
            // Reemplazo seguro: si sube nuevo logo, eliminamos el anterior.
            if ($profile?->logo_path) {
                Storage::disk('public')->delete($profile->logo_path);
            }

            $data['logo_path'] = $request->file('logo')
                ->store('company-logos', 'public');
        }

        if ($profile) {
            $profile->update($data);
        } else {
            $profile = CompanyLegalProfile::create($data);
        }

        // Asegura que exista solo un default.
        CompanyLegalProfile::query()
            ->where('id', '!=', $profile->id)
            ->update(['is_default_issuer' => false]);

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Perfil legal guardado'),
        );
    }

    public function update(
        CompanyLegalProfileUpsertRequest $request,
        CompanyLegalProfile $company_legal_profile,
    ): RedirectResponse {
        $data = $request->validated();

        $company_legal_profile->update($data);

        if (!empty($data['is_default_issuer'])) {
            CompanyLegalProfile::query()
                ->where('id', '!=', $company_legal_profile->id)
                ->update(['is_default_issuer' => false]);
        }

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Perfil legal actualizado'),
        );
    }

    public function destroy(CompanyLegalProfile $company_legal_profile): RedirectResponse
    {
        $company_legal_profile->delete();

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Perfil legal eliminado'),
        );
    }
}

