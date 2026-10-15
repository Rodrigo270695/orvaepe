<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_hub_products', function (Blueprint $table) {
            $table->id();
            $table->string('producto', 40)->unique();
            $table->string('nombre', 120)->nullable();
            $table->text('resumen')->nullable();
            $table->string('publico', 500)->nullable();
            $table->json('palabras_clave')->nullable();
            $table->string('demo_url', 255)->nullable();
            $table->string('demo_usuario', 120)->nullable();
            $table->string('demo_password', 120)->nullable();
            $table->string('registro_url', 255)->nullable();
            $table->text('instrucciones')->nullable();
            $table->timestampsTz();
        });

        Schema::create('sales_hub_sections', function (Blueprint $table) {
            $table->id();
            $table->string('producto', 40);
            $table->string('tipo', 20)->default('general');
            $table->string('titulo', 200);
            $table->text('contenido');
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestampsTz();

            $table->index(['producto', 'activo', 'orden']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_hub_sections');
        Schema::dropIfExists('sales_hub_products');
    }
};
