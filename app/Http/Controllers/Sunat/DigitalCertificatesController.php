<?php

namespace App\Http\Controllers\Sunat;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sunat\DigitalCertificateStoreRequest;
use App\Http\Requests\Sunat\DigitalCertificateUpdateRequest;
use App\Models\CompanyLegalProfile;
use App\Models\DigitalCertificate;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

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

        $file = $request->file('certificate_file');
        $path = $file->store('certs', 'local');

        $passwordEnc = null;
        if ($request->filled('certificate_password')) {
            $passwordEnc = Crypt::encryptString($request->input('certificate_password'));
        }

        DigitalCertificate::create([
            'company_legal_profile_id' => $profile->id,
            'label'                    => $request->validated('label'),
            'storage_disk'             => 'local',
            'storage_path'             => $path,
            'password_enc'             => $passwordEnc,
            'is_active'                => $request->boolean('is_active'),
        ]);

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

        $data = [
            'label'     => $request->validated('label') ?? $digital_certificate->label,
            'is_active' => $request->boolean('is_active'),
        ];

        if ($request->hasFile('certificate_file')) {
            // Borrar el archivo anterior y subir el nuevo
            Storage::disk('local')->delete($digital_certificate->storage_path);

            $file = $request->file('certificate_file');
            $data['storage_path'] = $file->store('certs', 'local');
            $data['storage_disk'] = 'local';
        }

        if ($request->has('certificate_password')) {
            $pwd = $request->input('certificate_password');
            $data['password_enc'] = $pwd !== null && $pwd !== ''
                ? Crypt::encryptString($pwd)
                : null;
        }

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

        Storage::disk('local')->delete($digital_certificate->storage_path);
        $digital_certificate->delete();

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Certificado eliminado'),
        );
    }
}
