<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('showcase_clients', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->string('legal_name', 255);
            $table->string('display_name', 255)->nullable();

            $table->string('slug', 120)->nullable()->unique();

            /** Ruta publicable: ej. `showcase-logos/acme.svg` vía `Storage::url` o `asset()`. */
            $table->string('logo_path', 500)->nullable();

            $table->string('website_url', 500)->nullable();

            /** Filtros vitrina: ej. retail, logistics, industry, services (valor libre o acotado en validación). */
            $table->string('sector', 64)->nullable();

            $table->boolean('is_published')->default(false);
            $table->unsignedInteger('sort_order')->default(0);

            $table->text('admin_notes')->nullable();

            /** Opcional: cuándo quedó documentada la autorización de marca/logo. */
            $table->timestamp('authorized_at')->nullable();

            $table->timestamps();

            $table->index(['is_published', 'sort_order']);
            $table->index('sector');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('showcase_clients');
    }
};
