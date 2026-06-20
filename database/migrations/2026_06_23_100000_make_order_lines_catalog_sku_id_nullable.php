<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_lines', function (Blueprint $table): void {
            $table->uuid('catalog_sku_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('order_lines', function (Blueprint $table): void {
            $table->uuid('catalog_sku_id')->nullable(false)->change();
        });
    }
};
