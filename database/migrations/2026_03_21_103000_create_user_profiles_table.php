<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Datos fiscales del cliente (complementa `users` para facturación SUNAT).
     *
     * @see orvae-database-migrations.md — `user_profiles`
     */
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('company_name', 255)->nullable();
            $table->string('legal_name', 255)->nullable();
            $table->string('ruc', 11)->nullable();
            $table->string('tax_status', 100)->nullable();
            $table->string('billing_email', 255)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('country', 2)->default('PE');
            $table->string('city', 150)->nullable();
            $table->text('address')->nullable();

            $driver = Schema::getConnection()->getDriverName();
            if ($driver === 'pgsql') {
                $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('metadata')->default('{}');
            }

            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
