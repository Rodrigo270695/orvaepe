<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_deliveries', function (Blueprint $table) {
            $table->timestamp('collected_at')->nullable()->after('sale_amount');
            $table->index('collected_at');
        });
    }

    public function down(): void
    {
        Schema::table('product_deliveries', function (Blueprint $table) {
            $table->dropIndex(['collected_at']);
            $table->dropColumn('collected_at');
        });
    }
};
