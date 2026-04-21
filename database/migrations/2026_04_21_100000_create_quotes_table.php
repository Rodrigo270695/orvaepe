<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        Schema::create('quotes', function (Blueprint $table) use ($driver) {
            $table->uuid('id');
            $table->primary('id');

            $table->string('quote_number', 40)->unique();

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('status', 40);
            $table->string('currency', 3);

            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('tax_total', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2);

            $table->string('title', 255)->nullable();

            $table->string('customer_legal_name', 255)->nullable();
            $table->string('customer_document_type', 20)->nullable();
            $table->string('customer_document_number', 32)->nullable();
            $table->string('customer_email', 255)->nullable();
            $table->string('customer_phone', 30)->nullable();
            $table->text('customer_address')->nullable();

            if ($driver === 'pgsql') {
                $table->jsonb('customer_snapshot')->nullable();
                $table->jsonb('billing_snapshot')->nullable();
                $table->jsonb('metadata')->nullable();
            } else {
                $table->json('customer_snapshot')->nullable();
                $table->json('billing_snapshot')->nullable();
                $table->json('metadata')->nullable();
            }

            $table->text('notes_customer')->nullable();
            $table->text('notes_internal')->nullable();

            $table->date('valid_until')->nullable();

            $table->timestamp('sent_at')->nullable();
            $table->timestamp('responded_at')->nullable();

            $table->uuid('converted_order_id')->nullable();

            $table->string('public_share_token', 64)->nullable()->unique();

            $table->timestamps();

            $table->foreign('converted_order_id')
                ->references('id')
                ->on('orders')
                ->nullOnDelete();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('valid_until');
            $table->index('converted_order_id');
            $table->index(['customer_document_type', 'customer_document_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
