<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Registro append-only de cambios y acciones sensibles (quién, qué entidad, antes/después).
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('action', 128);

            /** Clase o clave estable del modelo (ej. Order, LicenseKey). */
            $table->string('entity_type', 128);

            /** PK de la entidad auditada (UUID en tablas de negocio del proyecto). */
            $table->uuid('entity_id');

            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamp('created_at');

            $table->index(['entity_type', 'entity_id']);
            $table->index('user_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
