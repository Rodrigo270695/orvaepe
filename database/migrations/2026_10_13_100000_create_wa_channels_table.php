<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Canal WhatsApp de cada tenant de cada producto (VetSaaS, TallerSaaS).
     * El token de Meta vive solo aquí (cifrado); los productos nunca lo reciben.
     */
    public function up(): void
    {
        Schema::create('wa_channels', function (Blueprint $table) {
            $table->uuid('id')->primary();

            /** vetsaas | tallersaas */
            $table->string('producto', 32);

            /** Id del tenant en el producto (slug o id, según el producto). */
            $table->string('tenant_id', 64);

            /** openwa | cloud. Este módulo solo envía por "cloud"; OpenWA sigue en su flujo actual. */
            $table->string('provider', 16)->default('cloud');

            /** Id del número en Meta. Llega en metadata.phone_number_id del webhook. */
            $table->string('phone_number_id', 64)->nullable()->unique();

            $table->string('waba_id', 64)->nullable();

            /** Cifrado con APP_KEY (cast "encrypted"). */
            $table->text('access_token')->nullable();

            /** activo | pausado */
            $table->string('estado', 16)->default('activo');

            $table->timestamps();

            $table->unique(['producto', 'tenant_id']);
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_channels');
    }
};
