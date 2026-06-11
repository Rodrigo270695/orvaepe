<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoice_lines', function (Blueprint $table) {
            // Catálogo 03 SUNAT: unidad de medida (ZZ = Servicio, NIU = Unidades, etc.)
            $table->string('unit_measure_code', 10)
                ->default('ZZ')
                ->after('quantity');
        });
    }

    public function down(): void
    {
        Schema::table('invoice_lines', function (Blueprint $table) {
            $table->dropColumn('unit_measure_code');
        });
    }
};
