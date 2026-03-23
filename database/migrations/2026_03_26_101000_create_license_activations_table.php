<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('license_activations', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('license_key_id');

            $table->string('domain', 255);
            $table->string('server_fingerprint', 255)->nullable();
            $table->string('ip_address', 45);

            $table->timestamp('last_ping_at')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->foreign('license_key_id')
                ->references('id')
                ->on('license_keys')
                ->cascadeOnDelete();

            $table->index('license_key_id');
            $table->index(['license_key_id', 'is_active']);
            $table->index('last_ping_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_activations');
    }
};
