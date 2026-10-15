<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Datos del número conectado por Embedded Signup.
     * estado ahora también puede ser "pendiente" (conectado, plantillas aún sin aprobar).
     */
    public function up(): void
    {
        Schema::table('wa_channels', function (Blueprint $table) {
            $table->string('display_phone_number', 32)->nullable()->after('waba_id');
            $table->string('verified_name', 128)->nullable()->after('display_phone_number');

            /** PIN de verificación en dos pasos usado al registrar el número. Cifrado (cast "encrypted"). */
            $table->text('registration_pin')->nullable()->after('access_token');
        });
    }

    public function down(): void
    {
        Schema::table('wa_channels', function (Blueprint $table) {
            $table->dropColumn(['display_phone_number', 'verified_name', 'registration_pin']);
        });
    }
};
