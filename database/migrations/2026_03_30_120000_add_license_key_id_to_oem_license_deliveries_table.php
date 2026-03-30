<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Vincula cada entrega OEM a la fila concreta de license_keys (necesario si quantity > 1 en la línea).
     */
    public function up(): void
    {
        Schema::table('oem_license_deliveries', function (Blueprint $table) {
            $table->uuid('license_key_id')->nullable()->after('order_line_id');
            $table->foreign('license_key_id')
                ->references('id')
                ->on('license_keys')
                ->nullOnDelete();
            $table->unique('license_key_id');
        });
    }

    public function down(): void
    {
        Schema::table('oem_license_deliveries', function (Blueprint $table) {
            $table->dropForeign(['license_key_id']);
            $table->dropUnique(['license_key_id']);
            $table->dropColumn('license_key_id');
        });
    }
};
