<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('software_releases', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('catalog_product_id');

            $table->string('version', 80);
            $table->text('changelog')->nullable();
            $table->string('artifact_path', 512)->nullable();
            $table->string('artifact_sha256', 64)->nullable();
            $table->string('min_php_version', 20)->nullable();

            $table->boolean('is_latest')->default(false);
            $table->timestamp('released_at');

            $table->timestamps();

            $table->unique(['catalog_product_id', 'version'], 'software_releases_product_version_unique');

            $table->foreign('catalog_product_id')
                ->references('id')
                ->on('catalog_products')
                ->cascadeOnDelete();

            $table->index(['catalog_product_id', 'is_latest']);
            $table->index('released_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('software_releases');
    }
};
