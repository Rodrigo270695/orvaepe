<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wa_channels', function (Blueprint $table) {
            /** Canales provider=openwa: sesión del gateway OpenWA desde la que se envía. */
            $table->string('openwa_session_id', 128)->nullable()->after('waba_id');
        });
    }

    public function down(): void
    {
        Schema::table('wa_channels', function (Blueprint $table) {
            $table->dropColumn('openwa_session_id');
        });
    }
};
