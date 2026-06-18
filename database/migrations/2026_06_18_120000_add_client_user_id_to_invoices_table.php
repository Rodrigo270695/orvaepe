<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->foreignId('client_user_id')
                ->nullable()
                ->after('user_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->index('client_user_id');
        });

        // order_id puede ser null cuando se emite sin orden asociada
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_order_id_foreign');
            DB::statement('ALTER TABLE invoices ALTER COLUMN order_id DROP NOT NULL');
            DB::statement('ALTER TABLE invoices ADD CONSTRAINT invoices_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL');
        }

        // Comprobantes ya emitidos con orden: vincular al cliente del pedido
        $invoiceIds = DB::table('invoices')
            ->whereNull('client_user_id')
            ->whereNotNull('order_id')
            ->pluck('order_id', 'id');

        foreach ($invoiceIds as $invoiceId => $orderId) {
            $userId = DB::table('orders')->where('id', $orderId)->value('user_id');

            if ($userId !== null) {
                DB::table('invoices')
                    ->where('id', $invoiceId)
                    ->update(['client_user_id' => $userId]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['client_user_id']);
            $table->dropColumn('client_user_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_order_id_foreign');
            DB::statement('ALTER TABLE invoices ALTER COLUMN order_id SET NOT NULL');
            DB::statement('ALTER TABLE invoices ADD CONSTRAINT invoices_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT');
        }
    }
};
