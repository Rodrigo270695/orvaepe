<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_lines', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('order_id');

            $table->uuid('catalog_sku_id');

            $table->string('product_name_snapshot', 255);
            $table->string('sku_name_snapshot', 255);

            $table->unsignedInteger('quantity')->default(1);

            $table->decimal('unit_price', 12, 2);
            $table->decimal('line_discount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('line_total', 12, 2);

            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->cascadeOnDelete();

            $table->foreign('catalog_sku_id')
                ->references('id')
                ->on('catalog_skus')
                ->restrictOnDelete();

            $table->index('order_id');
            $table->index('catalog_sku_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_lines');
    }
};
