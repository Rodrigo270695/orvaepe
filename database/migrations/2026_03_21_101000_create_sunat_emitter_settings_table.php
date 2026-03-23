<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sunat_emitter_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('company_legal_profile_id')->unique();
            $table->foreign('company_legal_profile_id')
                ->references('id')
                ->on('company_legal_profiles')
                ->cascadeOnDelete();

            $table->string('emission_mode', 50);
            $table->string('ose_provider_code', 100)->nullable();
            $table->text('api_base_url')->nullable();
            $table->string('sunat_username_hint', 32)->nullable();
            $table->string('credentials_secret_ref', 255)->nullable();

            $table->uuid('default_certificate_id')->nullable();
            $table->foreign('default_certificate_id')
                ->references('id')
                ->on('digital_certificates')
                ->nullOnDelete();

            $table->string('environment', 20);

            $driver = Schema::getConnection()->getDriverName();
            if ($driver === 'pgsql') {
                $table->jsonb('options')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('options')->default('{}');
            }

            $table->boolean('is_active')->default(true)->index();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sunat_emitter_settings');
    }
};
