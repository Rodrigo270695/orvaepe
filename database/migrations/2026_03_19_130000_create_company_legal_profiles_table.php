<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_legal_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('slug', 100)->unique();

            $table->string('legal_name', 255);
            $table->string('trade_name', 255)->nullable();
            $table->string('ruc', 11)->unique();
            $table->string('tax_regime', 100)->nullable();

            $table->text('address_line')->nullable();

            $table->string('district', 150)->nullable();
            $table->string('province', 150)->nullable();
            $table->string('department', 150)->nullable();
            $table->string('ubigeo', 6)->nullable();

            $table->string('country', 2)->default('PE');
            $table->string('phone', 20)->nullable();
            $table->string('support_email', 255)->nullable();
            $table->string('website', 255)->nullable();

            $table->string('logo_path', 500)->nullable();
            $table->boolean('is_default_issuer')->default(false)->index();

            $driver = Schema::getConnection()->getDriverName();
            if ($driver === 'pgsql') {
                $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"));
            } else {
                // Compatibilidad básica para pruebas con sqlite.
                $table->json('metadata')->default('{}');
            }

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_legal_profiles');
    }
};

