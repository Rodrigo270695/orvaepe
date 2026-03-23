<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entitlements', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->uuid('catalog_product_id');
            $table->uuid('catalog_sku_id')->nullable();

            $table->uuid('order_id')->nullable();
            $table->uuid('order_line_id')->nullable();
            $table->uuid('subscription_id')->nullable();

            $table->string('status', 40);

            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('revoked_at')->nullable();

            $table->text('revoke_reason')->nullable();

            $table->json('feature_flags')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->foreign('catalog_product_id')
                ->references('id')
                ->on('catalog_products')
                ->restrictOnDelete();

            $table->foreign('catalog_sku_id')
                ->references('id')
                ->on('catalog_skus')
                ->nullOnDelete();

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->nullOnDelete();

            $table->foreign('order_line_id')
                ->references('id')
                ->on('order_lines')
                ->nullOnDelete();

            $table->foreign('subscription_id')
                ->references('id')
                ->on('subscriptions')
                ->nullOnDelete();

            $table->index('user_id');
            $table->index('catalog_product_id');
            $table->index('status');
            $table->index('starts_at');
            $table->index('ends_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entitlements');
    }
};
