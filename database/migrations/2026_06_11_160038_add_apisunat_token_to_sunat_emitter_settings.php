<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sunat_emitter_settings', function (Blueprint $table) {
            // Token cifrado de API SUNAT (Lucode PSE)
            $table->text('apisunat_token_enc')->nullable()->after('sol_password_enc');
        });
    }

    public function down(): void
    {
        Schema::table('sunat_emitter_settings', function (Blueprint $table) {
            $table->dropColumn('apisunat_token_enc');
        });
    }
};
