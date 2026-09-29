<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_deliveries', function (Blueprint $table) {
            $table->decimal('sale_amount', 12, 2)->default(0)->after('includes_igv');
        });
    }

    public function down(): void
    {
        Schema::table('product_deliveries', function (Blueprint $table) {
            $table->dropColumn('sale_amount');
        });
    }
};
