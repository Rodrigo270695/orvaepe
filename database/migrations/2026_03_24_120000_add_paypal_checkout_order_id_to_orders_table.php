<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('paypal_checkout_order_id', 80)->nullable();
            $table->unique('paypal_checkout_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['paypal_checkout_order_id']);
            $table->dropColumn('paypal_checkout_order_id');
        });
    }
};
