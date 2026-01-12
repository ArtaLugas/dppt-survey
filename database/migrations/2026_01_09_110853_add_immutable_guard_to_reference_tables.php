<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        // 1. Function global (safe to re-run)
        DB::statement(<<<SQL
CREATE OR REPLACE FUNCTION prevent_reference_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'REFERENCE TABLE IS IMMUTABLE';
END;
$$ LANGUAGE plpgsql;
SQL);

        // 2. Reference tables yang BENAR-BENAR ADA
        $tables = [
            'interview_statuses',
            'user_roles',
            // tambahkan hanya jika sudah ada:
            // 'photo_types',
            // 'entity_types',
        ];

        foreach ($tables as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            DB::statement("DROP TRIGGER IF EXISTS {$table}_immutable_guard ON {$table};");

            DB::statement("
                CREATE TRIGGER {$table}_immutable_guard
                BEFORE UPDATE OR DELETE ON {$table}
                FOR EACH ROW
                EXECUTE FUNCTION prevent_reference_mutation();
            ");
        }
    }

    public function down(): void
    {
        $tables = [
            'interview_statuses',
            'user_roles',
        ];

        foreach ($tables as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            DB::statement("DROP TRIGGER IF EXISTS {$table}_immutable_guard ON {$table};");
        }

        DB::statement('DROP FUNCTION IF EXISTS prevent_reference_mutation');
    }
};
