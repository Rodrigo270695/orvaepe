<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sunat_boleta_daily_summaries', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('company_legal_profile_id');
            $table->foreign('company_legal_profile_id')
                ->references('id')
                ->on('company_legal_profiles')
                ->cascadeOnDelete();

            $table->date('summary_date');
            $table->string('status', 40);

            $table->unsignedInteger('line_count')->nullable();
            $table->string('ticket', 100)->nullable();
            $table->string('zip_storage_path', 500)->nullable();
            $table->string('cdr_path', 500)->nullable();
            $table->json('response_payload')->nullable();

            $table->timestamps();

            $table->unique(
                ['company_legal_profile_id', 'summary_date'],
                'sunat_boleta_daily_summaries_company_date_unique',
            );
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sunat_boleta_daily_summaries');
    }
};
