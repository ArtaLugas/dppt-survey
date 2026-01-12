<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {

    private function tableExists(string $table): bool
    {
        $result = DB::selectOne(
            "SELECT to_regclass('public.$table') AS exists"
        );

        return ! is_null($result?->exists);
    }

    public function up(): void
    {
        // interviews
        if ($this->tableExists('interviews')) {
            DB::statement('CREATE INDEX IF NOT EXISTS interviews_status_id_index ON interviews (status_id)');
            DB::statement('CREATE INDEX IF NOT EXISTS interviews_created_by_index ON interviews (created_by)');
            DB::statement('CREATE INDEX IF NOT EXISTS interviews_status_id_created_by_index ON interviews (status_id, created_by)');
            DB::statement('CREATE INDEX IF NOT EXISTS interviews_created_at_index ON interviews (created_at)');
        }

        // audit_logs
        if ($this->tableExists('audit_logs')) {
            DB::statement('CREATE INDEX IF NOT EXISTS audit_logs_interview_id_index ON audit_logs (interview_id)');
            DB::statement('CREATE INDEX IF NOT EXISTS audit_logs_user_id_index ON audit_logs (user_id)');
            DB::statement('CREATE INDEX IF NOT EXISTS audit_logs_created_at_index ON audit_logs (created_at)');
        }

        // child tables (SAFE)
        foreach (['respondents','land_assets','buildings','plants','other_objects'] as $table) {
            if ($this->tableExists($table)) {
                DB::statement("CREATE INDEX IF NOT EXISTS {$table}_interview_id_index ON {$table} (interview_id)");
            }
        }

        // photos
        if ($this->tableExists('photos')) {
            DB::statement('CREATE INDEX IF NOT EXISTS photos_entity_type_id_entity_id_index ON photos (entity_type_id, entity_id)');
            DB::statement('CREATE INDEX IF NOT EXISTS photos_photo_type_id_index ON photos (photo_type_id)');
            DB::statement('CREATE INDEX IF NOT EXISTS photos_interview_id_index ON photos (interview_id)');
        }
    }

    public function down(): void
    {
        // Hardening is intentionally irreversible
    }
};
