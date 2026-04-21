<?php

namespace App\Mail;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuoteSentToCustomerMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  string  $pdfBinary  Contenido binario del PDF
     */
    public function __construct(
        public Quote $quote,
        public string $pdfBinary,
        public string $pdfFileName,
    ) {}

    public function envelope(): Envelope
    {
        $num = $this->quote->quote_number;

        return new Envelope(
            subject: 'Cotización '.$num,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.quote-sent',
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfBinary, $this->pdfFileName)
                ->withMime('application/pdf'),
        ];
    }
}
