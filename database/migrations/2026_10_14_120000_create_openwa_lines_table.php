<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('openwa_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nombre', 80);
            $table->string('session_name', 50)->unique();
            $table->string('openwa_session_id', 80)->nullable();
            $table->string('status', 32)->default('created');
            $table->string('phone', 30)->nullable();
            $table->string('push_name', 120)->nullable();
            $table->jsonb('productos')->default('[]');
            $table->timestampTz('connected_at')->nullable();
            $table->timestampTz('last_synced_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('openwa_lines');
    }
};
