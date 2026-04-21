<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Cotización {{ $quoteNumber }}</title>
    <style>
        @page { margin: 18mm 16mm 20mm 16mm; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9.5pt;
            color: #1f2937;
            line-height: 1.25;
        }
        .muted { color: #6b7280; font-size: 8.5pt; }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .header-table td { vertical-align: top; }
        .issuer-name {
            font-size: 14pt;
            font-weight: bold;
            color: #1a3558;
            margin: 0 0 3px 0;
        }
        .issuer-lines { margin: 0; padding: 0; }
        .issuer-lines p { margin: 0 0 1px 0; }
        .logo { max-height: 48px; max-width: 200px; }
        .doc-box {
            border: 1px solid #1a3558;
            text-align: center;
            padding: 8px 12px;
            width: 200px;
        }
        .doc-box .label {
            font-size: 10pt;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 0.06em;
        }
        .doc-box .num {
            font-size: 11pt;
            font-weight: bold;
            color: #111827;
            margin-top: 3px;
        }
        .info-wrap {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 5px 8px;
            margin-bottom: 8px;
        }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { width: 50%; vertical-align: top; padding: 1px 4px; }
        .info-label { color: #4b5563; font-size: 8pt; line-height: 1.15; margin: 0; }
        .info-val { font-weight: bold; color: #111827; font-size: 8.5pt; margin: 0 0 2px 0; line-height: 1.2; }
        .info-val.seller-display {
            font-size: 9.25pt;
            line-height: 1.3;
            letter-spacing: 0.015em;
        }
        .subject {
            font-weight: bold;
            margin: 6px 0 4px 0;
            font-size: 9.5pt;
        }
        .detail-block-title {
            color: #1a3558;
            font-weight: bold;
            font-size: 9.5pt;
            margin: 8px 0 4px 0;
            border-bottom: 3px solid #1a3558;
            padding-bottom: 2px;
        }
        .lines { width: 100%; border-collapse: collapse; margin-top: 0; }
        .lines th {
            background: #1a3558;
            color: #fff;
            font-size: 8pt;
            font-weight: bold;
            padding: 5px 3px;
            text-align: left;
        }
        .lines th.right, .lines td.right { text-align: right; }
        .lines th.center, .lines td.center { text-align: center; }
        .lines td {
            border-bottom: 1px solid #e5e7eb;
            padding: 5px 3px;
            vertical-align: top;
            font-size: 8.5pt;
        }
        .lines td.desc { line-height: 1.3; }
        .lines .line-total { font-weight: bold; }
        .totals-wrap { width: 100%; margin-top: 8px; }
        .totals { width: 280px; margin-left: auto; border-collapse: collapse; }
        .totals td { padding: 2px 4px; font-size: 9pt; }
        .totals td.lbl { color: #4b5563; }
        .totals td.amt { text-align: right; font-family: DejaVu Sans, sans-serif; }
        .totals .grand td { font-size: 11pt; font-weight: bold; border-top: 1px solid #9ca3af; padding-top: 5px; }
        .section-title {
            color: #1a3558;
            font-weight: bold;
            font-size: 10pt;
            margin: 12px 0 5px 0;
            border-bottom: 2px solid #1a3558;
            padding-bottom: 2px;
        }
        .cond-box {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 6px 10px;
            font-size: 8.5pt;
        }
        .cond-box p { margin: 0 0 3px 0; }
        /* Espacio para firma manuscrita encima de la raya */
        .sign {
            margin-top: 10mm;
            text-align: center;
        }
        .sign-pad-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0 0 2mm 0;
        }
        .sign-pad-table td {
            height: 34mm;
            border: none;
            padding: 0;
            vertical-align: bottom;
            font-size: 1px;
            line-height: 1px;
            color: #ffffff;
        }
        .sign .line {
            border-top: 1px solid #374151;
            width: 240px;
            margin: 0 auto 3px auto;
            padding-top: 5px;
        }
        .sign .name {
            font-weight: bold;
            font-size: 11pt;
            color: #111827;
            letter-spacing: 0.02em;
            line-height: 1.35;
            max-width: 90%;
            margin: 0 auto;
        }
        .sign .title { color: #6b7280; font-size: 8.5pt; margin-top: 2px; }
        .sign .company { color: #9ca3af; font-size: 8pt; margin-top: 3px; }
        .footer {
            margin-top: 10mm;
            text-align: center;
            font-size: 7.5pt;
            color: #9ca3af;
        }
    </style>
</head>
<body>
<table class="header-table">
    <tr>
        <td style="width:62%;">
            @if(!empty($logoDataUri))
                <div style="margin-bottom:4px;">
                    <img class="logo" src="{{ $logoDataUri }}" alt="Logo"/>
                </div>
            @endif
            @if($showIssuerTitleBar)
                <p class="issuer-name">{{ $issuerBannerTitle }}</p>
            @endif
            <div class="issuer-lines">
                @if(!$showIssuerTitleBar)
                    <p><span class="muted">Razón social:</span> {{ $issuerLegalName }}</p>
                @endif
                <p><span class="muted">RUC:</span> {{ $issuerRuc }}</p>
                @if($issuerAddress !== '')
                    <p><span class="muted">Dirección:</span> {{ $issuerAddress }}</p>
                @endif
                @if($issuerContact !== '')
                    <p class="muted">{{ $issuerContact }}</p>
                @endif
            </div>
        </td>
        <td style="width:38%; text-align:right;">
            <div class="doc-box" style="margin-left:auto;">
                <div class="label">COTIZACIÓN</div>
                <div class="num">{{ $quoteNumber }}</div>
            </div>
        </td>
    </tr>
</table>

<div class="info-wrap">
    <table class="info-table">
        <tr>
            <td>
                <p class="info-label">Cliente / Razón social</p>
                <p class="info-val">{{ $customerName }}</p>
                @if($customerDoc !== '')
                    <p class="info-label" style="margin-top:2px;">{{ $customerDocLabel }}</p>
                    <p class="info-val">{{ $customerDoc }}</p>
                @endif
                @if($customerContact !== '')
                    <p class="info-label" style="margin-top:2px;">Contacto</p>
                    <p class="info-val">{{ $customerContact }}</p>
                @endif
            </td>
            <td>
                <p class="info-label">Fecha de emisión</p>
                <p class="info-val">{{ $issuedAt }}</p>
                <p class="info-label" style="margin-top:2px;">Vencimiento</p>
                <p class="info-val">{{ $validUntil }}</p>
                <p class="info-label" style="margin-top:2px;">Vendedor</p>
                <p class="info-val seller-display">{{ $sellerName }}</p>
            </td>
        </tr>
    </table>
</div>

@if($subject !== '')
    <p class="subject">Asunto: {{ $subject }}</p>
@endif

<div class="detail-block-title">DETALLE DE PRODUCTOS</div>

<table class="lines">
    <thead>
    <tr>
        <th class="center" style="width:4%;">#</th>
        <th style="width:14%;">Código</th>
        <th style="width:36%;">Descripción</th>
        <th class="center" style="width:8%;">Cant.</th>
        <th class="center" style="width:8%;">U.M.</th>
        <th class="right" style="width:14%;">P.Unit.</th>
        <th class="right" style="width:16%;">Total</th>
    </tr>
    </thead>
    <tbody>
    @foreach($lines as $row)
        <tr>
            <td class="center">{{ $row['n'] }}</td>
            <td>{{ $row['code'] }}</td>
            <td class="desc">{!! $row['desc_html'] !!}</td>
            <td class="center">{{ $row['qty'] }}</td>
            <td class="center">{{ $row['uom'] }}</td>
            <td class="right">{{ $row['unit'] }}</td>
            <td class="right line-total">{{ $row['total'] }}</td>
        </tr>
    @endforeach
    </tbody>
</table>

<table class="totals-wrap"><tr><td>
    <table class="totals">
        <tr>
            <td class="lbl">Sub Total Ventas</td>
            <td class="amt">{{ $moneySubtotal }}</td>
        </tr>
        @if($hasDiscount)
            <tr>
                <td class="lbl">Descuentos</td>
                <td class="amt">{{ $moneyDiscount }}</td>
            </tr>
        @endif
        <tr>
            <td class="lbl">IGV / impuestos</td>
            <td class="amt">{{ $moneyTax }}</td>
        </tr>
        <tr class="grand">
            <td class="lbl">TOTAL</td>
            <td class="amt">{{ $moneyGrand }}</td>
        </tr>
    </table>
</td></tr></table>

<div class="section-title">CONDICIONES</div>
<div class="cond-box">
    <p><strong>Validez:</strong> {{ $validityText }}</p>
    <p><strong>Forma de pago:</strong> {{ $paymentTerms }}</p>
    @if($notesCustomer !== '')
        <p style="margin-top:4px;"><strong>Notas:</strong> {{ $notesCustomer }}</p>
    @endif
</div>

<div class="sign">
    <table class="sign-pad-table">
        <tr>
            <td>&nbsp;</td>
        </tr>
    </table>
    <div class="line">
        <div class="name">{{ $signatoryName }}</div>
        <div class="title">{{ $signatoryTitle }}</div>
        <div class="company">{{ $issuerLegalName }}</div>
    </div>
</div>

<div class="footer">
    Cotización generada el {{ $generatedAt }}
</div>
</body>
</html>
