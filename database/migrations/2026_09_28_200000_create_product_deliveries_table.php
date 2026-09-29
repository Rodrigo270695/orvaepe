<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_deliveries', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('ruc', 11);
            $table->string('legal_name', 255);
            $table->text('product_description');
            $table->boolean('includes_igv')->default(true);
            $table->date('delivered_at');

            $table->string('invoice_path', 500)->nullable();
            $table->string('invoice_original_name', 255)->nullable();
            $table->string('xml_path', 500)->nullable();
            $table->string('xml_original_name', 255)->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index('ruc');
            $table->index('delivered_at');
            $table->index(['includes_igv', 'delivered_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_deliveries');
    }
};
