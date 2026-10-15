<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Plantillas de WhatsApp Cloud. tenant_id null = plantilla global (WABA de ORVAE).
     * Con Embedded Signup cada clínica tendrá las suyas, creadas por API en su WABA.
     */
    public function up(): void
    {
        Schema::create('wa_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('producto', 32)->nullable();
            $table->string('tenant_id', 64)->nullable();
            $table->string('waba_id', 64)->nullable();

            /** Id de la plantilla en Meta; llega en message_template_status_update. */
            $table->string('meta_template_id', 64)->nullable()->index();

            $table->string('nombre', 128);
            $table->string('idioma', 16)->default('es_PE');

            /** vacuna | cita | control */
            $table->string('tipo', 16);

            /** pendiente | aprobada | rechazada | pausada */
            $table->string('estado', 16)->default('pendiente');

            $table->string('categoria', 32)->default('utility');
            $table->unsignedTinyInteger('num_variables')->default(0);

            /** Cuerpo con {{n}}: se envía a Meta al crearla y arma el texto para canales OpenWA. */
            $table->text('cuerpo')->nullable();

            /** Motivo de Meta al rechazar o pausar. */
            $table->text('motivo')->nullable();

            $table->timestamps();

            $table->index(['tenant_id', 'nombre']);
            $table->index(['waba_id', 'nombre', 'idioma']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_templates');
    }
};
