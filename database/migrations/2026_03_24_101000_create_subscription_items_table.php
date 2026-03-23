<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_items', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('subscription_id');
            $table->foreign('subscription_id')
                ->references('id')
                ->on('subscriptions')
                ->cascadeOnDelete();

            $table->uuid('catalog_sku_id');
            $table->foreign('catalog_sku_id')
                ->references('id')
                ->on('catalog_skus')
                ->restrictOnDelete();

            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 12, 2);

            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index('subscription_id');
            $table->index('catalog_sku_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_items');
    }
};
