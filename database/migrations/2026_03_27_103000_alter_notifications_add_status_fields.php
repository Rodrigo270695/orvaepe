<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('status', 32)
                ->default('pending')
                ->after('data');

            $table->text('error')
                ->nullable()
                ->after('status');

            $table->timestamp('sent_at')
                ->nullable()
                ->after('read_at');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['status', 'error', 'sent_at']);
        });
    }
};

