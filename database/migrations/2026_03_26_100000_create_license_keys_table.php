<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('license_keys', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->string('key', 255)->unique();

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->uuid('order_id')->nullable();
            $table->uuid('catalog_sku_id');

            $table->uuid('software_release_id')->nullable();
            $table->uuid('entitlement_id')->nullable();

            $table->string('status', 40);

            $table->unsignedInteger('max_activations')->default(1);
            $table->unsignedInteger('activation_count')->default(0);

            $table->timestamp('expires_at')->nullable();

            $table->timestamp('revoked_at')->nullable();
            $table->text('revoke_reason')->nullable();

            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->nullOnDelete();

            $table->foreign('catalog_sku_id')
                ->references('id')
                ->on('catalog_skus')
                ->restrictOnDelete();

            $table->foreign('software_release_id')
                ->references('id')
                ->on('software_releases')
                ->nullOnDelete();

            $table->foreign('entitlement_id')
                ->references('id')
                ->on('entitlements')
                ->nullOnDelete();

            $table->index('user_id');
            $table->index('order_id');
            $table->index('catalog_sku_id');
            $table->index('status');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_keys');
    }
};
