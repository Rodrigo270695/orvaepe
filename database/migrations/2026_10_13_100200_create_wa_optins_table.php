<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Consentimiento (opt-in) de cada teléfono para recibir WhatsApp de un tenant.
     */
    public function up(): void
    {
        Schema::create('wa_optins', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('producto', 32);
            $table->string('tenant_id', 64);
            $table->string('telefono', 20);

            $table->timestamp('fecha');

            /** Dónde se obtuvo: formulario_web, recepcion, whatsapp_entrante… */
            $table->string('origen', 40);

            $table->timestamps();

            $table->unique(['producto', 'tenant_id', 'telefono']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_optins');
    }
};
