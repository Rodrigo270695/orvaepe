<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_document_sequences', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('company_legal_profile_id');
            $table->foreign('company_legal_profile_id')
                ->references('id')
                ->on('company_legal_profiles')
                ->cascadeOnDelete();

            $table->string('document_type_code', 4);
            $table->string('serie', 10);
            $table->string('establishment_code', 10);

            $table->unsignedInteger('next_correlative')->default(1);

            $table->unsignedInteger('correlative_from')->nullable();
            $table->unsignedInteger('correlative_to')->nullable();

            $driver = Schema::getConnection()->getDriverName();
            if ($driver === 'pgsql') {
                $table->jsonb('authorization_metadata')->nullable();
            } else {
                $table->json('authorization_metadata')->nullable();
            }

            $table->boolean('is_active')->default(true)->index();

            $table->timestamps();

            $table->unique(
                [
                    'company_legal_profile_id',
                    'document_type_code',
                    'serie',
                    'establishment_code',
                ],
                'invoice_doc_seq_profile_type_serie_est_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_document_sequences');
    }
};
