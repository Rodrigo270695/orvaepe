<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Contraseña cifrada del certificado .p12/.pfx
        Schema::table('digital_certificates', function (Blueprint $table) {
            $table->text('password_enc')->nullable()->after('is_active');
        });

        // Usuario SOL real (secundario) y clave SOL cifrada para emisión directa
        Schema::table('sunat_emitter_settings', function (Blueprint $table) {
            $table->string('sol_username', 100)->nullable()->after('sunat_username_hint');
            $table->text('sol_password_enc')->nullable()->after('sol_username');
        });
    }

    public function down(): void
    {
        Schema::table('digital_certificates', function (Blueprint $table) {
            $table->dropColumn('password_enc');
        });

        Schema::table('sunat_emitter_settings', function (Blueprint $table) {
            $table->dropColumn(['sol_username', 'sol_password_enc']);
        });
    }
};
