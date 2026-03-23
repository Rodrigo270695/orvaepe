<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->string('order_number', 40)->unique();

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('status', 40);

            $table->string('currency', 3);

            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('tax_total', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2);

            $table->uuid('coupon_id')->nullable();

            $table->json('billing_snapshot')->nullable();
            $table->text('notes_internal')->nullable();

            $table->timestamp('placed_at')->nullable();

            $table->timestamps();

            $table->foreign('coupon_id')
                ->references('id')
                ->on('coupons')
                ->nullOnDelete();

            $table->index('user_id');
            $table->index('status');
            $table->index('placed_at');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
