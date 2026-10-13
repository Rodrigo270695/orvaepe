<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Mensajes WhatsApp enviados (out) y recibidos (in) por canales Cloud API.
     */
    public function up(): void
    {
        Schema::create('wa_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('wa_channel_id')->nullable()->constrained('wa_channels')->nullOnDelete();

            $table->string('producto', 32);
            $table->string('tenant_id', 64);

            /** Id del recordatorio en el producto (puede ser uuid o entero). */
            $table->string('reminder_id', 64)->nullable();

            /** wamid de Meta. */
            $table->string('provider_msg_id', 191)->nullable()->unique();

            $table->string('telefono', 20);

            /** out | in */
            $table->string('direccion', 3);

            $table->string('categoria', 40)->nullable();
            $table->string('plantilla', 100)->nullable();

            /** queued | accepted | sent | delivered | read | failed | received */
            $table->string('estado', 16);

            $table->string('error_code', 32)->nullable();
            $table->string('error_msg', 500)->nullable();

            $table->text('texto')->nullable();

            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('failed_at')->nullable();

            $table->timestamps();

            $table->index(['producto', 'tenant_id', 'telefono']);
            $table->index('reminder_id');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_messages');
    }
};
