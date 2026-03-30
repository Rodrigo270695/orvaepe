<?php

namespace App\Http\Middleware;

use App\Services\Audit\AuditLogger;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AuditHttpRequests
{
    public function __construct(
        private readonly AuditLogger $auditLogger,
    ) {}

    /**
     * Registra auditoría a nivel HTTP para cualquier acción de controlador.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startedAt = microtime(true);
        $response = $next($request);

        $route = $request->route();
        if ($route === null) {
            return $response;
        }

        $controllerAction = (string) ($route->getActionName() ?? '');
        if (
            $controllerAction === ''
            || $controllerAction === 'Closure'
            || ! str_starts_with($controllerAction, 'App\\Http\\Controllers\\')
        ) {
            return $response;
        }

        $routeName = (string) ($route->getName() ?? '');
        $action = $this->buildActionName($request->method(), $routeName, $controllerAction);

        $this->auditLogger->log(
            action: $action,
            entityType: $this->entityTypeFromAction($controllerAction),
            entityId: (string) Str::uuid(),
            oldValues: null,
            newValues: [
                'http' => [
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'route_name' => $routeName !== '' ? $routeName : null,
                    'action' => $controllerAction,
                    'status' => $response->getStatusCode(),
                    'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
                ],
                'route_params' => $route->parameters(),
                'query' => $this->sanitizeArray($request->query()),
                'input' => $this->sanitizeArray($request->except(['password', 'password_confirmation'])),
            ],
            request: $request,
        );

        return $response;
    }

    private function buildActionName(string $method, string $routeName, string $controllerAction): string
    {
        $base = $routeName !== ''
            ? 'http.'.strtolower($method).'.'.$routeName
            : 'http.'.strtolower($method).'.'.$controllerAction;

        return Str::limit($base, 128, '');
    }

    private function entityTypeFromAction(string $controllerAction): string
    {
        $class = Str::before($controllerAction, '@');

        return Str::limit(class_basename($class), 128, '');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function sanitizeArray(array $data): array
    {
        $sensitivePattern = '/password|token|secret|authorization|cookie|signature|key/i';
        $maxStringLen = 1000;

        $walk = function (mixed $value, string $key = '') use (&$walk, $sensitivePattern, $maxStringLen): mixed {
            if (preg_match($sensitivePattern, $key) === 1) {
                return '[redacted]';
            }

            if (is_array($value)) {
                $out = [];
                foreach ($value as $k => $v) {
                    $out[(string) $k] = $walk($v, (string) $k);
                }

                return $out;
            }

            if (is_object($value)) {
                return '[object]';
            }

            if (is_string($value)) {
                return mb_strlen($value) > $maxStringLen
                    ? mb_substr($value, 0, $maxStringLen).'…'
                    : $value;
            }

            return $value;
        };

        return $walk($data);
    }
}
