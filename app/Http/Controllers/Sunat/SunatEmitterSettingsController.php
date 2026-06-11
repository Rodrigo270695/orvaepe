<?php

namespace App\Http\Controllers\Sunat;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sunat\SunatEmitterSettingsUpsertRequest;
use App\Models\CompanyLegalProfile;
use App\Models\DigitalCertificate;
use App\Models\SunatEmitterSetting;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Crypt;

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

        if (!empty($request->validated('default_certificate_id'))) {
            $belongs = DigitalCertificate::query()
                ->where('id', $request->validated('default_certificate_id'))
                ->where('company_legal_profile_id', $profile->id)
                ->exists();

            if (!$belongs) {
                return redirect('/panel/sunat-emisor')
                    ->withErrors(['default_certificate_id' => 'El certificado no pertenece a este emisor.'])
                    ->with('toast', AdminFlashToast::error('Certificado no válido'));
            }
        }

        $existing = SunatEmitterSetting::query()
            ->where('company_legal_profile_id', $profile->id)
            ->first();

        $data = [
            'company_legal_profile_id' => $profile->id,
            'emission_mode'            => $request->validated('emission_mode'),
            'environment'              => $request->validated('environment'),
            'ose_provider_code'        => $request->validated('ose_provider_code'),
            'api_base_url'             => $request->validated('api_base_url'),
            'sol_username'             => $request->validated('sol_username'),
            'default_certificate_id'   => $request->validated('default_certificate_id'),
            'is_active'                => $request->boolean('is_active'),
        ];

        // Cifrar clave SOL solo si se envió un valor nuevo
        $solPassword = $request->input('sol_password');
        if ($solPassword !== null && $solPassword !== '') {
            $data['sol_password_enc'] = Crypt::encryptString($solPassword);
        } elseif ($solPassword === '' && $existing) {
            $data['sol_password_enc'] = null;
        }

        // Cifrar token de API SUNAT solo si se envió un valor nuevo
        $apisunatToken = $request->input('apisunat_token');
        if ($apisunatToken !== null && $apisunatToken !== '') {
            $data['apisunat_token_enc'] = Crypt::encryptString($apisunatToken);
        } elseif ($apisunatToken === '' && $existing) {
            $data['apisunat_token_enc'] = null;
        }

        SunatEmitterSetting::updateOrCreate(
            ['company_legal_profile_id' => $profile->id],
            $data,
        );

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Integración SUNAT / OSE guardada'),
        );
    }
}
