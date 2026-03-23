<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Entregas OEM opcionales (Windows/Office/Canva, etc.): una fila por línea de pedido
     * cuando en el futuro se gestione clave o payload del proveedor.
     */
    public function up(): void
    {
        Schema::create('oem_license_deliveries', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('order_line_id');

            $table->string('vendor', 120);

            /** Clave legible o texto cifrado; alternativa genérica a un JSON en activation_payload. */
            $table->text('license_code')->nullable();
            /** JSON o blob (activación, token, respuesta del proveedor). */
            $table->text('activation_payload')->nullable();

            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            /** pending | delivered | revoked */
            $table->string('status', 32)->default('pending');

            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->foreign('order_line_id')
                ->references('id')
                ->on('order_lines')
                ->cascadeOnDelete();

            $table->index('order_line_id');
            $table->index('vendor');
            $table->index('status');
            $table->index('delivered_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oem_license_deliveries');
    }
};
