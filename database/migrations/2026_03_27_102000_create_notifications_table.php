<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Avisos por usuario (in-app, email u otros canales). Distinto de la tabla
     * polimórfica estándar de Laravel: aquí FK explícita a users + channel.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('type', 255);

            /** email | in_app | … */
            $table->string('channel', 32);

            $table->json('data');

            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index('channel');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
