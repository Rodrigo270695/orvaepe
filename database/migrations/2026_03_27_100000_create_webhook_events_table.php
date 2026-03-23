<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Eventos recibidos de pasarelas (webhooks): idempotencia, payload y estado de procesamiento.
     */
    public function up(): void
    {
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->string('gateway', 64);

            /** ID del evento en el proveedor; único junto con gateway. */
            $table->string('gateway_event_id', 255);

            $table->string('event_type', 128);

            $table->json('payload');

            $table->boolean('processed')->default(false);

            $table->timestamp('processed_at')->nullable();

            $table->text('error')->nullable();

            $table->unsignedInteger('attempts')->default(0);

            $table->timestamps();

            $table->unique(['gateway', 'gateway_event_id']);
            $table->index('gateway');
            $table->index('event_type');
            $table->index('processed');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_events');
    }
};
