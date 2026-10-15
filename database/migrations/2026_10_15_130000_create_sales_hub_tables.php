<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('openwa_lines', function (Blueprint $table) {
            $table->boolean('bot_activo')->default(false)->after('envia_notificaciones');
            $table->string('webhook_id', 80)->nullable()->after('bot_activo');
        });

        Schema::create('sales_hub_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('openwa_line_id')->constrained('openwa_lines')->cascadeOnDelete();
            $table->string('wa_chat_id', 80);
            $table->string('phone', 30)->nullable();
            $table->string('nombre', 120)->nullable();
            $table->string('producto', 40)->nullable();
            $table->boolean('bot_activo')->default(true);
            $table->string('pausa', 10)->nullable();
            $table->string('pausa_motivo', 60)->nullable();
            $table->timestampTz('pausado_at')->nullable();
            $table->timestampTz('bot_engaged_at')->nullable();
            $table->unsignedInteger('no_leidos')->default(0);
            $table->timestampTz('last_inbound_at')->nullable();
            $table->timestampTz('last_outbound_at')->nullable();
            $table->timestampsTz();

            $table->unique(['openwa_line_id', 'wa_chat_id']);
            $table->index(['producto', 'last_inbound_at']);
        });

        Schema::create('sales_hub_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('sales_hub_conversation_id')->constrained('sales_hub_conversations')->cascadeOnDelete();
            $table->string('direccion', 3);
            $table->string('autor', 10);
            $table->string('tipo', 10)->default('texto');
            $table->text('body');
            $table->string('producto', 40)->nullable();
            $table->string('wa_message_id', 160)->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['sales_hub_conversation_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_hub_messages');
        Schema::dropIfExists('sales_hub_conversations');

        Schema::table('openwa_lines', function (Blueprint $table) {
            $table->dropColumn(['bot_activo', 'webhook_id']);
        });
    }
};
