<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('company_legal_profile_id');
            $table->foreign('company_legal_profile_id')
                ->references('id')
                ->on('company_legal_profiles')
                ->restrictOnDelete();

            $table->uuid('invoice_document_sequence_id')->nullable();
            $table->foreign('invoice_document_sequence_id')
                ->references('id')
                ->on('invoice_document_sequences')
                ->nullOnDelete();

            $table->string('invoice_number', 64)->unique();

            $table->string('sunat_document_type_code', 4);
            $table->string('sunat_serie', 10);
            $table->string('sunat_correlative', 20);

            $table->string('sunat_filing_status', 40);

            $table->uuid('order_id');
            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->restrictOnDelete();

            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();

            $table->string('status', 40);

            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_total', 12, 2);
            $table->decimal('grand_total', 12, 2);
            $table->string('currency', 3);

            $table->string('pdf_path', 500)->nullable();
            $table->string('xml_unsigned_path', 500)->nullable();
            $table->string('xml_signed_path', 500)->nullable();
            $table->string('cdr_path', 500)->nullable();

            $table->string('sunat_response_code', 50)->nullable();
            $table->text('sunat_response_description')->nullable();

            $table->timestamp('issued_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->json('buyer_snapshot')->nullable();
            $table->json('sunat_metadata')->nullable();

            $table->timestamps();

            $table->index('company_legal_profile_id');
            $table->index('order_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('sunat_filing_status');
            $table->index('issued_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
