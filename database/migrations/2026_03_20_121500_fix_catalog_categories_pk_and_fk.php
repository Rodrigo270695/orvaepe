<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Asegura PK en `id` para que Postgres acepte el FK self-referencial.
        DB::statement(<<<'SQL'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'catalog_categories'::regclass
          AND contype = 'p'
    ) THEN
        ALTER TABLE catalog_categories
        ADD CONSTRAINT catalog_categories_id_pk PRIMARY KEY (id);
    END IF;
END $$;
SQL);

        // Asegura el FK parent_id -> id (ON DELETE SET NULL).
        DB::statement(<<<'SQL'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'catalog_categories_parent_id_foreign'
    ) THEN
        ALTER TABLE catalog_categories
        ADD CONSTRAINT catalog_categories_parent_id_foreign
        FOREIGN KEY (parent_id)
        REFERENCES catalog_categories(id)
        ON DELETE SET NULL;
    END IF;
END $$;
SQL);
    }

    public function down(): void
    {
        DB::statement(<<<'SQL'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'catalog_categories_parent_id_foreign'
    ) THEN
        ALTER TABLE catalog_categories
        DROP CONSTRAINT catalog_categories_parent_id_foreign;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'catalog_categories_id_pk'
    ) THEN
        ALTER TABLE catalog_categories
        DROP CONSTRAINT catalog_categories_id_pk;
    END IF;
END $$;
SQL);
    }
};

