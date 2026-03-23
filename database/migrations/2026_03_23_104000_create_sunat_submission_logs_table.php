<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sunat_submission_logs', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('invoice_id');
            $table->foreign('invoice_id')
                ->references('id')
                ->on('invoices')
                ->cascadeOnDelete();

            $table->unsignedInteger('attempt')->default(1);
            $table->string('channel', 20);

            $table->string('request_hash', 128)->nullable();
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->string('sunat_ticket', 100)->nullable();

            $table->string('response_code', 50)->nullable();
            $table->text('response_message')->nullable();

            $table->string('cdr_storage_path', 500)->nullable();
            $table->string('xml_signed_storage_path', 500)->nullable();
            $table->string('raw_request_ref', 500)->nullable();
            $table->string('raw_response_ref', 500)->nullable();

            $table->boolean('success')->default(false);

            $table->timestamp('created_at')->useCurrent();

            $table->index('invoice_id');
            $table->index(['invoice_id', 'attempt']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sunat_submission_logs');
    }
};
