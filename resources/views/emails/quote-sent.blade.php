<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cotización {{ $quote->quote_number }}</title>
</head>
<body style="font-family: system-ui, sans-serif; font-size: 15px; line-height: 1.5; color: #1f2937;">
<p>Hola,</p>
<p>Adjuntamos la cotización <strong>{{ $quote->quote_number }}</strong> en formato PDF.</p>
<p>
    <strong>Total:</strong>
    {{ strtoupper($quote->currency) }}
    {{ number_format((float) $quote->grand_total, 2, '.', ',') }}
</p>
@if($quote->title)
    <p><strong>Asunto:</strong> {{ $quote->title }}</p>
@endif
<p>Saludos,<br>{{ config('app.name') }}</p>
<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
<p style="font-size: 12px; color: #6b7280;">Si no esperabas este mensaje, puedes ignorarlo.</p>
</body>
</html>
