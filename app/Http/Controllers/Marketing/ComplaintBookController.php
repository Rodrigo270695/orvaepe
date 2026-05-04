<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Marketing\StoreComplaintBookEntryRequest;
use App\Models\ComplaintBookEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class ComplaintBookController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('public/libro-reclamaciones', [
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }

    public function store(StoreComplaintBookEntryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $isMinor = filter_var($data['is_minor'] ?? false, FILTER_VALIDATE_BOOLEAN);

        ComplaintBookEntry::query()->create([
            'full_name' => $data['full_name'],
            'document_type' => $data['document_type'],
            'document_number' => $data['document_number'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'],
            'is_minor' => $isMinor,
            'representative_full_name' => $isMinor ? ($data['representative_full_name'] ?? null) : null,
            'product_service_description' => $data['product_service_description'],
            'claim_detail' => $data['claim_detail'],
            'request_detail' => $data['request_detail'],
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 512),
        ]);

        $to = trim((string) config('contact.mail_to'));
        if ($to !== '') {
            $body = $this->buildEmailBody($data);
            Mail::raw($body, function ($message) use ($to, $data): void {
                $message->to($to)
                    ->replyTo($data['email'], $data['full_name'])
                    ->subject('Libro de reclamaciones — '.$data['full_name']);
            });
        }

        return back()->with(
            'status',
            'Tu reclamo fue registrado. Conserva una copia de la información enviada. Te contactaremos por los medios indicados si corresponde.',
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function buildEmailBody(array $data): string
    {
        $docLabel = match ($data['document_type']) {
            'dni' => 'DNI',
            'ce' => 'Carné de extranjería',
            'pasaporte' => 'Pasaporte',
            'ruc' => 'RUC',
            default => 'Otro documento',
        };

        $minor = filter_var($data['is_minor'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $lines = [
            'Nuevo registro desde el Libro de reclamaciones virtual del sitio web.',
            '',
            'Nombre: '.$data['full_name'],
            'Documento: '.$docLabel.' '.$data['document_number'],
            'Correo: '.$data['email'],
            'Teléfono: '.($data['phone'] ?? '—'),
            'Domicilio: '.$data['address'],
            'Menor de edad: '.($minor ? 'Sí' : 'No'),
        ];

        if ($minor && ! empty($data['representative_full_name'])) {
            $lines[] = 'Padre/madre/tutor: '.$data['representative_full_name'];
        }

        $lines[] = '';
        $lines[] = 'Producto o servicio: '.$data['product_service_description'];
        $lines[] = '';
        $lines[] = 'Detalle del reclamo:';
        $lines[] = $data['claim_detail'];
        $lines[] = '';
        $lines[] = 'Pedido concreto:';
        $lines[] = $data['request_detail'];

        return implode("\n", $lines);
    }
}
