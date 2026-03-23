<?php

namespace App\Http\Controllers\Sunat;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sunat\InvoiceDocumentSequenceStoreRequest;
use App\Http\Requests\Sunat\InvoiceDocumentSequenceUpdateRequest;
use App\Models\CompanyLegalProfile;
use App\Models\InvoiceDocumentSequence;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;

class InvoiceDocumentSequencesController extends Controller
{
    public function store(InvoiceDocumentSequenceStoreRequest $request): RedirectResponse
    {
        $profile = CompanyLegalProfile::query()->first();

        if (!$profile) {
            return redirect('/panel/sunat-emisor')
                ->withErrors(['profile' => 'Primero completa el perfil legal en la pestaña Perfil.'])
                ->with('toast', AdminFlashToast::error('Falta el perfil legal'));
        }

        InvoiceDocumentSequence::create(array_merge(
            $request->validated(),
            [
                'company_legal_profile_id' => $profile->id,
                'is_active' => $request->boolean('is_active'),
            ],
        ));

        return redirect('/panel/sunat-emisor');
    }

    public function update(
        InvoiceDocumentSequenceUpdateRequest $request,
        InvoiceDocumentSequence $invoice_document_sequence,
    ): RedirectResponse {
        $profile = CompanyLegalProfile::query()->first();

        if (!$profile || $invoice_document_sequence->company_legal_profile_id !== $profile->id) {
            abort(404);
        }

        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');

        $invoice_document_sequence->update($data);

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Secuencia actualizada'),
        );
    }

    public function destroy(InvoiceDocumentSequence $invoice_document_sequence): RedirectResponse
    {
        $profile = CompanyLegalProfile::query()->first();

        if (!$profile || $invoice_document_sequence->company_legal_profile_id !== $profile->id) {
            abort(404);
        }

        $invoice_document_sequence->delete();

        return redirect('/panel/sunat-emisor')->with(
            'toast',
            AdminFlashToast::success('Secuencia eliminada'),
        );
    }
}
