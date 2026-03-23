<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catalog_skus', function (Blueprint $table) {
            $table->boolean('igv_applies')->default(true)->after('tax_included');
        });
    }

    public function down(): void
    {
        Schema::table('catalog_skus', function (Blueprint $table) {
            $table->dropColumn('igv_applies');
        });
    }
};
