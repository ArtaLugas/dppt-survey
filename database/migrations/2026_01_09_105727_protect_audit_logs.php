<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        if (!Schema::hasTable('audit_logs')) {
            return;
        }

        // 1. Function (safe to re-run)
        DB::statement(<<<SQL
CREATE OR REPLACE FUNCTION prevent_audit_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'AUDIT LOG IS APPEND-ONLY';
END;
$$ LANGUAGE plpgsql;
SQL);

        // 2. Drop trigger if exists (IDEMPOTENT)
        DB::statement('DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;');
        DB::statement('DROP TRIGGER IF EXISTS audit_logs_no_delete ON audit_logs;');

        // 3. Create triggers
        DB::statement(<<<SQL
CREATE TRIGGER audit_logs_no_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_mutation();
SQL);

        DB::statement(<<<SQL
CREATE TRIGGER audit_logs_no_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_mutation();
SQL);
    }

    public function down(): void
    {
        if (!Schema::hasTable('audit_logs')) {
            return;
        }

        DB::statement('DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;');
        DB::statement('DROP TRIGGER IF EXISTS audit_logs_no_delete ON audit_logs;');
        DB::statement('DROP FUNCTION IF EXISTS prevent_audit_mutation;');
    }
};
