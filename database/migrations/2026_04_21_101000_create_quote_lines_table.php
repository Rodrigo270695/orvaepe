<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        Schema::create('quote_lines', function (Blueprint $table) use ($driver) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('quote_id');

            $table->uuid('catalog_sku_id')->nullable();
            $table->uuid('catalog_product_id')->nullable();

            $table->string('product_name_snapshot', 255);
            $table->string('sku_name_snapshot', 255)->nullable();

            $table->unsignedInteger('quantity')->default(1);

            $table->decimal('unit_price', 12, 2);
            $table->boolean('tax_included')->default(false);
            $table->boolean('igv_applies')->default(true);
            $table->decimal('tax_rate', 8, 4)->nullable();

            $table->decimal('line_discount', 12, 2)->default(0);
            $table->decimal('line_discount_percent', 5, 2)->nullable();

            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('line_total', 12, 2);

            $table->unsignedInteger('sort_order')->nullable();

            if ($driver === 'pgsql') {
                $table->jsonb('metadata')->nullable();
            } else {
                $table->json('metadata')->nullable();
            }

            $table->timestamps();

            $table->foreign('quote_id')
                ->references('id')
                ->on('quotes')
                ->cascadeOnDelete();

            $table->foreign('catalog_sku_id')
                ->references('id')
                ->on('catalog_skus')
                ->restrictOnDelete();

            $table->foreign('catalog_product_id')
                ->references('id')
                ->on('catalog_products')
                ->restrictOnDelete();

            $table->index('quote_id');
            $table->index('catalog_sku_id');
            $table->index('catalog_product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_lines');
    }
};
