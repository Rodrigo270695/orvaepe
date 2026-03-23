<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('digital_certificates', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('company_legal_profile_id');
            $table->foreign('company_legal_profile_id')
                ->references('id')
                ->on('company_legal_profiles')
                ->cascadeOnDelete();

            $table->string('label', 255);
            $table->string('storage_disk', 50);
            $table->text('storage_path');

            $table->string('certificate_thumbprint', 255)->nullable();
            $table->string('serial_number', 255)->nullable();
            $table->string('issuer_cn', 255)->nullable();

            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();

            $table->boolean('is_active')->default(true)->index();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('digital_certificates');
    }
};
