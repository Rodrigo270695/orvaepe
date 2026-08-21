<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

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

        if (! Schema::hasTable((new AuditLog)->getTable())) {
            return;
        }

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
