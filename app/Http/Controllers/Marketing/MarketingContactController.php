<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Marketing\StoreContactRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingContactController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('contact', [
            'canRegister' => Features::enabled(Features::registration()),
            'productOptions' => config('contact.product_interest_options'),
        ]);
    }

    public function store(StoreContactRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $label = $this->resolveProductLabel($data['product_interest']);

        $to = trim((string) config('contact.mail_to'));
        if ($to !== '') {
            $body = $this->buildEmailBody($data, $label);

            Mail::raw($body, function ($message) use ($to, $data) {
                $message->to($to)
                    ->replyTo($data['email'], $data['name'])
                    ->subject('Contacto web — '.$data['name']);
            });
        }

        return back()->with('status', 'Gracias. Hemos recibido tu mensaje y te responderemos pronto.');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function buildEmailBody(array $data, string $productLabel): string
    {
        $lines = [
            'Nombre: '.$data['name'],
            'Correo: '.$data['email'],
            'Teléfono: '.($data['phone'] ?? '—'),
            'Empresa / RUC: '.($data['company'] ?? '—'),
            'Interés: '.$productLabel,
            '',
            'Mensaje:',
            $data['message'],
        ];

        return implode("\n", $lines);
    }

    private function resolveProductLabel(string $value): string
    {
        foreach (config('contact.product_interest_options') as $opt) {
            if (($opt['value'] ?? '') === $value) {
                return (string) ($opt['label'] ?? $value);
            }
        }

        return $value;
    }
}
