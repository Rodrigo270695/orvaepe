<?php

namespace App\Http\Controllers\Sunat;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sunat\DigitalCertificateStoreRequest;
use App\Http\Requests\Sunat\DigitalCertificateUpdateRequest;
use App\Models\CompanyLegalProfile;
use App\Models\DigitalCertificate;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;

class DigitalCertificatesController extends Controller
{
    public function store(DigitalCertificateStoreRequest $request): RedirectResponse
    {
        $profile = CompanyLegalProfile::query()->first();

        if (!$profile) {
            return redirect('/panel/sunat-emisor')
                ->withErrors(['profile' => 'Primero completa el perfil legal en la pestaña Perfil.'])
                ->with('toast', AdminFlashToast::error('Falta el perfil legal'));
        }

        DigitalCertificate::create(array_merge(
            $request->validated(),
            [
                'company_legal_profile_id' => $profile->id,
                'is_active' => $request->boolean('is_active'),
            ],
        ));

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Certificado registrado'),
        );
    }

    public function update(
        DigitalCertificateUpdateRequest $request,
        DigitalCertificate $digital_certificate,
    ): RedirectResponse {
        $profile = CompanyLegalProfile::query()->first();

        if (!$profile || $digital_certificate->company_legal_profile_id !== $profile->id) {
            abort(404);
        }

        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');

        $digital_certificate->update($data);

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Certificado actualizado'),
        );
    }

    public function destroy(DigitalCertificate $digital_certificate): RedirectResponse
    {
        $profile = CompanyLegalProfile::query()->first();

        if (!$profile || $digital_certificate->company_legal_profile_id !== $profile->id) {
            abort(404);
        }

        $digital_certificate->delete();

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Certificado eliminado'),
        );
    }
}
