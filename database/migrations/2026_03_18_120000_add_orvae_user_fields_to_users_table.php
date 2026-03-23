<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Usuario: login por username. Sin campo role (se usa Laravel Permission).
     * PostgreSQL: celular validado a 9 dígitos.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 255)->unique()->nullable()->after('id');
            $table->string('lastname', 255)->nullable()->after('name');
            $table->string('document_number', 20)->nullable()->after('lastname')
                ->comment('DNI (8 dígitos) o RUC (11 dígitos)');
            $table->string('phone', 9)->nullable()->after('document_number')
                ->comment('Celular Perú: 9 dígitos (sin código de país por ahora)');
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement(
                "ALTER TABLE users ADD CONSTRAINT users_phone_9_digits CHECK (phone IS NULL OR phone ~ '^[0-9]{9}$')"
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_9_digits');
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'lastname', 'document_number', 'phone']);
        });
    }
};
