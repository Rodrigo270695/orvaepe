<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Google · ORVAE</title>
    <style>
        body {
            font-family: system-ui, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #1c1410;
            color: #f5f0eb;
        }
        p { font-size: 14px; opacity: 0.85; }
    </style>
</head>
<body>
    <p>{{ $status === 'success' ? 'Sesión iniciada. Cerrando…' : 'No se pudo completar el acceso. Cerrando…' }}</p>
    <script>
        (function () {
            var payload = {
                type: 'orvae:google-oauth',
                status: @json($status),
                redirectTo: @json($redirectTo),
                error: @json($error),
            };

            if (window.opener && !window.opener.closed) {
                window.opener.postMessage(payload, window.location.origin);
            }

            window.close();

            setTimeout(function () {
                if (!window.closed && payload.redirectTo) {
                    window.location.href = payload.redirectTo;
                }
            }, 400);
        })();
    </script>
</body>
</html>
