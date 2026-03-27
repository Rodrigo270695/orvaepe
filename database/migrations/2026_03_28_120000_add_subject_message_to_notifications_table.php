<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (! Schema::hasColumn('notifications', 'subject')) {
                $table->string('subject', 255)->nullable();
            }
            if (! Schema::hasColumn('notifications', 'message')) {
                $table->text('message')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'message')) {
                $table->dropColumn('message');
            }
            if (Schema::hasColumn('notifications', 'subject')) {
                $table->dropColumn('subject');
            }
        });
    }
};
