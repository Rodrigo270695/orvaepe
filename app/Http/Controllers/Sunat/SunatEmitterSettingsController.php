<?php

namespace App\Http\Controllers\Sunat;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sunat\SunatEmitterSettingsUpsertRequest;
use App\Models\CompanyLegalProfile;
use App\Models\DigitalCertificate;
use App\Models\SunatEmitterSetting;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;

class SunatEmitterSettingsController extends Controller
{
    public function upsert(SunatEmitterSettingsUpsertRequest $request): RedirectResponse
    {
        $profile = CompanyLegalProfile::query()->first();

        if (!$profile) {
            return redirect('/panel/sunat-emisor')
                ->withErrors(['profile' => 'Primero completa el perfil legal en la pestaña Perfil.'])
                ->with('toast', AdminFlashToast::error('Falta el perfil legal'));
        }

        $data = $request->validated();

        if (!empty($data['default_certificate_id'])) {
            $belongs = DigitalCertificate::query()
                ->where('id', $data['default_certificate_id'])
                ->where('company_legal_profile_id', $profile->id)
                ->exists();

            if (!$belongs) {
                return redirect('/panel/sunat-emisor')
                    ->withErrors(['default_certificate_id' => 'El certificado no pertenece a este emisor.'])
                    ->with('toast', AdminFlashToast::error('Certificado no válido'));
            }
        }

        $data['is_active'] = $request->boolean('is_active');

        SunatEmitterSetting::updateOrCreate(
            ['company_legal_profile_id' => $profile->id],
            array_merge($data, ['company_legal_profile_id' => $profile->id]),
        );

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Integración SUNAT / OSE guardada'),
        );
    }
}
