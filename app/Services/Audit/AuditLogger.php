<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    public function log(
        string $action,
        string $entityType,
        string $entityId,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $userId = null,
        ?Request $request = null,
    ): void {
        $ctxRequest = $request ?? request();

        AuditLog::query()->create([
            'user_id' => $userId ?? Auth::id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ctxRequest instanceof Request ? $ctxRequest->ip() : null,
            'user_agent' => $ctxRequest instanceof Request ? $ctxRequest->userAgent() : null,
        ]);
    }
}
