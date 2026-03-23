<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_skus', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('catalog_product_id');

            $table->string('code', 120)->unique();
            $table->string('name', 255);
            $table->string('sale_model', 50);
            $table->string('billing_interval', 20)->nullable();
            $table->unsignedInteger('rental_days')->nullable();

            $table->decimal('list_price', 12, 2);
            $table->string('currency', 3)->default('PEN');
            $table->boolean('tax_included')->default(false);

            $table->json('limits')->nullable();
            $table->string('fulfillment_type', 40)->default('download');
            $table->json('metadata')->nullable();

            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('catalog_product_id')
                ->references('id')
                ->on('catalog_products')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_skus');
    }
};

