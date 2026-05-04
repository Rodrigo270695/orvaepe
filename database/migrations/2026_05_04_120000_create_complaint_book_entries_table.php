<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_book_entries', function (Blueprint $table) {
            $table->id();
            $table->string('full_name', 160);
            $table->string('document_type', 24);
            $table->string('document_number', 32);
            $table->string('email', 255);
            $table->string('phone', 40)->nullable();
            $table->text('address');
            $table->boolean('is_minor')->default(false);
            $table->string('representative_full_name', 160)->nullable();
            $table->string('product_service_description', 512);
            $table->text('claim_detail');
            $table->text('request_detail');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_book_entries');
    }
};
