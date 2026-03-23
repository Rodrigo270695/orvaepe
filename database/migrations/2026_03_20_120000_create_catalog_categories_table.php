<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_categories', function (Blueprint $table) {
            $table->uuid('id');
            // En Postgres, a veces `uuid(...)->primary()` no deja la PK
            // como constraint utilizable para el FK self-referencial en la misma migración.
            // Definimos la PK explícitamente para que el FK encuentre una UNIQUE/PK válida.
            $table->primary('id');

            $table->uuid('parent_id')->nullable();

            $table->string('slug', 200);
            $table->string('name', 255);
            $table->text('description')->nullable();

            $table->string('revenue_line', 80);

            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Self-referential hierarchy
            $table->foreign('parent_id')
                ->references('id')
                ->on('catalog_categories')
                ->nullOnDelete();

            // Unique slug per revenue_line "ámbito"
            $table->unique(['slug', 'revenue_line'], 'catalog_categories_slug_revenue_line_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_categories');
    }
};

