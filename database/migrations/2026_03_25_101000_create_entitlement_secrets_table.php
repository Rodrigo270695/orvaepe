<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entitlement_secrets', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('entitlement_id');

            $table->string('kind', 40);
            $table->string('label', 255)->nullable();
            $table->string('public_ref', 255)->nullable();

            $table->text('secret_ciphertext')->nullable();

            $table->timestamp('expires_at')->nullable();
            $table->timestamp('rotated_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('last_used_at')->nullable();

            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->foreign('entitlement_id')
                ->references('id')
                ->on('entitlements')
                ->cascadeOnDelete();

            $table->index('entitlement_id');
            $table->index('kind');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entitlement_secrets');
    }
};
