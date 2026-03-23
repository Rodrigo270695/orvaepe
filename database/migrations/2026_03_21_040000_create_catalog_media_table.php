<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_media', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('catalog_product_id');

            $table->string('kind', 32);
            $table->string('storage_path', 1024);
            $table->string('original_filename', 512)->nullable();
            $table->string('mime_type', 255)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();

            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('catalog_product_id')
                ->references('id')
                ->on('catalog_products')
                ->cascadeOnDelete();

            $table->index(['catalog_product_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_media');
    }
};
